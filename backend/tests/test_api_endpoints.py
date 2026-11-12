"""
API Endpoints Automated Test Suite for Navigate AI.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.base import init_db


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["service"] == "navigate-ai-backend"


@pytest.mark.asyncio
async def test_auth_and_user_flow():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register new user
        reg_res = await ac.post("/api/auth/register", json={
            "email": "testpilot@navigate.ai",
            "username": "testpilot",
            "password": "Password123!",
        })
        assert reg_res.status_code in (201, 400)  # 201 created or 400 if already exists

        # 2. Login
        login_res = await ac.post("/api/auth/login", json={
            "email": "testpilot@navigate.ai",
            "password": "Password123!",
        })
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data

        # 3. GET /api/auth/me
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        me_res = await ac.get("/api/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == "testpilot@navigate.ai"



@pytest.mark.asyncio
async def test_environments_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/environments")
        assert res.status_code == 200
        envs = res.json()
        assert len(envs) >= 5

        # Get single environment
        env_res = await ac.get("/api/environments/office_floor")
        assert env_res.status_code == 200
        data = env_res.json()
        assert data["id"] == "office_floor"
        assert len(data["nodes"]) >= 8


@pytest.mark.asyncio
async def test_agent_parse_instruction_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/agent/parse-instruction", json={
            "instruction": "Go forward and turn right at the reception.",
            "language": "en"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["language"] == "en"
        assert len(data["landmarks"]) > 0


@pytest.mark.asyncio
async def test_analytics_and_history_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/analytics/overview")
        assert res.status_code == 200
        data = res.json()
        assert "total_runs" in data

        res_hist = await ac.get("/api/history")
        assert res_hist.status_code == 200
        runs = res_hist.json()
        assert isinstance(runs, list)
