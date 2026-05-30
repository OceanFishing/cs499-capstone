from pydantic import BaseModel
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
	email: str 
	name: str
	hash: str
	salt: str
	password: str
	# frozen=False is required to allow field assignment after instantiation.
	# Without this, setting user.hash and user.salt in auth.py will raise a
	# ValidationError at runtime.
	model_config = ConfigDict(frozen=False)
	