import asyncio
import os
from datetime import date, datetime
from decimal import Decimal

import asyncpg
from pymongo import AsyncMongoClient
from dotenv import load_dotenv

load_dotenv()


def to_date(value):
    # start is stored two ways in Mongo: seeded trips hold a real date, while
    # trips created through the FastAPI endpoints were stringified before insert.
    # Normalize both to a Python date for the DATE column.
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


async def migrate():
    # Source: MongoDB. A missing MONGO_URI falls back to localhost:27017, the
    # same default the app uses; the travlr database is selected here.
    mongo = AsyncMongoClient(os.getenv("MONGO_URI"))
    source = mongo["travlr"]

    # Destination: PostgreSQL, through the same DATABASE_URL the app connects with.
    pg = await asyncpg.connect(dsn=os.getenv("DATABASE_URL"))

    try:
        users = await source["users"].find().to_list()
        trips = await source["trips"].find().to_list()

        # Wrap the whole migration in one transaction so a failure leaves the
        # tables unchanged rather than half-populated.
        async with pg.transaction():
            # Clear all three tables so the script can be re-run from a clean
            # slate. RESTART IDENTITY resets the id counters; CASCADE clears bookings.
            await pg.execute("TRUNCATE bookings, trips, users RESTART IDENTITY CASCADE;")

            for u in users:
                await pg.execute(
                    "INSERT INTO users (email, name, hash, salt) VALUES ($1, $2, $3, $4)",
                    u["email"], u["name"], u["hash"], u["salt"],
                )

            for t in trips:
                await pg.execute(
                    """INSERT INTO trips
                           (code, name, length, start, resort, per_person, image, description)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
                    t["code"], t["name"], t["length"], to_date(t["start"]),
                    t["resort"], Decimal(str(t["perPerson"]).strip()), t["image"], t["description"],
                )

            # Seed a few bookings so the new relationship has demonstration data,
            # since the source database never held any. Link the first user to the
            # first few trips with varying party sizes.
            user_id = await pg.fetchval("SELECT id FROM users ORDER BY id LIMIT 1")
            trip_ids = [r["id"] for r in await pg.fetch("SELECT id FROM trips ORDER BY id LIMIT 3")]
            if user_id is not None and trip_ids:
                for party_size, trip_id in enumerate(trip_ids, start=1):
                    await pg.execute(
                        "INSERT INTO bookings (user_id, trip_id, num_travelers) VALUES ($1, $2, $3)",
                        user_id, trip_id, party_size,
                    )

        # Report counts so the migration can be verified against the source.
        pg_users = await pg.fetchval("SELECT count(*) FROM users")
        pg_trips = await pg.fetchval("SELECT count(*) FROM trips")
        pg_bookings = await pg.fetchval("SELECT count(*) FROM bookings")

        print(f"users:    {len(users)} in Mongo -> {pg_users} in Postgres")
        print(f"trips:    {len(trips)} in Mongo -> {pg_trips} in Postgres")
        print(f"bookings: {pg_bookings} seeded")
    finally:
        await pg.close()
        await mongo.close()


if __name__ == "__main__":
    asyncio.run(migrate())