# ConsentIQ - AI Document Analysis Platform


ConsentIQ is an AI-powered document analysis platform that helps users understand complex legal and medical documents. It provides clear, immediate understanding by breaking down documents into risks, rights, and responsibilities.

## 🌟 Features

- **Smart Document Analysis**: Analyzes PDFs and extracts key information using AI
- **Trust Score**: Verifies document authenticity via Masumi blockchain API (in development )
- **Interactive UI**: Modern, responsive interface with real-time analysis
- **Multi-language Support**: Toggle between different languages (in development)
- **Voice Reading**: Audio playback of document analysis

## 🚀 Tech Stack

### Frontend

- React + Vite
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- Axios for API calls
- Zustand for State Management

### Backend

- FastAPI
- Python 3.9+
- OpenAI GPT-4
- Masumi Blockchain API
- PDF Processing Tools

## 📋 Prerequisites

- Node.js 16+
- Python 3.9+
- OpenAI API Key
- Masumi API Key (optional for trust score)
- Crewai API Key (Optional)

## 🛠️ Installation

### Backend Setup

1. Navigate to the Backend directory:

```bash
cd Backend
```

2. Create and activate virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create .env file:

```bash
OPENAI_API_KEY=your_api_key_here
MASUMI_API_KEY=your_masumi_api_key_here
```

### Frontend Setup

1. Navigate to the Frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

## 🏃‍♂️ Running the Application

1. Start the backend server (from Backend directory):

```bash
uvicorn main:app --reload --port 8000
```

2. Start the frontend development server (from frontend directory):

```bash
npm run dev
```

3. Access the application at `http://localhost:8081`

## 📁 Project Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── api/              # API client and hooks
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── store/           # Zustand store
│   └── App.tsx          # Main application component
```

### Backend Structure

```
Backend/
├── models/              # Data models and schemas
├── routes/             # API route handlers
├── services/           # Business logic and external services
└── main.py            # FastAPI application entry point
```

## 🔍 Key Components

### Frontend Components

#### Results Page (`frontend/src/pages/Results.tsx`)

- Displays document analysis results
- Shows trust score visualization
- Provides tabbed interface for risks, rights, and responsibilities

#### Document Store (`frontend/src/store/documentStore.ts`)

```typescript
interface DocumentStore {
  file: File | null;
  category: string | null;
  extractedText: string;
  analysis: {
    summary: string;
    flags: {
      risks: string[];
      rights: string[];
      responsibilities: string[];
    };
  };
}
```

#### Results Data Hook (`frontend/src/hooks/useResultsData.ts`)

- Manages API calls for document analysis
- Handles loading and error states
- Provides analysis results to components

### Backend Components

#### Document Processor (`Backend/services/document_processor.py`)

- Handles PDF text extraction
- Integrates with OpenAI for analysis
- Generates structured analysis results

#### API Endpoints

1. Document Upload and Analysis

```python
@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...)
) -> AnalysisResponse
```

2. Trust Score Verification

```python
@app.post("/trust")
async def verify_trust(
    doc_hash: str,
    wallet: str
) -> TrustScore
```
## 💸 Monetization Strategy

ConsentIQ is designed with a flexible, scalable monetization model that aligns with real-world legal and healthcare document workflows:

🆓 Freemium Tier

Free Tier Includes:

Document upload

AI summary + clause flagging (risks, rights, responsibilities)

View-only chatbot replies (limited)

Pro Tier Unlocks:

Unlimited AI chat interactions

Wallet/org verification via Masumi (simulated)

Consent certificate downloads

Priority analysis with full clause breakdown

🪙 Masumi Token-Based Access (Simulated)

Users receive a starting token balance (e.g. 10 tokens)

Token usage:

5 tokens per AI chat session

5 tokens to generate a consent certificate

3 tokens to verify a wallet/org (when live)

Token balance tracked in memory (MVP) or via user ID/session


## 🔐 Security

- CORS enabled for frontend origin
- File type validation for uploads
- Secure API key handling
- Rate limiting on endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Anishka - Backend/AI Integration
- Charan - Frontend
- Harshith Jella - Full Stack/ Project Lead
- Suptha - Blockchain Integrator 
- Pearl - Frontend 

##  Acknowledgments

- OpenAI for GPT-4 API
- Masumi for blockchain verification
- Shadcn for UI components
- All contributors and supporters

---

Made with ❤️ for Hack The Future
