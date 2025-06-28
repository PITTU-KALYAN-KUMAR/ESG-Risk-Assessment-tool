import re
from collections import Counter
from src.memory_store import memory_store

def analyze_text(text: str):
    # Step 1: Load ESG extracted text
    text = text.lower()

    # Step 2: Define ESG red flag keywords
    risk_keywords = [
        # Environmental
        "pollution", "contamination", "spill", "leak", "emission", "toxic", "waste", 
        "dumping", "violation", "breach", "fine", "fined", "penalty", "cleanup", 
        "remediation", "liability", "damage", "harm", "destruction", "deforestation",
        "extinction", "endangered", "habitat loss", "carbon", "greenhouse", "climate",
        "flood", "drought", "storm", "wildfire", "temperature", "warming", "rising",
        "scarcity", "depletion", "shortage", "overuse", "unsustainable", "degradation",
        "non-compliance", "illegal", "unauthorized", "banned", "restricted", "hazardous",
        "dangerous", "risky", "unsafe", "uncontrolled",

        # Social
        "discrimination", "harassment", "abuse", "exploitation", "accident", "injury",
        "fatality", "death", "violence", "assault", "strike", "protest", "boycott",
        "dispute", "conflict", "unrest", "opposition", "lawsuit", "complaint",
        "allegation", "claim", "charged", "sued", "prosecuted", "child labor",
        "forced labor", "slavery", "trafficking", "underpaid", "unpaid", "overtime",
        "overwork", "exhaustion", "stress", "burnout", "turnover", "quit", "fired",
        "terminated", "laid off", "downsized", "restructured", "closure", "inequality",
        "unfair", "bias", "exclusion", "retaliation", "whistleblower", "hack", "stolen",
        "exposed", "compromised",

        # Governance
        "corruption", "bribery", "fraud", "embezzlement", "theft", "stealing", "misuse",
        "criminal", "arrested", "convicted", "sentenced", "sanctions", "investigation",
        "probe", "inquiry", "audit", "review", "examination", "scrutiny", "litigation",
        "court", "trial", "settlement", "judgment", "misconduct", "malpractice",
        "negligence", "failure", "default", "manipulation", "insider trading",
        "undisclosed", "hidden", "secret", "falsified", "misrepresented", "overstated",
        "understated", "concealed", "withheld", "resignation", "dismissed", "removed",
        "suspended", "replaced", "crisis", "scandal", "controversy", "accusation"
    ]

    # Step 3: Extract sentences with red-flag keywords
    sentences = re.split(r'(?<=[.!?])\s+', text)
    risky_sentences = [s.strip() for s in sentences if any(kw in s for kw in risk_keywords)]

    # Step 4: Count keyword occurrences using regex word-boundary matching
    keyword_pattern = r'\b(' + '|'.join(re.escape(kw) for kw in risk_keywords) + r')\b'
    matches = re.findall(keyword_pattern, text)
    keyword_counts = Counter(matches)

    # Step 5: Save risk-related sentences
    with open("risk_sentences.txt", "w", encoding="utf-8") as f:
        f.write("\n\n".join(risky_sentences))

    # Step 6: Print summary
    memory_store["risk_sentences"] = risky_sentences
    memory_store["risk_keywords_count"] = keyword_counts
