from fastapi import FastAPI
from Backend.routes import upload, summarize, masumi

app = FastAPI()
app.include_router(upload.router)
app.include_router(summarize.router)
app.include_router(masumi.router)

@app.get("/")
def home():
    return {"message": "ConsentIQ Backend is live!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
