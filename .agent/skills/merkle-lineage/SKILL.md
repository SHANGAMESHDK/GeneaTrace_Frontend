# Merkle Lineage & Integrity Skill
Role: Maintain cryptographic proof of product lineage and detect data tampering.

Guidelines:
1. Model the lineage graph as a Directed Acyclic Graph (DAG) using NetworkX or Python adjacency dicts.
2. Calculate node hash deterministically:
   node_hash = sha256(canonical_json(metadata) + sorted_parent_hashes)
3. Implement an append-only witness log storing state root hashes signed with an Ed25519 private key.
4. Provide a verification function that traverses the DAG and flags broken hashes or witness signature mismatches immediately.