import os
import pandas as pd
import re
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

model = SentenceTransformer('all-MiniLM-L6-v2')

def clean_text(text):
    text = re.sub(r'\(adsbygoogle=window\.adsbygoogle\|\|\[\]\)\.push\(\{\}\);', '', text)
    text = re.sub(r'Table of Contents', '', text)
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = text.lower().strip()
    return text

def extract_scheme_names_from_text(raw_text):
    cleaned = clean_text(raw_text)
    
    pattern = r'(?:AP|YSR|Jagananna)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Deevena|Nestam|Mitra|Vasati|Vidya|Illu)\s*(?:Scheme)?(?:\s+(?:Phase\s+\d+|2020))?'
    matches = re.findall(pattern, cleaned, re.IGNORECASE)
    
    clean_names = [re.sub(r'\s+', ' ', match.strip()).title() for match in matches]
    unique_names = list(set(clean_names))  
    
    return unique_names

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
    
    state = profile.get('customState', profile.get('state', 'india')) if profile.get('state') == 'Other' else profile.get('state', 'india')
    query = f"{base} for {', '.join(qualifiers)} in {state}"
    return query

def recommend_schemes(query, top_n=15, state_filter=None): 
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
    df = df[df['similarity'] > 0.3]  
    top_schemes = df.nlargest(top_n, 'similarity')[['state', 'scheme_name', 'description', 'similarity']]
    
    results = top_schemes.to_dict(orient='records')
    message = f"Found {len(results)} recommendations." if results else "No recommendations found."
    
    if filtered:
        print(f"Debug: Applied filter - results limited to {state_filter}.")
    
    return results, message

@app.route('/all-schemes', methods=['GET'])
def get_all_schemes():
    try:
        if not os.path.exists('schemes_cleaned.csv'):
            return jsonify({'error': "'schemes_cleaned.csv' not found. Ensure it's in the same directory."}), 404
        
        df = pd.read_csv('schemes_cleaned.csv')
        print(f"Debug: Loaded {len(df)} schemes from CSV.")  
        
        required_cols = ['state', 'scheme_name', 'description']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({'error': f'Missing required columns in CSV: {", ".join(missing_cols)}'}), 400
        
        schemes = df[required_cols].to_dict('records')
        
        processed_schemes = []
        for i, scheme in enumerate(schemes):
            desc = scheme['description'].lower()
            
            category = df.loc[df.index == i, 'category'].iloc[0] if 'category' in df.columns else 'General Welfare'
            if pd.isna(category) or category == 'General Welfare':  
                if 'education' in desc or 'student' in desc or 'scholarship' in desc:
                    category = 'Education'
                elif 'health' in desc or 'hospital' in desc:
                    category = 'Healthcare'
                elif 'farm' in desc or 'agri' in desc:
                    category = 'Agriculture'
                elif 'employ' in desc or 'skill' in desc:
                    category = 'Employment'                     
                elif 'house' in desc or 'home' in desc:
                    category = 'Housing'
                elif 'women' in desc or 'girl' in desc:
                    category = 'Women Welfare'
            
           
            benefits_str = df.loc[df.index == i, 'benefits'].iloc[0] if 'benefits' in df.columns else None
            benefits = eval(benefits_str) if benefits_str and pd.notna(benefits_str) else ['Government Support']
            
            
            eligibility = df.loc[df.index == i, 'eligibility'].iloc[0] if 'eligibility' in df.columns else 'Check Eligibility'
            if pd.isna(eligibility):
                eligibility = 'Check Eligibility'
            
            
            amount = df.loc[df.index == i, 'amount'].iloc[0] if 'amount' in df.columns else None
            if pd.isna(amount):
                amount_match = re.search(r'rs\.?\s*(\d+(?:,\d+)?)', desc, re.IGNORECASE)
                amount = int(amount_match.group(1).replace(',', '')) if amount_match else 10000
            
            scheme['id'] = i + 1
            scheme['category'] = category
            scheme['benefits'] = benefits
            scheme['eligibility'] = eligibility
            scheme['amount'] = int(amount) if amount else 10000
            scheme['state_formatted'] = scheme['state'].replace('-', ' ').title() if scheme['state'] else 'National'
            
            processed_schemes.append(scheme)
        
        return jsonify({'schemes': processed_schemes})
    except Exception as e:
        print(f"Error in /all-schemes: {str(e)}")  
        return jsonify({'error': str(e)}), 500

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
        
       
        profile = {
            'name': data.get('name', ''),
            'age_group': data.get('age_group', ''),
            'gender': data.get('gender', ''),
            'occupation': data.get('occupation', ''),
            'income_level': data.get('income_level', ''),
            'state': data.get('state', ''),
            'customState': data.get('customState', '')
        }
        
    
        required_fields = ['name', 'age_group', 'gender', 'occupation', 'income_level', 'state']
        if profile['state'] == 'Other':
            required_fields.append('customState')
        missing_fields = [field for field in required_fields if not profile[field]]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        state_filter = extract_state(profile['customState'] if profile['state'] == 'Other' else profile['state'])
        if not state_filter:
            return jsonify({'error': f'Invalid state: {profile["state"]}'}), 400
        
        query = generate_personalized_query(profile)
        recommendations, message = recommend_schemes(query, top_n=15, state_filter=state_filter)  # Updated to 15
        
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
        print("Warning: 'schemes_with_embeddings.pkl' not found. /recommend may fail. Regenerate from CSV if needed.")
    if not os.path.exists('schemes_cleaned.csv'):
        print("Error: 'schemes_cleaned.csv' not found. /all-schemes will fail.")
        exit()
    
    print("Starting Flask API server...")
    app.run(debug=True, host='0.0.0.0', port=5000)