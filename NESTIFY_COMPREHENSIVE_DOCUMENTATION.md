# Nestify Platform – Comprehensive Technical Architecture & Integration Playbook
> [!NOTE]
> This documentation serves as the single source of truth for the Nestify Student Housing platform. It is formatted specifically for immediate parsing and structural understanding by AI developer agents (such as the Antigravity manager) and human developers.

---

## 1. System Overview & Architecture

Nestify is a high-performance, decoupled student housing marketplace designed specifically for **Al-Hussein Bin Talal University (AHU)** in Ma'an, Jordan. It transitions student renting and roommate matching from fragmented manual processes (such as unstructured Facebook groups and physical search) into a structured, real-time, data-driven system.

### Architectural Blueprint

```mermaid
graph TD
    %% Presentation Layer
    subgraph Client ["Client Layer (React & Vite)"]
        UI["React Client (Port 5173)"]
        ChatUI["Stateful Chatbot & UI Components"]
        AuthUI["Auth & Recovery Screens"]
    end

    %% Application Layer
    subgraph AppLayer ["Application & Orchestration Layer (Node.js & Express)"]
        Gate["Express Server (Port 5000)"]
        Cron["node-cron Scheduler (Midnight Jobs)"]
        SMTP["Nodemailer (SMTP SSL Port 465)"]
        Socket["Socket.io Notification Service"]
    end

    %% AI Microservices Layer
    subgraph AIService ["AI Microservices Layer (FastAPI & Python)"]
        FastAPI["FastAPI Gateway (Port 8000)"]
        Chatbot["RAG Chatbot Service (Gemini-1.5-Flash)"]
        Matching["Roommate Matcher (NumPy & FAISS)"]
        Tagging["Auto-Tagger (PyTorch, DistilBERT, ResNet18)"]
    end

    %% Data Layer
    subgraph Database ["Data Layer (PostgreSQL)"]
        PG["PostgreSQL Database"]
        Prisma["Prisma ORM Client"]
        SQLAlchemy["SQLAlchemy (AI Database Connections)"]
    end

    %% Communications
    UI -- Asynchronous HTTP & Proxy --> Gate
    Gate -- Prisma Queries --> PG
    Gate -- REST API Call (Port 8000) --> FastAPI
    FastAPI -- Cosine Similarity --> Matching
    FastAPI -- PyTorch Transformers --> Tagging
    FastAPI -- SQLAlchemy Direct Read --> PG
    Chatbot -- Gemini SDK & RAG Grounding --> PG
    Gate -- SMTP Relays --> SMTP
    Gate -- Real-time WebSockets --> UI
```

### Component Port Allocation & Communications
- **React Client**: `http://localhost:5173` (Proxies `/api` routes directly to the Express server).
- **Express Backend**: `http://localhost:5000` (Performs JWT verification, CRUD database actions, cron scheduling, and calls FastAPI).
- **FastAPI AI Microservice**: `http://127.0.0.1:8000` (Calculates vector roommate similarity, runs DistilBERT text classification, and calls Gemini for RAG queries).
- **Database (PostgreSQL)**: Port `5432` (Accessed via **Prisma ORM** in Node.js, and **SQLAlchemy** in Python).

---

## 2. PostgreSQL Relational Database Schema

The database is built on **PostgreSQL** and managed using **Prisma ORM**. The schema utilizes an inheritance (IS-A) model for users, separating students and landlords while sharing a central `users` table.

