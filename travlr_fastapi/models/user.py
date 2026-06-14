from pydantic import BaseModel

class User(BaseModel):
	email: str
	name: str
	hash: str
	salt: str
	password: str

class Credentials(BaseModel):
	# Login needs only an email and password, which is what the Angular admin
	# sends, so login validates against this rather than the full User model.
	email: str
	password: str