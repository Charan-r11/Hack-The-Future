from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import fitz  # PyMuPDF
import requests
import json
import re

app = FastAPI(title="ConsentIQ API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys (in production, use environment variables)
MASUMI_API_TOKEN = "your_masumi_token_here"

# Models
class AnalyzeRequest(BaseModel):
    text: str
    category: str

class AnalyzeResponse(BaseModel):
    summary: str
    flags: Dict[str, List[str]]

class ChatRequest(BaseModel):
    category: str
    message: str
    document_text: str

class ChatResponse(BaseModel):
    response: str

class TrustRequest(BaseModel):
    doc_hash: str
    wallet: str

class TrustResponse(BaseModel):
    score: int
    verified: bool
    organization: str

# Helper functions
def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    try:
        # Save the uploaded file temporarily
        with open("temp.pdf", "wb") as f:
            f.write(pdf_file.file.read())
        
        # Extract text using PyMuPDF
        doc = fitz.open("temp.pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        
        # Clean up
        doc.close()
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

def analyze_text_with_ai(text: str, category: str) -> Dict:
    try:
        # Simple text analysis without AI
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Create a simple summary (first few sentences)
        summary = " ".join(sentences[:3])
        
        # Simple keyword-based analysis
        risks = [s for s in sentences if any(word in s.lower() for word in ["risk", "danger", "warning", "caution"])]
        rights = [s for s in sentences if any(word in s.lower() for word in ["right", "entitle", "permit", "allow"])]
        responsibilities = [s for s in sentences if any(word in s.lower() for word in ["must", "shall", "require", "obligation"])]
        
        return {
            "summary": summary,
            "flags": {
                "risks": risks[:5],  # Limit to top 5
                "rights": rights[:5],
                "responsibilities": responsibilities[:5]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text: {str(e)}")

# Endpoints
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    extracted_text = extract_text_from_pdf(file)
    return {"extracted_text": extracted_text}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_document(request: AnalyzeRequest):
    result = analyze_text_with_ai(request.text, request.category)
    return AnalyzeResponse(**result)

@app.post("/chat", response_model=ChatResponse)
async def chat_with_document(request: ChatRequest):
    try:
        # Simple response based on keywords
        keywords = {
            "what": "The document contains information about",
            "how": "The process involves",
            "why": "This is important because",
            "when": "The timing is specified as"
        }
        
        # Find the first matching keyword in the question
        question_type = next((k for k in keywords if request.message.lower().startswith(k)), "general")
        
        # Create a simple response
        response = f"{keywords.get(question_type, 'Based on the document')}: {request.document_text[:200]}..."
        
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@app.post("/trust", response_model=TrustResponse)
async def check_trust(request: TrustRequest):
    headers = {
        "Authorization": f"Bearer {MASUMI_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "doc_hash": request.doc_hash,
        "wallet": request.wallet
    }
    
    try:
        response = requests.post(
            "https://payment.masumi.network/api/trust-score",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        return TrustResponse(**response.json())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking trust score: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
