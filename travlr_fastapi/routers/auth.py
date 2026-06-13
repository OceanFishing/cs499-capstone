from fastapi import APIRouter, HTTPException
from models.user import User
import database
import jwt
import os
from dotenv import load_dotenv
import hashlib
import secrets

load_dotenv()
router = APIRouter()

def set_password(password):
	salt = secrets.token_hex(16)
	# Algorithm, iteration count (1000), and key length (64) match the original
	# Node.js crypto.pbkdf2Sync call exactly. This is intentional for compatibility
	# with passwords hashed by the original implementation
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
		existing = await database.pool.fetchval("SELECT 1 FROM users WHERE email = $1", user.email)
	except Exception:
		raise HTTPException(status_code=500, detail="Registration failed")

	# Raised outside the try so the 409 is not caught and turned into a 500.
	if existing is not None:
		raise HTTPException(status_code=409, detail="User already registered")

	salt, hash = set_password(user.password)

	try:
		new_id = await database.pool.fetchval(
			"INSERT INTO users (email, name, hash, salt) VALUES ($1, $2, $3, $4) RETURNING id",
			user.email, user.name, hash, salt,
		)
	except Exception:
		raise HTTPException(status_code=500, detail="Registration failed")

	if new_id is None:
		raise HTTPException(status_code=500, detail="Registration failed")

	# Set on the model before signing so the token reflects the stored record.
	user.hash = hash
	user.salt = salt
	token = generate_jwt(user)

	return token

@router.post("/api/login")
async def login(user: User):
	try:
		row = await database.pool.fetchrow("SELECT salt, hash FROM users WHERE email = $1", user.email)
	except Exception:
		raise HTTPException(status_code=500, detail="Login Failure")

	# Raised outside the try so the 401 responses are not turned into 500s.
	if row is None:
		raise HTTPException(status_code=401, detail="User not found")

	if validate_password(user.password, row["salt"], row["hash"]) is False:
		raise HTTPException(status_code=401, detail="Incorrect password")

	return generate_jwt(user)