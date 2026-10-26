# Recall Analytics & Blast Radius Skill
Role: Perform sub-10ms forward/backward impact analysis during defective batch injection.

Guidelines:
1. Forward Trace: Given a defective Batch ID, run BFS traversal down to all finished product serial numbers.
2. Backward Trace: Given a returned defective product serial, trace up to all constituent material lots and machine IDs.
3. Blast-Radius Report: Compute and compare:
   - Blanket Recall Cost: Total units produced in window × unit scrap value.
   - Precision Recall Cost: Only affected serialized units quarantined × unit scrap value.
   - Total Cost Saved (INR).