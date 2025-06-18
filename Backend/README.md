  ESG Risk Assessment Tool

The ESG Risk Assessment Tool is a Python-based backend that analyzes textual company data (like reports or disclosures) to extract and evaluate potential Environmental, Social, and Governance (ESG) risks. It uses NLP (spaCy) and keyword severity scoring to produce ESG risk scores and risk level classification.

Folder Structure
esg-risk-assessment-tool/
│
├── extracted_text.txt # Input file with company-related text data
├── esg_full_analysis.csv # CSV file with full ESG score analysis
├── esg_final_scorecard.txt # Summary of ESG category-wise scoring
├── company_esg_risk_level.txt # Final company-level risk classification
├── your_script.py # Your Python code (e.g., risk_analyzer.py)
├── README.md

Requirements

pip install spacy pandas numpy tabulate
python -m spacy download en_core_web_sm

How to Run
Place your input file:
Add your company’s textual data into a file called extracted_text.txt.

Run the script:

python esg_scorecard.py


Output files generated:

esg_final_scorecard.txt: Summary of ESG keyword matches and risk scores.

esg_full_analysis.csv: Detailed category-wise risk score breakdown.

company_esg_risk_level.txt: Overall risk level (Low / Medium / High Risk).

ESG Risk Levels
The tool categorizes a company’s ESG risk into three levels based on keyword severity and frequency:

Low Risk (score ≤ 30)

Medium Risk (31–70)

High Risk (score > 70)

 Connect to Frontend Dashboard
You can integrate this backend with any dashboard or frontend app by:

Sharing the output files (CSV or TXT)

Converting the output into JSON and sending it via API (Flask/FastAPI for REST)

🤝 Collaboration
This project is part of a team effort to build a complete ESG analyzer tool with a frontend dashboard. Clone or fork the repo and contribute!