```mermaid
erDiagram
    users {
        BigInt user_id PK
        String name
        String email UK
        String password_hash
        String profile_image
        String phone_number
        String role
        Boolean verified
        Boolean banned
        DateTime created_at
    }
    students {
        BigInt student_id PK, FK
        String university_name
        String major
        String gender
        String academic_year
        String smoking_status
        String bio_interests
    }
    landlords {
        BigInt landlord_id PK, FK
        String national_id UK
        String business_name
        String verification_status
        Decimal rating
    }
    properties {
        BigInt property_id PK
        BigInt landlord_id FK
        String title
        String description
        String address
        Json ai_tags
        DateTime created_at
    }
    units {
        BigInt unit_id PK
        BigInt property_id FK
        String type
        Decimal price
        String availability_status
        String rental_type
    }
    bookings {
        BigInt booking_id PK
        BigInt student_id FK
        BigInt unit_id FK
        DateTime booking_date
        DateTime checkin_date
        DateTime checkout_date
        String rental_type
        String status
    }
    payments {
        BigInt payment_id PK
        BigInt booking_id FK, UK
        String transaction_id UK
        Decimal amount
        DateTime payment_date
        String payment_method
        DateTime due_date
        String status
    }
    ai_matching {
        BigInt match_id PK
        BigInt student1_id FK
        BigInt student2_id FK
        DateTime match_date
        Decimal similarity_score
    }
    maintenance_tickets {
        BigInt ticket_id PK
        BigInt student_id FK
        BigInt unit_id FK
        String issue_description
        DateTime ticket_date
        String status
    }
    reports {
        BigInt report_id PK
        BigInt student_id FK
        BigInt target_user_id FK
        BigInt property_id FK
        BigInt unit_id FK
        BigInt booking_id FK
        String issue_description
        DateTime report_date
        String status
    }

    users ||--o| students : "IS-A"
    users ||--o| landlords : "IS-A"
    landlords ||--o{ properties : "manages"
    properties ||--|{ units : "contains"
    students ||--o{ bookings : "makes"
    units ||--o{ bookings : "reserved_in"
    bookings ||--o| payments : "generates"
    students ||--o{ ai_matching : "participates_1"
    students ||--o{ ai_matching : "participates_2"
    students ||--o{ maintenance_tickets : "submits"
    units ||--o{ maintenance_tickets : "has_issue"
```

### Core Database Entities

1. **User Supertype (`users`)**:
   - Mapped to `@map("users")`. Holds common authentication credentials and profiles.
   - Enforces user verification (`verified` boolean) and block control (`banned` boolean).
2. **Student Subtype (`students`)**:
   - Shares a `1:1` relationship with `users` via `student_id` primary key.
   - Contains lifestyle metrics (`gender`, `smoking_status`, `bio_interests`) critical for AI roommate calculations.
3. **Landlord Subtype (`landlords`)**:
   - Mapped `1:1` to `users` via `landlord_id`.
   - Enforces strict registration records (`national_id`, `business_name`, and admin `verification_status`).
4. **Properties (`properties`) & Units (`units`)**:
   - A property belongs to one landlord and contains multiple units (rooms or beds).
   - Properties hold `ai_tags` as JSON blobs. Units specify price, `rental_type` (daily, monthly, semester), and `availability_status` (available, booked, maintenance).
5. **Bookings (`bookings`) & Payments (`payments`)**:
   - Represents the core contract. Enforces a `1:1` unique connection between a confirmed booking and its active invoice record.

---

## 3. Dynamic Lease & Billing Engine

Nestify implements a flexible billing engine supporting three stay configurations for university dormitories, with strict automated chron controls managed via `node-cron`.

### Billing Stay Classes
- **Daily Stays**:
  - Pro-rated per 24-hour cycle. Enforces `checkout_date` during initial booking creation.
  - Generates an immediate invoice. If payment is unpaid 24 hours after booking, the booking is automatically canceled, and unit availability is restored.
- **Monthly Stays**:
  - Full calendar months. The check-in month is pro-rated dynamically based on the remaining active days of the calendar month:
    $$\text{Amount Due} = \frac{\text{Unit Price} \times (\text{Total Days in Month} - \text{Check-in Day} + 1)}{\text{Total Days in Month}}$$
  - Subsequent payments are scheduled and invoiced on the **1st of every calendar month**.
- **Semester Stays**:
  - Fixed-term block of exactly **5 months**.
  - The first installment invoice is generated on check-in. Future installments are scheduled every 5 months.

### Automated Midnight Cron Daemon (`cron.js`)
All tasks execute daily at **00:00 (midnight)**:
1. **Payment Reminders (2-Days Prior)**:
   Scans `payments` for pending records where `due_date` is exactly in 2 days. Triggers in-app Notifications (`payment_reminder`).
2. **Checkout Notifications (2-Days Prior)**:
   Scans `bookings` where `rental_type == 'daily'` and `checkout_date` is exactly in 2 days. Triggers Notifications (`checkout_reminder`).
