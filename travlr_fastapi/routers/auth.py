from fastapi import APIRouter, Depends, HTTPException
from models.user import User
from database import db
import jwt
import os
from dotenv import load_dotenv
import hashlib
import secrets

router = APIRouter()
users_collection = db["users"]

def set_password(password):
	salt = secrets.token_hex(16)
	hash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt.encode('utf-8'), 1000, 64).hex()
	
	return salt, hash

def validate_password(password, salt, hash):
	computed_hash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt.encode('utf-8'), 1000, 64).hex()
	
	if hash == computed_hash:
		return True
	elif hash != computed_hash:
		return False
	
def generate_jwt(user):
	secret = os.getenv("JWT_SECRET")
	payload = {"email": user.email, "name": user.name}
	token = jwt.encode(payload, secret, algorithm="HS256")
	
	return token

@router.post("/api/register")
async def register(user: User):
	try:
		current_user = await users_collection.find_one({"email": user.email})
		
		if current_user is not None:
			raise HTTPException(status_code=409, detail="User already registered")
		
			
		elif current_user is None:
			new_password = user.password
			salt, hash = set_password(new_password)
			user.hash = hash
			user.salt = salt
				
			new_user = await users_collection.insert_one(user.model_dump(exclude= {"password"}))
			
			if new_user.inserted_id is None:
				raise HTTPException(status_code=500, detail="Registration failed")
			
			token = generate_jwt(user)
			
	except Exception as e:
		raise HTTPException(status_code=500, detail="Registration failed")
		
	return token

@router.post("/api/login")
async def login(user: User):
	try:
		current_user = await users_collection.find_one({"email": user.email})
		
		if current_user is None:
			raise HTTPException(status_code=401, detail="User not found")
			
		elif current_user is not None:
			password_check = validate_password(user.password, current_user["salt"], current_user["hash"])
			
			if password_check is False:
				raise HTTPException(status_code=401, detail="Incorrect password")
			elif password_check is True:
				token = generate_jwt(user)
		
	except Exception as e:
		raise HTTPException(status_code = 500, detail = "Login Failure")
			
	return token
				