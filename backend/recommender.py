import os
import pandas as pd
import re
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify
app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')
def clean_text(text):
    text = re.sub(r'\(adsbygoogle=window\.adsbygoogle\|\|\[\]\)\.push\(\{\}\);', '', text)
    text = re.sub(r'Table of Contents', '', text)
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = text.lower().strip()
    return text
def extract_state(state_input):
    states = [
        ('andhra pradesh', 'andhrapradesh'), ('arunachal pradesh', 'arunachalpradesh'), ('assam', 'assam'),
        ('bihar', 'bihar'), ('chhattisgarh', 'chhattisgarh'), ('goa', 'goa'), ('gujarat', 'gujarat'),
        ('haryana', 'haryana'), ('himachal pradesh', 'himachalpradesh'), ('jharkhand', 'jharkhand'),
        ('karnataka', 'karnataka'), ('kerala', 'kerala'), ('madhya pradesh', 'madhyapradesh'),
        ('maharashtra', 'maharashtra'), ('manipur', 'manipur'), ('meghalaya', 'meghalaya'),
        ('mizoram', 'mizoram'), ('nagaland', 'nagaland'), ('odisha', 'odisha'), ('punjab', 'punjab'),
        ('rajasthan', 'rajasthan'), ('sikkim', 'sikkim'), ('tamil nadu', 'tamilnadu'),
        ('telangana', 'telangana'), ('tripura', 'tripura'), ('uttar pradesh', 'uttarpradesh'),
        ('uttarakhand', 'uttarakhand'), ('west bengal', 'westbengal')
    ]
    state_lower = state_input.lower().replace('-', '').replace(' ', '')
    for state_name, state_normalized in states:
        if state_name.replace(' ', '') in state_lower or state_normalized in state_lower:
            return state_normalized 
    return None

def generate_personalized_query(profile):
    base_queries = {
        'student': 'free education scholarships for students',
        'farmer': 'agriculture loans subsidies crop insurance for farmers',
        'employed': 'skill development employment schemes for workers'
    }
    base = base_queries.get(profile.get('occupation', '').lower(), 'welfare schemes')
    
    qualifiers = []
    if profile.get('age_group', '').lower() in ['student', 'young adult']:
        qualifiers.append('young')
    if profile.get('gender', '').lower() == 'female':
        qualifiers.append('women or girls')
    if profile.get('income_level', '').lower() == 'low':
        qualifiers.append('poor or low-income')
    
    query = f"{base} for {', '.join(qualifiers)} in {profile.get('state', 'india')}"
    return query
def recommend_schemes(query, top_n=5, state_filter=None):
    cleaned_query = clean_text(query)
    query_embedding = model.encode([cleaned_query])
    df = pd.read_pickle('schemes_with_embeddings.pkl').copy()
    
    filtered = False
    if state_filter:
        df['state_norm'] = df['state'].str.replace('-', '').str.lower()
        state_norm = state_filter.lower().replace('-', '')
        df_filtered = df[df['state_norm'] == state_norm]
        print(f"Debug: Filtering for state '{state_filter}' (normalized: '{state_norm}'). Found {len(df_filtered)} schemes.")
        if not df_filtered.empty:
            df = df_filtered
            filtered = True
        else:
            return [], f"No schemes found for state: {state_filter.replace('-', ' ').title()}"
    
    scheme_embeddings = np.array(df['embeddings'].tolist())
    similarities = cosine_similarity(query_embedding, scheme_embeddings)[0]
    df['similarity'] = similarities
    df = df[df['similarity'] > 0.5]
    top_schemes = df.nlargest(top_n, 'similarity')[['state', 'scheme_name', 'description', 'similarity']]
    
    results = top_schemes.to_dict(orient='records')
    message = f"Found {len(results)} recommendations." if results else "No recommendations found."
    
    if filtered:
        print(f"Debug: Applied filter - results limited to {state_filter}.")
    
    return results, message
@app.route('/recommend', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        profile = {
            'age_group': data.get('age_group', ''),
            'gender': data.get('gender', ''),
            'occupation': data.get('occupation', ''),
            'income_level': data.get('income_level', ''),
            'state': data.get('state', '')
        }
        
        query = generate_personalized_query(profile)
        state_filter = extract_state(profile['state'])
        
        recommendations, message = recommend_schemes(query, top_n=5, state_filter=state_filter)
        
        return jsonify({
            'query': query,
            'recommendations': recommendations,
            'message': message
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == "__main__":
    if not os.path.exists('schemes_with_embeddings.pkl'):
        print("Error: 'schemes_with_embeddings.pkl' not found. Run previous steps to generate embeddings.")
        exit()
    
    print("Government Scheme Recommender Ready!")
    print("Enter 'profile' for personalized recommendations, or a direct query. Type 'quit' to exit.\n")
    
    while True:
        user_input = input("Your input: ").strip()
        if user_input.lower() == 'quit':
            print("Exiting...")
            break
        
        if user_input.lower() == 'profile':
            profile = {
                'age_group': input("Enter age group (e.g., 'student' for 18-25, 'young adult' for 25-35, 'adult' for 35+): ").strip().lower(),
                'gender': input("Enter gender (e.g., 'female', 'male', 'other'): ").strip().lower(),
                'occupation': input("Enter occupation/sector (e.g., 'student', 'farmer', 'employed'): ").strip().lower(),
                'income_level': input("Enter income level (e.g., 'low', 'middle', 'high'): ").strip().lower(),
                'state': input("Enter state (e.g., 'tamil nadu'): ").strip().lower()
            }
            print(f"Profile saved: {profile}")
            query = generate_personalized_query(profile)
            print(f"\nGenerated Query: '{query}'\n")
            state_filter = extract_state(profile['state'])
            recommendations, message = recommend_schemes(query, top_n=5, state_filter=state_filter)
        else:
            state_filter = extract_state(user_input)
            recommendations, message = recommend_schemes(user_input, top_n=5, state_filter=state_filter)
            query = user_input
        
        if recommendations:
            print(f"\nTop 5 Personalized Recommendations for: '{query}'" + (f" (based on profile, filtered to {state_filter})" if 'profile' in user_input.lower() else "") + "\n")
            print(pd.DataFrame(recommendations).to_string(index=False))
        else:
            print(f"No recommendations found: {message}")
        
        print("\n" + "-"*80 + "\n")