from fastapi import APIRouter, Depends, HTTPException, Header
from models.trip import Trip
from decimal import Decimal
import database
import jwt
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# The columns trips may be sorted by, mapping the field name the client sends to
# the real column. sort_by cannot be a bind parameter, so it is checked against
# this whitelist before going into the query, which blocks SQL injection.
SORT_COLUMNS = {
    "code": "code",
    "name": "name",
    "length": "length",
    "start": "start",
    "resort": "resort",
    "perPerson": "per_person",
}

# The trip columns returned to the client. id is exposed as a string under the
# key "_id" and per_person under "perPerson" so the JSON matches the contract the
# Angular frontend was built against.
TRIP_COLUMNS = (
    'id::text AS "_id", code, name, length, start, resort, '
    'per_person AS "perPerson", image, description'
)


@router.get("/api/trips")
async def trips_list(min_price: float | None = None,
                     max_price: float | None = None,
                     limit: int | None = None,
                     sort_by: str | None = None,
                     sort_order: str | None = None):
    # FILTER: build the price-range conditions from whatever bounds were given.
    # Each bound is a bind parameter ($1, $2, ...) rather than text spliced into
    # the query, so the values can never be used for injection.
    conditions = []
    params = []
    if min_price is not None:
        params.append(Decimal(str(min_price)))
        conditions.append(f"per_person >= ${len(params)}")
    if max_price is not None:
        params.append(Decimal(str(max_price)))
        conditions.append(f"per_person <= ${len(params)}")
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    # SORT: a column name cannot be a bind parameter, so sort_by is resolved
    # through the whitelist. An unknown field is rejected rather than ignored.
    order_clause = ""
    if sort_by is not None:
        column = SORT_COLUMNS.get(sort_by)
        if column is None:
            raise HTTPException(status_code=400, detail="Invalid sort field")
        direction = "DESC" if sort_order == "desc" else "ASC"
        order_clause = f"ORDER BY {column} {direction}"

    # LIMIT: apply only a positive limit, matching the original behavior where a
    # non-positive value meant no limit.
    limit_clause = ""
    if limit is not None and limit > 0:
        params.append(limit)
        limit_clause = f"LIMIT ${len(params)}"

    query = f"SELECT {TRIP_COLUMNS} FROM trips {where_clause} {order_clause} {limit_clause}"

    try:
        rows = await database.pool.fetch(query, *params)
    except Exception:
        raise HTTPException(status_code=500, detail="Query unable to be performed")

    # An empty result is a valid response to a filtered query, not a 404.
    return [dict(row) for row in rows]


@router.get("/api/trips/{trip_code}")
async def find_trips_by_code(trip_code: str):
    try:
        row = await database.pool.fetchrow(
            f"SELECT {TRIP_COLUMNS} FROM trips WHERE code = $1", trip_code
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Query unable to be performed")

    # The 404 is raised outside the try so it is not caught and turned into a 500.
    if row is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    return dict(row)


# FastAPI maps this parameter name directly to the HTTP 'authorization' header.
# Renaming it will silently break header reading; do not change.
async def authenticate_jwt(authorization: str = Header(None)):
    secret = os.getenv("JWT_SECRET")
    # These checks raise outside the try so they are not caught by the except
    # below and collapsed into the generic message; only a failed decode is.
    if authorization is None:
        raise HTTPException(status_code=401, detail="Empty Authentication Header")
    header = authorization.split()
    if len(header) < 2:
        raise HTTPException(status_code=401, detail="Not enough tokens in Authentication Header")
    token = header[1]
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication could not be completed")

    return payload


@router.post("/api/trips")
async def add_trip(trip: Trip, payload=Depends(authenticate_jwt)):
    try:
        # start is a date and per_person is converted to Decimal so it lands in
        # the NUMERIC column exactly. No string conversion is needed the way it
        # was for the Mongo driver.
        await database.pool.execute(
            """INSERT INTO trips
                   (code, name, length, start, resort, per_person, image, description)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
            trip.code, trip.name, trip.length, trip.start, trip.resort,
            Decimal(str(trip.perPerson)), trip.image, trip.description,
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Trip could not be added")

    return trip


@router.put("/api/trips/{trip_code}")
async def update_trip(trip_code: str, trip: Trip, payload=Depends(authenticate_jwt)):
    try:
        result = await database.pool.execute(
            """UPDATE trips
                   SET code = $1, name = $2, length = $3, start = $4, resort = $5,
                       per_person = $6, image = $7, description = $8
                 WHERE code = $9""",
            trip.code, trip.name, trip.length, trip.start, trip.resort,
            Decimal(str(trip.perPerson)), trip.image, trip.description, trip_code,
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Trip could not be updated")

    # execute returns a status like "UPDATE 1" or "UPDATE 0"; zero rows means the
    # code was not found. Raised outside the try so it is not swallowed.
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="New Trip Data Not Found")

    return trip