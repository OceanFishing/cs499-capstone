from datetime import date
from pydantic import BaseModel

class Trip(BaseModel):
	code: str
	name: str
	length: str
	start: date
	resort: str
	perPerson: float
	image: str
	description: str
	
	