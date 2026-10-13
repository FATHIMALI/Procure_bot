# Procure Bot — Intelligent Procurement & Vendor Quality Analysis Assistant
Procure Bot is an AI-powered procurement management application designed to help organizations manage procurement requests, analyze supplier quality, monitor purchase orders, check compliance, and generate Requests for Quotation (RFQs).
The application combines a React frontend, FastAPI backend, Ollama large language models, and a Retrieval-Augmented Generation (RAG) pipeline to provide procurement-related information and assistance.

## 1. Project Overview

Procure Bot helps simplify procurement operations by bringing procurement data, supplier analysis, purchase order information, and AI-assisted question answering into one application.

### Key Features

AI Procurement Assistant: Ask procurement-related questions using natural language.
Procurement Dashboard:View procurement summary and analytics.
Supplier Management: Retrieve supplier information and compare suppliers.
Vendor Quality Analysis: Analyze supplier quality information.
Purchase Order Management: View purchase orders and individual order details.
Compliance Checking:Check purchase order and procurement compliance information.
RFQ Generation: Generate Requests for Quotation.
Procurement Requests: Create, retrieve, and update procurement request statuses.
Product Search: Search available product information.
RAG-Based Retrieval: Retrieve relevant procurement information to support AI-generated answers.

*Feature availability depends on the configured data sources, backend services, and AI components.*

## 2. Technology Stack

**Component**             **Technology**
Frontend              React                
Frontend Build Tool   Vite                 
Styling               Tailwind CSS         
Backend               Python, FastAPI      
API Documentation     Swagger UI / OpenAPI 
Large Language Model  Ollama               
LLM                   Llama 3.1 8B         
Embedding Model       nomic-embed-text     
Vector Database       Qdrant               
Retrieval Pipeline    RAG                  
Version Control       Git and GitHub       

##3. Project Architecture

```text
                    USER
                      |
                      v
             React + Vite Frontend
               localhost:5173
                      |
                      v
              FastAPI Backend
               localhost:8001
                 /    |    \
                /     |     \
               v      v      v
          Ollama    Qdrant   Procurement
          :11434    :6333      Data
             |
             v
       Llama 3.1 8B
       AI Responses
```

The frontend communicates with the backend API. The backend handles procurement requests, retrieves relevant information, and uses the configured AI and data services.
**Important:** The diagram describes the intended local architecture. Exact data flow depends on the implementation in the backend source code.

## 4. Project Folder Structure

The main project directory is:

```text
procure_bot/
│
├── backend/
│   ├── __init__.py
│   └── app/
│       ├── __init__.py
│       └── main.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── src/
│   ├── query_router.py
│   ├── rag_assistant.py
│   ├── retriever.py
│   ├── quality_analysis.py
│   └── qdrant_test.py
│
├── data/
├── storage/
├── tests/
├── requirements.txt
├── .gitignore
└── README.md
```

This is a representative structure based on the project files. Some folders may contain additional files or differ from this illustration.

## 5. Prerequisites

Install or configure the following before running the project:

1. Python 3.10 or a compatible version required by the dependencies.
2. Node.js and npm.
3. Git.
4. Ollama for running local language and embedding models.
5. Docker Desktop, if Qdrant is configured to run in Docker.
6. The project source code.

Check the installations using PowerShell:

```powershell
python --version
node --version
npm --version
git --version
ollama --version
docker --version
```

Docker is required only if your configured Qdrant setup uses Docker.

## 6. Clone the GitHub Repository

Open PowerShell and navigate to the directory where you want to store the project.

```powershell
git clone https://github.com/FATHIMALI/Procure_bot.git
```

Navigate into the project directory:

```powershell
cd Procure_bot
```

Verify the files:

```powershell
dir
```

If the project is already available locally, navigate to its existing root directory instead of cloning another copy.

---

## 7. Configure the Environment

### Step 1: Create a virtual environment

Run these commands from the project root:

