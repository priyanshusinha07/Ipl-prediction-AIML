from flask import Flask, request, jsonify, send_from_directory
import pickle
import pandas as pd
from flask_cors import CORS
import os
import traceback

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# Load the model
model_path = 'pipe.pkl'
model_exists = os.path.exists(model_path)
pipe = None

if model_exists:
    try:
        pipe = pickle.load(open(model_path, 'rb'))
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")
        traceback.print_exc()
else:
    print(f"Warning: Model file '{model_path}' not found!")

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Serve index.html
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    # Check if model is loaded
    if pipe is None:
        return jsonify({
            'error': f'Model not loaded. Please ensure {model_path} exists and is valid.'
        }), 500
    
    try:
        # Get data from request
        data = request.json
        
        # Validate required fields
        required_fields = ['batting_team', 'bowling_team', 'city', 'target', 'score', 'overs', 'wickets']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Extract data
        batting_team = data['batting_team']
        bowling_team = data['bowling_team']
        selected_city = data['city']
        
        # Convert numeric values
        try:
            target = float(data['target'])
            score = float(data['score'])
            overs = float(data['overs'])
            wickets = float(data['wickets'])
        except ValueError:
            return jsonify({'error': 'Invalid numeric values provided'}), 400
        
        # Validate values
        if target <= 0:
            return jsonify({'error': 'Target must be greater than 0'}), 400
        if score < 0:
            return jsonify({'error': 'Score cannot be negative'}), 400
        if score > target:
            return jsonify({'error': 'Score cannot be greater than target'}), 400
        if overs < 0 or overs > 20:
            return jsonify({'error': 'Overs must be between 0 and 20'}), 400
        if wickets < 0 or wickets > 10:
            return jsonify({'error': 'Wickets must be between 0 and 10'}), 400
        
        # Calculate derived features
        runs_left = target - score
        balls_left = 120 - (overs * 6)
        wickets_left = 10 - wickets
        crr = score / overs if overs > 0 else 0
        rrr = (runs_left * 6) / balls_left if balls_left > 0 else float('inf')
        
        # Create DataFrame for prediction
        input_df = pd.DataFrame({
            'batting_team': [batting_team],
            'bowling_team': [bowling_team],
            'city': [selected_city],
            'runs_left': [runs_left],
            'balls_left': [balls_left],
            'wickets': [wickets_left],
            'total_runs_x': [target],
            'crr': [crr],
            'rrr': [rrr]
        })
        
        # Make prediction
        result = pipe.predict_proba(input_df)
        loss = result[0][0]
        win = result[0][1]
        
        # Return prediction
        return jsonify({
            'batting_team_win_probability': round(win * 100),
            'bowling_team_win_probability': round(loss * 100),
            'match_stats': {
                'runs_left': int(runs_left),
                'balls_left': int(balls_left),
                'wickets_left': int(wickets_left),
                'current_run_rate': round(crr, 2),
                'required_run_rate': round(rrr, 2) if rrr != float('inf') else 'N/A'
            }
        })
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
