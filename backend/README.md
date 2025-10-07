# Phase 7 Content-Addressed Storage Test

This change verifies that:
1. Only Backend is built (BACKEND_SHA changes)
2. Frontend build is skipped (FRONTEND_SHA unchanged)
3. GHCR Pull works correctly
4. Security Scan only scans Backend

Expected behavior:
- Backend: Build executed (~2-3 min)
- Frontend: Build skipped (SHA unchanged)
- Total time: ~5-8 min (vs 10-16 min in Phase 6)