```powershell
python -m venv .venv
```

### Step 2: Activate the virtual environment

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell reports an execution-policy error, use the activation method permitted by your environment, or run the virtual environment's Python executable directly.

### Step 3: Install Python dependencies

```powershell
python -m pip install --upgrade pip
```

Then install the project dependencies:

```powershell
python -m pip install -r requirements.txt
```

Wait until installation finishes successfully.

### Step 4: Configure environment variables

Check whether the project contains an `.env.example` file or configuration instructions.

If one exists, create a local `.env` file from that template and fill in the required values.

Do not invent environment variable names. Use the names expected by the actual backend code.

Typical local service addresses used by this project are:

```text
Ollama:      http://localhost:11434
Qdrant:      http://localhost:6333
Backend API: http://127.0.0.1:8001
Frontend:    http://localhost:5173
```

Keep `.env`, API keys, credentials, and other secrets out of GitHub.

---

## 8. Set Up Ollama

Ollama provides the local language model and embedding model.

### Step 1: Verify Ollama

```powershell
ollama --version
```

### Step 2: Start the Ollama server

```powershell
ollama serve
```

If the server is already running, leave it running and do not start a second server unnecessarily.

The default Ollama address is:

```text
http://127.0.0.1:11434
```

### Step 3: Check the installed models

Open a separate PowerShell terminal:

```powershell
ollama list
```

The project has used these models:

```text
llama3.1:latest
llama3.1:8b
llama3:latest
nomic-embed-text:latest
```

### Step 4: Download a model if it is missing

For the language model:

```powershell
ollama pull llama3.1:8b
```

For the embedding model:

```powershell
ollama pull nomic-embed-text
```

These downloads are unnecessary if the required models are already installed.

### Step 5: Test the language model

```powershell
ollama run llama3.1:latest "Reply with: Procure Bot AI is working"
```

A text response confirms that the model can generate an answer.

Use the model names expected by the project's actual configuration.

---

## 9. Set Up Qdrant

Qdrant stores and retrieves vector representations of documents for semantic search.

The project's previously configured local address is:

```text
http://localhost:6333
```

### Step 1: Check Docker

```powershell
docker ps
```

If the Qdrant container already exists but is stopped, start it using its actual container name:

```powershell
docker start procure-qdrant
```

Use this command only if the existing container is named `procure-qdrant`.

### Step 2: Start a new Qdrant container if necessary

If Qdrant is not already installed or running, and you have confirmed that no existing Qdrant container needs to be preserved, you can use:

