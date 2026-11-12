# Navigate AI — Developer & Contributor Guide

## 1. Local Development Setup

### Prerequisites
- Node.js >= 18 (Node 20+ recommended)
- Python >= 3.10 (Python 3.11 recommended)
- `uv` (recommended) or standard `pip`

### 1.1 Backend Setup
```bash
cd backend

# Create virtual environment
uv venv .venv --python 3.11

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt

# Start backend development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 1.2 Frontend Setup
```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Next.js development server
npm run dev
```

Visit `http://localhost:3000` to interact with the full web application.

---

## 2. Running Automated Tests

### Backend Unit & Integration Tests
```bash
cd backend
pytest -v
```

All 13 test suites validate:
- Environment graph topology & node connectivity
- Multilingual instruction parsing (English & Hindi)
- Shortest-path graph navigation
- Action scoring policy & loop penalties
- Calibrated uncertainty estimation
- Evaluation metrics (SR, SPL, NE, nDTW, SDTW)
- End-to-end sequential execution loop
- REST API endpoints & user authentication flow
