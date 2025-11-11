from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI app instance
app = FastAPI()

# --- Middleware ---
# This is important for letting your React app
# talk to this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (change in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- Routes ---
@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/test")
def api_test():
    return {"message": "Hello from the FastAPI backend!"}