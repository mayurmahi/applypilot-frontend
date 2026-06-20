# 🚀 ApplyPilot

**An AI-powered, self-hosted job application assistant — unlimited resume tailoring, free.**

Paid tools like Teal and Huntr cap free users at 5–10 AI tailoring credits per month and charge $20–40/month for unlimited use. ApplyPilot removes that limit entirely: bring your own free LLM API key and tailor your resume for as many jobs as you want, at zero cost.

---

## 📌 The Problem

Manually tailoring a resume for every job application is repetitive and time-consuming — rewriting bullet points, matching keywords, and identifying skill gaps takes 15–20 minutes per application. Existing AI tools solve this but gate the core feature behind a paywall.

## 💡 The Solution

ApplyPilot uses an **agentic AI pipeline** built with LangGraph to autonomously analyze a job description, retrieve the most relevant parts of your resume using semantic search (RAG), rewrite your resume to emphasize the overlap, and score how well you match — all without inventing fake experience.

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based register/login with bcrypt password hashing
- 📋 **Job Application Tracker** — Kanban-style board (Applied → OA → Interview → Offer/Rejected)
- 📄 **Resume Upload** — Supports PDF and DOCX, automatically parsed and indexed
- 🤖 **Agentic Resume Tailoring** — A multi-step LangGraph agent that:
  - Extracts required skills from any job description
  - Retrieves the most relevant resume content via semantic search
  - Rewrites resume bullets to emphasize relevant experience — factually, without fabrication
  - Calculates a match score and lists missing keywords
- 🔍 **RAG-Powered Retrieval** — ChromaDB vector search matches by meaning, not just exact keywords
- 📊 **Full Observability** — Every agent reasoning step traced via LangSmith
- 📥 **Exportable Results** — Download tailored resume content instantly
- 🕒 **Version History** — Every tailored version is saved per job for comparison

---

## 🏗️ How the Agent Works

ApplyPilot's core differentiator is its **LangGraph-based reasoning pipeline** — not a single LLM call, but four sequential, stateful steps:

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  Parse JD   │ ──▶ │ Retrieve Resume   │ ──▶ │  Tailor Content    │ ──▶ │ Score & Find Gaps │
│             │     │ Chunks (RAG)      │     │                    │     │                    │
│ Extracts    │     │ Semantic search   │     │ Rewrites resume,   │     │ Compares against  │
│ required    │     │ over resume       │     │ preserving         │     │ required skills,   │
│ skills as   │     │ embeddings in     │     │ structure, no      │     │ returns % match +  │
│ JSON        │     │ ChromaDB          │     │ fabrication        │     │ missing keywords    │
└─────────────┘     └──────────────────┘     └───────────────────┘     └──────────────────┘
```

Each step reads from and writes to a shared `state` object, so later steps build on earlier reasoning — this is what makes it an **agent** rather than a single prompt-response exchange.

---

## 🛠️ Tech Stack

**Backend**
- Python · FastAPI · Uvicorn
- PostgreSQL · SQLAlchemy (ORM)
- JWT (python-jose) · Passlib (bcrypt)

**Agentic AI Layer**
- LangChain · LangGraph (agent orchestration)
- Groq API (Llama 3.3 70B) — LLM reasoning
- ChromaDB — vector database for RAG
- LangSmith — agent tracing & observability

**File Processing**
- pdfplumber (PDF text extraction)
- python-docx (DOCX text extraction)

**Frontend**
- React (Vite) · React Router DOM
- Axios · React Toastify

**Deployment**
- Render (backend + PostgreSQL)
- Vercel (frontend)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login, receive JWT |
| POST | `/jobs/` | Add a tracked job application |
| GET | `/jobs/` | List all tracked jobs |
| PATCH | `/jobs/{id}/status` | Update application status |
| DELETE | `/jobs/{id}` | Remove a tracked job |
| POST | `/resume/upload` | Upload resume (PDF/DOCX), generates embeddings |
| GET | `/resume/me` | Get current uploaded resume |
| POST | `/resume/tailor/{job_id}` | **Trigger the LangGraph agent** to tailor resume for a job |
| GET | `/resume/tailored/{job_id}` | Get all tailored versions for a job |

Full interactive documentation available at `/docs` (Swagger UI).

---

## ⚙️ Getting Started Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Free API keys: [Groq](https://console.groq.com), [LangSmith](https://smith.langchain.com)

### Backend Setup

```bash
git clone https://github.com/yourusername/applypilot-backend.git
cd applypilot-backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/applypilot
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=your_groq_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=applypilot
```

Run the server:

```bash
uvicorn app.main:app --reload
```

API live at `http://localhost:8000` — docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
git clone https://github.com/yourusername/applypilot-frontend.git
cd applypilot-frontend
npm install
npm run dev
```

Frontend live at `https://applypilot-frontend-blue.vercel.app/login`

---

## 🎯 What This Project Demonstrates

- Designing a **multi-step agentic AI workflow** using LangGraph, rather than a single LLM call
- Implementing **RAG** (Retrieval-Augmented Generation) with a vector database for semantically relevant context retrieval
- **Prompt engineering** for structured, factual, hallucination-resistant LLM outputs
- Using **LangSmith** for observability and debugging of agent reasoning
- Building a complete **full-stack application** — secure auth, relational data modeling, file processing, and a React frontend
- Identifying a **real, validated market gap** (paywalled AI features in existing tools) and building a free, self-hosted alternative

---

## 📄 License

This project is open source.

## 👤 Author

**Mayur Mahindrakar**
Computer Engineering Student, VIIT Pune

- GitHub: [@yourusername](https://github.com/mayurmahi)
