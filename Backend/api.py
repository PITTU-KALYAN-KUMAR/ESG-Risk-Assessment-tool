from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import pdfplumber
from src.analyze_text import analyze_text
from src.esg_scorecard import perform_analysis

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        print(f"📄 Opened {pdf_path} with {len(pdf.pages)} pages")
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            print(f"📃 Page {i + 1}: {'✅ Text' if page_text else '❌ No text'}")
            if page_text:
                text += page_text + "\n"
    return text

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the uploaded file
    upload_folder = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, file.filename)
    print(f"Saving file to: {file_path}")  # Debugging statement
    file.save(file_path)

    # Extract text from the uploaded file
    try:
        text = extract_text_from_pdf(file_path)
        print(f"Extracted text: {text[:100]}")  # Debugging statement

        if text.strip():
            # Save extracted text to extracted_text.txt
            extracted_text_path = os.path.join(os.getcwd(), 'src', 'extracted_text.txt')
            with open(extracted_text_path, 'w', encoding='utf-8') as f:
                f.write(text)

            # Perform dynamic analysis using esg_scorecard.py
            perform_analysis(extracted_text_path)

            # Perform additional analysis using analyze_text.py
            analyze_text(extracted_text_path)

            return jsonify({"message": "File uploaded and analysis completed"}), 200
        else:
            return jsonify({"error": "No text found in the PDF"}), 400
    except Exception as e:
        print(f"Error during file upload: {e}")  # Debugging statement
        return jsonify({"error": str(e)}), 500

@app.route('/api/esg-summary', methods=['GET'])
def get_esg_summary():
    with open('src/esg_final_scorecard.txt', 'r') as file:
        data = file.read()
    return jsonify({"summary": data})

@app.route('/api/esg-analysis', methods=['GET'])
def get_esg_analysis():
    df = pd.read_csv('src/esg_full_analysis.csv')
    # Rename columns to match frontend expectations
    df = df.rename(columns={
        "Category": "category",
        "Weighted ESG Risk Score": "score",
        "Risk Percentage (%)": "risk_percentage"
    })
    return jsonify(df.to_dict(orient='records'))  # Convert DataFrame to list of dictionaries

@app.route('/api/esg-risk-level', methods=['GET'])
def get_esg_risk_level():
    with open('src/company_esg_risk_level.txt', 'r') as file:
        data = file.read()
    return jsonify({"risk_level": data})

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the ESG Risk Assessment API"})

if __name__ == '__main__':
    app.run(debug=True)