3. **Daily Booking Cancellation (24h Expiration)**:
   Scans daily bookings in `pending_approval` state created > 24 hours ago with unpaid invoices. Automatically updates status to `cancelled`, reverts `unit.availability_status` to `available`, and notifies the student.
4. **Overdue Payment Suspension**:
   Scans confirmed bookings with unpaid invoices past their `due_date`. Updates `payment.status` to `overdue`, updates `booking.status` to `suspended`, and notifies the student immediately.

---

## 4. AI Microservices Gateway (FastAPI)

Decoupling compute-intensive and deep learning models into Python microservices protects Node.js loop times and centralizes resource configuration.

### A. RAG-Grounded Chatbot Service (`chatbot_service.py`)
- **Intent & RAG Pattern**:
  Combines standard system instruction constraints with a **Retrieval-Augmented Generation** flow.
- **Direct Database Grounding**:
  Bypasses Node.js and executes direct SQLAlchemy SQL queries to extract available listings.
  ```sql
  SELECT p.property_id, p.title, p.description, p.address as location, u.price, u.type as room_type, u.availability_status
  FROM properties p
  JOIN units u ON p.property_id = u.property_id
  WHERE u.availability_status = 'available'
  LIMIT :limit;
  ```
- **Serialization Handler**:
  Casts `BigInt` property IDs into standard integers and `Decimal` pricing fields into python floats before payload handoffs to prevent Pydantic serialization errors.
- **Gemini SDK Handoff**:
  Uses Gemini API via custom HTTP requests to bypass SDK-version limits, building a system instruction prompt inject with filtered database JSON context.

### B. Lifestyle Roommate Matchmaker (`matching_service.py`)
- **Feature Vector Map**:
  Translates student preferences into 7-dimensional standardized floating-point arrays:
  - `sleep`: Late = `1`, Early = `0`
  - `smoke`: Yes = `1`, No = `0`
  - `clean`, `noise`, `social`, `study`: Scaled from rating $[1, 5]$ to $[0, 1]$ via:
    $$\text{Scaled Value} = \frac{\text{Rating} - 1}{4.0}$$
  - `pets_allowed`: Yes = `1`, No = `0`
- **FAISS Similarity Engine**:
  Uses the Facebook AI Similarity Search (`faiss`) library. Normalizes candidates and query vectors using L2 norm:
  ```python
  faiss.normalize_L2(vectors)
  faiss.normalize_L2(query)
  index = faiss.IndexFlatIP(vectors.shape[1]) # Inner Product calculates cosine similarity
  index.add(vectors)
  similarities, indices = index.search(query, k)
  ```
  Returns ranked roommate candidate profiles sorted by similarity percentage ($score \times 100$).

### C. Automated Tagging Service (`tagging_service.py`)
- **Deep Learning Text Encoder**:
  Loads pre-trained **DistilBERT** (`distilbert-base-uncased`) to encode the concatenated title and description of a new property listing.
- **Image Support Encoder (Optional)**:
  Uses a pre-trained **ResNet18** model to extract high-level visual features from property image uploads.
- **Explicit Boosters & Evidence Gating**:
  - Boosters search for explicit keywords (such as `wifi`, `internet`, `ac`, `furnished`) and overlay a high confidence boost ($0.75 - 1.00$).
  - Gating prevents sensitive tags (like `pets_allowed`, `smoking_allowed`) from being auto-applied based on loose semantic similarity alone unless explicit booster terms are found.
- **Contradiction Resolver**:
  Prevents mutual inclusion of clashing features (e.g. flagging a room as both `private_room` and `shared_room`). Halves the confidence of `shared_room` if `private_room` has an explicit boost.

---

## 5. Security & Authentication Polish

Nestify enforces strict boundaries during auth state changes, password recovery, and secure sessions:
- **Registration Isolation**:
  Sign-up controllers are completely isolated from login handlers. Storing session tokens inside local storage is prohibited during student or landlord registration; users remain completely signed out until they complete email verification.
- **Bilingual Action Warnings**:
  Form alerts notify users in both **Arabic** and **English** that a verification link has been delivered to their inbox.
