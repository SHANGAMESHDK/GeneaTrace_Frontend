# Entity Resolution Skill
Role: Ingest heterogeneous production data from ERP, MES, and SCADA simulators.

Guidelines:
1. Normalize identifiers (strip hyphens, underscores, whitespace, uppercase all tokens).
2. Waterfall Matching Strategy:
   - Tier 1: Exact match on canonical key (Confidence = 1.0)
   - Tier 2: Normalized regex match (Confidence = 0.95)
   - Tier 3: Levenshtein token similarity via rapidfuzz (Confidence = 0.60 - 0.85)
   - Tier 4: SCADA sensor join based on timestamp falling within the MES work-order execution window.
3. Any record with Confidence < 0.70 must be directed to an in-memory Review Queue.