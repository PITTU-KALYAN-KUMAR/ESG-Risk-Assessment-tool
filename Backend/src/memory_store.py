# src/memory_store.py

memory_store = {
    "extracted_text": "",             # Full extracted text from PDF
    "scorecard": [],                  # List of dictionaries for ESG scorecard
    "summary_text": "",               # Summary report (string)
    "risk_level": "",                 # Final risk level (string)
    "analysis_table": None,           # pandas DataFrame for full ESG analysis
    "risk_sentences": [],            # List of ESG risk-related sentences
    "keyword_counts": {}             # Counter of ESG keyword occurrences
}
