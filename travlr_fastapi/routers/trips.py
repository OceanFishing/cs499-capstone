from fastapi import APIRouter, Depends, HTTPException
from fastapi import Header
from models.trip import Trip
from database import db
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

trips_collection = db["trips"]
router = APIRouter()

@router.get("/api/trips")
async def trips_list(min_price: float | None = None,
                     max_price: float | None = None,
                     limit: int | None = None,
                     sort_by: str | None = None,
                     sort_order: str | None = None):
    # FILTER: build a price range filter from the optional bounds.
    # Each bound is added only if it was provided, so any combination works.
    query_filter = {}
    price_condition = {}
    if min_price is not None:
        price_condition["$gte"] = min_price
    if max_price is not None:
        price_condition["$lte"] = max_price
    if price_condition:
        query_filter["perPerson"] = price_condition

    # SORT: translate the text direction into MongoDB's numeric direction.
    # "desc" means descending (-1); anything else defaults to ascending (1).
    direction = -1 if sort_order == "desc" else 1

    try:
        cursor = trips_collection.find(query_filter)

        # Apply sorting only if a field to sort on was requested.
        if sort_by is not None:
            cursor = cursor.sort(sort_by, direction)

        # Apply the result limit only when a positive number was given.
        # A limit of 0 means "no limit" in MongoDB, so guard against it.
        if limit is not None and limit > 0:
            cursor = cursor.limit(limit)

        trips_list = await cursor.to_list()

        for trip in trips_list:
            # ObjectId is not JSON serializable, convert before returning
            trip["_id"] = str(trip["_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail="Query unable to be performed")

    return trips_list

@router.get("/api/trips/{trip_code}")
async def find_trips_by_code(trip_code: str):
    try:
        trip = await trips_collection.find_one({"code": trip_code})
        if trip is None:
            raise HTTPException(status_code=404, detail="Trip not found")
        trip["_id"] = str(trip["_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail="Query unable to be performed")
    
    return trip

# FastAPI maps this parameter name directly to the HTTP 'authorization' header
# Renaming it will silently break header reading; do not change
async def authenticate_jwt(authorization: str = Header(None)):
    secret = os.getenv("JWT_SECRET")
    try:
        if authorization == None:
            raise HTTPException(status_code=401, detail="Empty Authentication Header")
        header = authorization.split()
        if len(header) < 2:
            raise HTTPException(status_code=401, detail="Not enough tokens in Authentication Header")
        token = header[1]
        payload = jwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication could not be completed") 
    
    return payload

@router.post("/api/trips")
async def add_trip(trip: Trip, payload=Depends(authenticate_jwt)):
    try:
        trip_data = trip.model_dump()
        # pymongo cannot encode Python's datetime.date type directly
        # must convert to string before insert or update or the operation will fail
        trip_data["start"] = str(trip_data["start"])

        new_trip = await trips_collection.insert_one(trip_data)
        if new_trip.inserted_id is None:
            raise HTTPException(status_code=500, detail="No Trip Found")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Trip could not be added")
    
    return trip

@router.put("/api/trips/{trip_code}")
async def update_trip(trip_code: str, trip: Trip, payload=Depends(authenticate_jwt)):
    try:
        trip_data = trip.model_dump()
        trip_data["start"] = str(trip_data["start"])

        updated_trip = await trips_collection.update_one({"code": trip_code}, {"$set": trip_data})
        if updated_trip.matched_count == 0:
            raise HTTPException(status_code=404, detail="New Trip Data Not Found")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Trip could not be updated")
    
    return trip