- **Password Recovery Pipeline**:
  - Client request hits `POST /auth/forgot-password`.
  - Backend creates a cryptographically secure token, logs it in the database with an expiration time, and transmits a link using Nodemailer over **SSL Port 465**.
  - Student/Landlord visits `/reset-password?token=...` on the Vite client, validates password length ($\ge 6$ chars), and submits to `POST /auth/reset-password`.
- **JWT blacklisting**:
  Logging out calls `/auth/logout`, storing the token in the `revoked_tokens` table. Inbound middlewares reject requests using blacklisted tokens.

---

## 6. Developer Reference & Deployment Playbook

### Core Configurations (`.env` keys)

#### Backend Configuration (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/Nestify?schema=public"
JWT_SECRET="generate_a_secure_jwt_random_string_here"
FRONTEND_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"
AI_BASE_URL="http://127.0.0.1:8000"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=465
EMAIL_USER="your-ahu-app-mailbox@gmail.com"
EMAIL_PASS="your-gmail-app-password"
```

#### FastAPI Configuration (`ai/nestify-ai/.env`)
```ini
APP_NAME="Nestify AI Service"
DEBUG=true
HOST=127.0.0.1
PORT=8000
DATABASE_URL="postgresql://postgres:password@localhost:5432/Nestify?schema=public"
GEMINI_API_KEY="your_google_gemini_api_key"
GEMINI_MODEL="gemini-1.5-flash"
ROOMMATE_TOP_K=5
TAGGING_CONFIDENCE_THRESHOLD=0.55
```

### Installation & Startup Execution Playbook

> [!IMPORTANT]
> Always run background servers and verify database ports before starting the client.

#### Step 1: Database Migration
Navigate to `/backend` and push the database schema:
```powershell
cd backend
npm install
npx prisma db push
```

#### Step 2: Launch Backend & Client Simultaneously
From `/gradp-react`, run the unified concurrency tool:
```powershell
cd gradp-react
npm install
npm run dev:all
```
*This starts the Vite React Server on port 5173 and the Express API server on port 5000.*

#### Step 3: Run the AI Service
Navigate to `/ai/nestify-ai`, initialize python environment, and start FastAPI via Uvicorn:
```powershell
cd ai/nestify-ai
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*FastAPI runs on `http://127.0.0.1:8000`.*

### Integration Diagnostic Scripts
Developers can verify endpoint connectivity by executing the custom integration script:
```powershell
cd backend
node src/scripts/test-ai-integration.js
```
This runs a suite testing the Gemini RAG Chatbot, vector similarity searches, and DistilBERT property tagging returns.

---

## 7. Bug Graveyard (Resolved Production Issues)

| Bug / Anomaly | Root Cause Analysis | Production Resolution |
| :--- | :--- | :--- |
| **VerifyEmail Screen TypeError** | The Axios custom client (`api.js`) response interceptor automatically unwraps server envelopes to `response.data`. The verification page tried to access `response.data.message`, raising an exception. | Corrected frontend parsing code to read `response.message` directly, matching the unwrapped API client envelope. |
| **Navbar Login/Logout Glitch** | Student and Landlord sign-up handlers called `localStorage.setItem('token')` on registration submission, tricking the navbar into showing "Logout" instead of "Login". | Removed all local storage token writes from the registration modules. Users remain fully signed out until login. |
| **FastAPI JSON Encoding Crash** | SQLAlchemy RAG queries fetched properties where `property_id` was `BigInt` and `price` was `Decimal`. Pydantic's JSON Encoder threw errors. | Cast database query elements directly to python `int` and `float` types in `chatbot_service.py` before returning JSON payload. |
| **Reset Password Route Missing** | Express sent emails containing links targeting `http://localhost:5173/reset-password`, but the React Router was missing this path, generating 404s. | Developed the premium bilingual `/reset-password` page and registered it inside the React router table. |
| **SMTP SSL Port Handshake Error** | Swapping between different mail providers threw socket errors on default SMTP configurations. | Switched configurations to SSL Port `465` with explicit secure authorization parameters enabled in the backend transport config. |

---
*Nestify System Documentation – V2 Playbook Complete*
