import spacy
import pandas as pd
import numpy as np
from datetime import datetime
import re
import os

from src.memory_store import memory_store

def perform_analysis(text: str):
    # Step 1: Load extracted text
    text = text.lower()
    memory_store["extracted_text"] = text

    # Step 2: Load SpaCy NLP model
    nlp = spacy.load("en_core_web_sm")
    nlp.max_length = 2000000  # Increase the limit to 2,000,000 characters
    doc = nlp(text)

    # Step 3: ESG keywords with severity weights
    esg_risk_keywords = {
        "Environmental": {
            "pollution": 2, "emission": 2, "toxic": 3, "waste": 1, "contamination": 3,
            "leak": 2, "climate": 2, "greenhouse": 2, "scarcity": 2, "depletion": 2,
            "deforestation": 3, "carbon": 2, "spill": 2, "violation": 2, "fine": 1,
            "fined": 1, "penalty": 2, "cleanup": 1, "remediation": 1, "liability": 2,
            "harm": 2, "destruction": 3, "extinction": 3, "endangered": 2, "habitat loss": 3,
            "flood": 2, "drought": 2, "storm": 2, "wildfire": 3, "temperature": 1,
            "warming": 2, "rising": 1, "shortage": 2, "overuse": 1, "unsustainable": 2,
            "degradation": 3, "non-compliance": 2, "illegal": 3, "unauthorized": 2,
            "banned": 2, "restricted": 1, "hazardous": 3, "dangerous": 3, "risky": 2,
            "unsafe": 2, "uncontrolled": 3
        },
        "Social": {
            "harassment": 3, "abuse": 3, "discrimination": 3, "accident": 2, "injury": 2,
            "fatality": 3, "death": 3, "violence": 3, "assault": 3, "strike": 1,
            "protest": 1, "boycott": 1, "dispute": 2, "conflict": 2, "unrest": 2,
            "opposition": 1, "lawsuit": 2, "complaint": 2, "allegation": 2, "claim": 1,
            "charged": 2, "sued": 2, "prosecuted": 3, "child labor": 3, "forced labor": 3,
            "slavery": 3, "trafficking": 3, "underpaid": 2, "unpaid": 2, "overtime": 1,
            "overwork": 1, "exhaustion": 1, "stress": 1, "burnout": 1, "turnover": 1,
            "quit": 1, "fired": 2, "terminated": 2, "laid off": 2, "downsized": 1,
            "restructured": 1, "closure": 1, "inequality": 2, "unfair": 2, "bias": 2,
            "exclusion": 2, "retaliation": 3, "whistleblower": 2, "breach": 2, "hack": 3,
            "stolen": 3, "exposed": 2, "compromised": 2
        },
        "Governance": {
            "corruption": 3, "bribery": 3, "fraud": 3, "embezzlement": 3, "theft": 3,
            "stealing": 3, "misuse": 2, "criminal": 3, "prosecuted": 3, "charged": 3,
            "arrested": 3, "convicted": 3, "sentenced": 3, "sanctions": 3,
            "investigation": 2, "probe": 2, "inquiry": 2, "audit": 1, "review": 1,
            "examination": 1, "scrutiny": 1, "litigation": 2, "court": 2, "trial": 2,
            "settlement": 1, "judgment": 2, "misconduct": 3, "malpractice": 3,
            "negligence": 3, "failure": 2, "default": 2, "manipulation": 3,
            "insider trading": 3, "conflict": 2, "undisclosed": 3, "hidden": 2,
            "secret": 2, "falsified": 3, "misrepresented": 2, "overstated": 2,
            "understated": 2, "concealed": 3, "withheld": 2, "resignation": 1,
            "dismissed": 2, "removed": 2, "suspended": 2, "replaced": 1, "crisis": 3,
            "scandal": 3, "controversy": 2, "accusation": 2
        }
    }

    # Step 4: Score Calculation
    lemmas = [token.lemma_ for token in doc]
    total_weighted_score = 0
    total_keyword_matches = 0
    analysis_data = []

    for category, keywords in esg_risk_keywords.items():
        weighted_score = 0
        total_count = 0
        matched_keywords = 0

        for kw, severity in keywords.items():
            count = text.count(kw) if " " in kw else lemmas.count(nlp(kw)[0].lemma_)
            score = count * severity
            weighted_score += score
            total_count += count
            if count > 0:
                matched_keywords += 1

        total_weighted_score += weighted_score
        total_keyword_matches += total_count

        analysis_data.append({
            "Category": category,
            "Total ESG Terms Matched": total_count,
            "Weighted ESG Risk Score": weighted_score,
            "Unique Keywords Matched": matched_keywords,
            "Total Keywords in Dictionary": len(keywords)
        })

    # Step 5: Add Percentages
    for entry in analysis_data:
        entry["Risk Percentage (%)"] = round((entry["Weighted ESG Risk Score"] / total_weighted_score) * 100, 2) if total_weighted_score else 0
        entry["Term Percentage (%)"] = round((entry["Total ESG Terms Matched"] / total_keyword_matches) * 100, 2) if total_keyword_matches else 0


    # Step 6: Save scorecard summary
    df = pd.DataFrame(analysis_data)
    memory_store["scorecard"] = analysis_data
    memory_store["analysis_table"] = df
    
    # Step 7: Determine company ESG risk level
    if total_weighted_score <= 30:
        risk_level = "Low Risk"
    elif total_weighted_score <= 70:
        risk_level = "Medium Risk"
    else:
        risk_level = "High Risk"
    memory_store["risk_level"] = risk_level
    # Step 9: Save company ESG risk summary
    company_match = re.search(r"(?:company\s*name\s*[:\-]?\s*|^)([A-Z][a-zA-Z&,\s]+(?:Inc|Ltd|Corporation|Corp|LLC|Group|Co\.|Limited))", text, re.IGNORECASE)
    company_name = company_match.group(1).strip() if company_match else "Unknown"
    summary = f"""Company ESG Risk Summary Report
====================================
Company Name       : {company_name}
Date of Analysis   : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Total ESG Terms    : {total_keyword_matches}
Total Weighted ESG Score : {total_weighted_score}
Final ESG Risk Level      : {risk_level}
"""
    memory_store["summary_text"] = summary