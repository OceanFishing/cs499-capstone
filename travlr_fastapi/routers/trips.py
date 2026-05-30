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
async def trips_list():
    try:
        trips_list = await trips_collection.find({}).to_list()
        if not trips_list:
            raise HTTPException(status_code=404, detail="Trips List not found")

        for trip in trips_list:
            # MongoDB returns _id as an ObjectId type which FastAPI cannot serialize to JSON
            # Must be converted to string before returning the respone
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
        # pymongo cannot enocde Python's datetime.date type directly
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