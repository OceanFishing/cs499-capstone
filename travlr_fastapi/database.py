import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

# Shared connection pool. Created once on startup and reused across requests
# rather than opening a new connection per query. It stays None until connect()
# runs, so other modules must reference it as database.pool at call time and
# never import the value directly, which would capture None.
pool: asyncpg.Pool | None = None

async def connect():
    # Called from the FastAPI lifespan handler when the application starts.
    global pool
    pool = await asyncpg.create_pool(dsn=os.getenv("DATABASE_URL"))

async def disconnect():
    # Called from the lifespan handler on shutdown to close the pool cleanly.
    if pool is not None:
        await pool.close()