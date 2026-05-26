from routers import auth, trips
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = ["http://localhost:4200",]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["GET","POST","PUT","DELETE"],
	allow_headers=["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
)

app.include_router(auth.router)
app.include_router(trips.router)