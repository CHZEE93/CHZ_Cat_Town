"""Tests run against a unique temporary PostgreSQL database, never the town database."""
import os
import uuid
import pytest
import psycopg
from psycopg import sql
from sqlalchemy.engine import make_url
from alembic.config import Config
from alembic import command

@pytest.fixture(scope="session", autouse=True)
def test_database():
    original = os.environ["DATABASE_URL"]
    url = make_url(original)
    name = "chz_test_" + uuid.uuid4().hex
    admin = url.set(drivername="postgresql", database="postgres").render_as_string(hide_password=False)
    with psycopg.connect(admin, autocommit=True) as connection:
        connection.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(name)))
    os.environ["DATABASE_URL"] = url.set(database=name).render_as_string(hide_password=False)
    try:
        # Verify upgrades preserve a pre-size-control character as well as fresh DBs.
        command.upgrade(Config("alembic.ini"), "b7df617aefca")
        from app.database import engine
        from sqlalchemy import text
        with engine.begin() as connection:
            connection.execute(text("INSERT INTO users (id, email, password_hash, nickname, bio, created_at) VALUES (1, 'migration@example.com', 'test-placeholder', 'migration', '', now())"))
            connection.execute(text("INSERT INTO characters (user_id, cat_type, version) VALUES (1, 'white', 7)"))
        command.upgrade(Config("alembic.ini"), "head")
        with engine.connect() as connection:
            assert connection.execute(text("SELECT cat_type, version, scale FROM characters WHERE user_id = 1")).one() == ("white", 7, 1.0)
        from app.seed import seed
        seed()
        yield
    finally:
        from app.database import engine
        engine.dispose()
        os.environ["DATABASE_URL"] = original
        assert name.startswith("chz_test_") and name != url.database
        with psycopg.connect(admin, autocommit=True) as connection:
            connection.execute(sql.SQL("DROP DATABASE {} WITH (FORCE)").format(sql.Identifier(name)))

@pytest.fixture(autouse=True)
def clean(test_database):
    from app.database import engine
    from sqlalchemy import text
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE users, auth_rate_limits RESTART IDENTITY CASCADE"))

@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    from app.main import app
    with TestClient(app, headers={"Origin": "http://localhost:5180"}) as client:
        yield client

@pytest.fixture
def resident(client):
    response = client.post("/api/auth/signup", json={"email": "cat@example.com", "password": "a-safe-password", "nickname": "치즈", "catType": "calico"})
    assert response.status_code == 201, response.text
    client.headers["X-CSRF-Token"] = response.json()["csrfToken"]
    return client