```powershell
docker run -d --name procure-qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

This creates a new container. Configure persistent storage before using it for important data.

If a container with the same name already exists, do not create another one. Inspect and reuse the existing container instead.

### Step 3: Verify Qdrant

Open this URL in a browser:

http://localhost:6333

Check the collection and storage configuration expected by the application.

The project has previously used a collection named:

```text
procure_documents
```

The collection must exist and contain the appropriate vectors for document retrieval to work. Starting Qdrant alone does not populate procurement documents.

---

## 10. Run the Backend (FastAPI)

**Important:** Run the backend from the project root directory, not from the `frontend` directory.

Project path used during local development:

```text
C:\Users\T9957\Desktop\PROCURE_BOT_1\procure_bot
```

### Step 1: Open PowerShell

```powershell
cd C:\Users\T9957\Desktop\PROCURE_BOT_1\procure_bot
```

### Step 2: Activate the virtual environment

```powershell
.\.venv\Scripts\Activate.ps1
```

If your existing environment is named `venv` rather than `.venv`, activate that environment instead.

### Step 3: Start the backend server

```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```

Wait for the application startup message.

### Step 4: Open the API documentation

Swagger UI:

http://127.0.0.1:8001/docs

OpenAPI JSON:

http://127.0.0.1:8001/openapi.json

Backend root:

http://127.0.0.1:8001/

Health endpoint:

http://127.0.0.1:8001/health

Keep the backend terminal open while using the application.

---

## 11. Run the Frontend (React + Vite)

Open a **second PowerShell terminal**. Do not stop the backend.

### Step 1: Navigate to the frontend

```powershell
cd C:\Users\T9957\Desktop\PROCURE_BOT_1\procure_bot\frontend
```

### Step 2: Install frontend dependencies

```powershell
npm install
```

Run this when setting up the project or when its dependencies have changed.

### Step 3: Start the development server

```powershell
npm run dev
```

Vite will print the local URL. It is normally:

http://localhost:5173

Open the URL displayed in the terminal.

Keep the frontend terminal open while testing the application.

### Step 4: Verify the frontend-backend connection

The frontend must call the correct backend URL.

Inspect the frontend API configuration and use the configuration mechanism expected by the code. If it uses a Vite environment variable, configure that variable accordingly and restart Vite after changing it.

A working frontend page does not necessarily mean the API connection or AI functionality is working; test them separately.

---

## 12. Test the API

Open Swagger UI:

http://127.0.0.1:8001/docs

Expand an endpoint, select **Try it out**, provide any required input, and click **Execute**.

### Main API endpoints

| Method | Endpoint                                        | Purpose                      |
| ------ | ----------------------------------------------- | ---------------------------- |
| GET    | `/`                                             | Home                         |
| GET    | `/health`                                       | Health check                 |
| POST   | `/api/query`                                    | Ask Procure Bot a question   |
| GET    | `/api/dashboard/summary`                        | Dashboard summary            |
| GET    | `/api/dashboard/suppliers`                      | Supplier dashboard data      |
| GET    | `/api/dashboard/quality`                        | Quality dashboard data       |
| GET    | `/api/dashboard/compliance`                     | Compliance dashboard data    |
| GET    | `/api/purchase-orders`                          | List purchase orders         |
| GET    | `/api/purchase-orders/{po_number}`              | Retrieve a purchase order    |
| GET    | `/api/suppliers`                                | List suppliers               |
| GET    | `/api/analytics/summary`                        | Analytics summary            |
| GET    | `/api/products/search`                          | Search products              |
| POST   | `/api/rfq/generate`                             | Generate an RFQ              |
| GET    | `/api/rfq/history`                              | Retrieve RFQ history         |
| DELETE | `/api/rfq/history/{rfq_id}`                     | Delete an RFQ history entry  |
| GET    | `/api/procurement-requests`                     | List procurement requests    |
| POST   | `/api/procurement-requests`                     | Create a procurement request |
| GET    | `/api/procurement-requests/{request_id}`        | Retrieve a request           |
| PUT    | `/api/procurement-requests/{request_id}/status` | Update request status        |
| GET    | `/api/supplier-comparison`                      | Compare suppliers            |
| POST   | `/api/compliance/check`                         | Run a compliance check       |
| GET    | `/api/system/status`                            | Check system status          |
| GET    | `/api/data/info`                                | Inspect data information     |

Additional endpoints include supplier quality details and supplier sourcing for procurement requests.

Consult `/docs` for the exact request schemas, required parameters, and response formats.

### Test the AI query endpoint

In Swagger UI:

1. Find `POST /api/query`.
2. Expand the endpoint.
3. Click **Try it out**.
4. Enter the request body shown below if it matches the displayed `QueryRequest` schema.
5. Click **Execute**.

Example request:

```json
{
  "question": "What is the compliance status of PO-00056?"
}
```

The backend should return its configured query response. The answer depends on the available procurement data and whether the required AI and retrieval services are running.

---

## 13. Start the Entire Project

For local development, keep the required services running in separate terminals.

### Terminal 1 — Ollama

```powershell
ollama serve
```

If Ollama is already running, leave it running.

### Terminal 2 — Qdrant

Check the existing container:

```powershell
docker ps
```

Start the existing Qdrant container if necessary.

### Terminal 3 — FastAPI backend

```powershell
cd C:\Users\T9957\Desktop\PROCURE_BOT_1\procure_bot
.\.venv\Scripts\Activate.ps1
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```

### Terminal 4 — React frontend

```powershell
cd C:\Users\T9957\Desktop\PROCURE_BOT_1\procure_bot\frontend
npm run dev
```

Open:

**Application:** http://localhost:5173

**API documentation:** http://127.0.0.1:8001/docs

**Health check:** http://127.0.0.1:8001/health

All services required by the selected features must be available.

---

## 14. Troubleshooting

### Problem 1: Ollama server timeout

Check installed models:

```powershell
ollama list
```

If the server is not responding, inspect running Ollama processes and restart the server if necessary. Do not repeatedly start multiple Ollama servers.

### Problem 2: Python ModuleNotFoundError

Confirm that you are in the project root:

```powershell
cd C:\Users\T9957\Desktop\PROCURE_BOT_1\procure_bot
```

Activate the correct virtual environment and install dependencies:

```powershell
python -m pip install -r requirements.txt
```

Use the backend command documented in Section 10.

### Problem 3: Port 8001 is already in use

Check which process is using the port:

```powershell
netstat -ano | findstr :8001
```

Inspect the corresponding process before stopping it. Do not terminate unrelated processes.

### Problem 4: Frontend cannot connect to the backend

Verify the backend first:

http://127.0.0.1:8001/health

Then inspect the browser's developer console and network requests. Check the API base URL, CORS configuration, and backend logs.

### Problem 5: Dashboard data is empty

Check:

* Whether the backend endpoints respond successfully.
* Whether the required data files or database are available.
* Whether the expected Qdrant collection exists.
* Whether procurement data has been loaded correctly.

### Problem 6: AI queries fail

Check that:

* Ollama is running.
* The configured language model is installed.
* The embedding model is installed if retrieval requires it.
* Qdrant is available if the query uses vector retrieval.
* The backend is configured with the correct service URLs and model names.

### Problem 7: npm run dev fails

Navigate to the frontend directory:

```powershell
cd frontend
```

Install the dependencies:

```powershell
npm install
```

Then start Vite:

```powershell
npm run dev
```

If an error remains, inspect the complete terminal message before modifying the code.

---

## 15. GitHub Repository

Repository:

https://github.com/FATHIMALI/Procure_bot

To check your working tree:

```powershell
git status
```

To upload committed changes to GitHub:

```powershell
git add .
git commit -m "Update Procure Bot documentation"
git push origin main
```

Review `git status` and confirm that `.env`, credentials, virtual environments, model files, and other private or generated files are excluded before committing.

---

## 16. Deployment Notes

The project can be prepared for cloud deployment, but local development settings cannot be copied directly into a cloud environment without checking the service configuration.

A cloud deployment generally requires:

* A frontend hosting service.
* A backend hosting service.
* A reachable Qdrant instance if vector retrieval is required.
* A reachable LLM inference service.
* Correct production environment variables.
* Appropriate CORS and API URL configuration.
* Persistent storage or a suitable external database for data that must survive restarts.

**Important:** An Ollama model running on your personal laptop is not automatically accessible to a backend hosted on Render or another cloud service. A cloud deployment needs a separately reachable inference service or another suitable AI hosting arrangement.

Free hosting services can have usage limits, sleeping services, storage limitations, or other restrictions. Verify the current provider's terms before deploying.

Never publish API keys, passwords, access tokens, private data, or sensitive procurement documents in a public repository.

---

## 17. Future Improvements

Potential future enhancements include:

* Role-based access control.
* Approval workflows for procurement requests.
* Enhanced supplier risk scoring.
* More detailed procurement analytics.
* Automated document ingestion and indexing.
* Audit logs for procurement activities.
* Production-grade persistence and authentication.
* Automated testing and CI/CD deployment.

These are possible improvements and are not claims that the features are already implemented.


