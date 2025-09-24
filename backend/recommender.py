import os
import pandas as pd
import re
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load the pre-trained sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Function to clean text
def clean_text(text):
    text = re.sub(r'\(adsbygoogle=window\.adsbygoogle\|\|\[\]\)\.push\(\{\}\);', '', text)
    text = re.sub(r'Table of Contents', '', text)
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = text.lower().strip()
    return text

# Function to extract state
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

# Generate personalized query
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
    
    # Use customState if state is 'Other', else use state
    state = profile.get('customState', profile.get('state', 'india')) if profile.get('state') == 'Other' else profile.get('state', 'india')
    query = f"{base} for {', '.join(qualifiers)} in {state}"
    return query

# Recommendation function
def recommend_schemes(query, top_n=5, state_filter=None):
    cleaned_query = clean_text(query)
    query_embedding = model.encode([cleaned_query])
    try:
        df = pd.read_pickle('schemes_with_embeddings.pkl').copy()
    except FileNotFoundError:
        return [], "Error: 'schemes_with_embeddings.pkl' not found."
    
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

# Flask API endpoint for recommendations
@app.route('/recommend', methods=['GET', 'POST'])
def get_recommendations():
    if request.method == 'GET':
        return jsonify({
            'message': "This endpoint expects POST requests with user profile data."
        }), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Extract profile
        profile = {
            'name': data.get('name', ''),
            'age_group': data.get('age_group', ''),
            'gender': data.get('gender', ''),
            'occupation': data.get('occupation', ''),
            'income_level': data.get('income_level', ''),
            'state': data.get('state', ''),
            'customState': data.get('customState', '')
        }
        
        # Validate required fields
        required_fields = ['name', 'age_group', 'gender', 'occupation', 'income_level', 'state']
        if profile['state'] == 'Other':
            required_fields.append('customState')
        missing_fields = [field for field in required_fields if not profile[field]]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Determine state for filtering
        state_filter = extract_state(profile['customState'] if profile['state'] == 'Other' else profile['state'])
        if not state_filter:
            return jsonify({'error': f'Invalid state: {profile["state"]}'}), 400
        
        query = generate_personalized_query(profile)
        recommendations, message = recommend_schemes(query, top_n=5, state_filter=state_filter)
        
        return jsonify({
            'query': query,
            'recommendations': recommendations,
            'message': message,
            'name': profile['name']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    if not os.path.exists('schemes_with_embeddings.pkl'):
        print("Error: 'schemes_with_embeddings.pkl' not found. Run previous steps to generate embeddings.")
        exit()
    
    print("Starting Flask API server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
