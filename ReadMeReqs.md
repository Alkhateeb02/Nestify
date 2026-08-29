# 📋 Nestify Project Environment, Stack & Dependency Requirements

This document is the absolute reference for the technical stack, runtime environments, frameworks, and exact library versions used across all components of the Nestify platform.

---

## 💻 1. Core System Environments & Runtimes

The Nestify platform is composed of three decoupled sub-services requiring the following baseline runtimes:

| Component | Technology | Target Runtime / Version | Purpose |
| :--- | :--- | :--- | :--- |
| **System** | Windows OS | Windows 10/11 | Development & launch platform |
| **Backend API** | Node.js | `v18.0.0` or higher | Express web server & Prisma execution |
| **Frontend UI** | Node.js | `v18.0.0` or higher | Vite bundler & React compilation |
| **AI Service** | Python | `v3.10.x` or higher | FastAPI endpoints, PyTorch, FAISS |
| **Database** | PostgreSQL | `v14.0` or higher | Relational storage & database schemas |

---

## 🛠️ 2. Root Controller & Script Dependencies (System Python)

These libraries are installed globally or in the system's root Python environment to support the CustomTkinter desktop controller GUI and document generator utilities:

- **GUI Framework**: `customtkinter` == `5.2.2`
- **Document Generator**: `python-docx` == `1.2.0`
- **Presentation Generator**: `python-pptx` == `1.0.2`
- **Data Manipulation**: `pandas` == `3.0.1`
- **Numerical Operations**: `numpy` == `2.4.0`
- **Excel Sheet Handling**: `openpyxl` == `3.1.5`
- **Excel Report Exporter**: `xlsxwriter` == `3.2.9`
- **Image Processing**: `pillow` == `12.2.0`
- **Desktop Theme Engine**: `darkdetect` == `0.8.0`

---

## ⚙️ 3. Backend Express Server Dependencies (`backend/package-lock.json`)

The backend API server resides in `/backend`. It runs Express, uses Prisma ORM to talk to PostgreSQL, schedules daily cron jobs, and manages Socket.io connections.

### Production Dependencies
- **Backend Web Framework**: `express` == `4.22.1`
- **Prisma DB Client Wrapper**: `@prisma/client` == `7.8.0`
- **Prisma PostgreSQL Adapter**: `@prisma/adapter-pg` == `7.8.0`
- **PostgreSQL Database Driver**: `pg` == `8.20.0`
- **Password Hashing (Bcrypt)**: `bcrypt` == `5.1.1`
- **Authentication Tokens (JWT)**: `jsonwebtoken` == `9.0.3`
- **CORS Middleware**: `cors` == `2.8.6`
- **Environment Configuration**: `dotenv` == `16.6.1`
- **Google Authentication Client**: `google-auth-library` == `10.6.2`
- **Multipart Form Upload (Files)**: `multer` == `1.4.5-lts.2`
- **Automated Cron Scheduler**: `node-cron` == `4.2.1`
- **Email Sending Transport (SMTP)**: `nodemailer` == `8.0.7`
- **WebSockets Server (Socket.io)**: `socket.io` == `4.8.3`
- **Runtime Schema Validation**: `zod` == `3.25.76`

### Development Dependencies
- **Prisma Database Toolkit CLI**: `prisma` == `7.8.0`
- **Entity Relation Diagram Generator**: `prisma-erd-generator` == `2.4.2`
- **Mermaid Diagram Renderer CLI**: `@mermaid-js/mermaid-cli` == `11.14.0`
- **Server Auto-Restart Utility**: `nodemon` == `3.1.14`

---

## 🎨 4. Frontend React Client Dependencies (`gradp-react/package-lock.json`)

Located in `/gradp-react`. It utilizes Vite for building, Tailwind CSS v4 for styling, and Spline for modern 3D landing elements.

### Production Dependencies
- **Core View Engine**: `react` == `19.2.3`
- **Core View Binder**: `react-dom` == `19.2.3`
- **Client Routing**: `react-router-dom` == `7.13.0`
- **HTTP Communications Client**: `axios` == `1.15.2`
- **CSS Utility Framework**: `tailwindcss` == `4.1.18`
- **3D Spline Canvas Component**: `@splinetool/react-spline` == `4.1.0`
- **3D Engine Web Runtime**: `@splinetool/runtime` == `1.12.78`
- **Physics & Motion Animations**: `framer-motion` == `12.38.0`
- **Timeline-based Animations**: `gsap` == `3.14.2`
- **Lottie Vector Animation Player**: `lottie-react` == `2.4.1`
- **SVG Icon Palette**: `lucide-react` == `0.563.0`
- **Bilingual translation loader**: `i18next` == `25.8.0`
- **React i18n bindings**: `react-i18next` == `16.5.3`
- **Browser Language Detector**: `i18next-browser-languagedetector` == `8.2.0`

### Development Dependencies
- **Vite Frontend Bundler**: `vite` == `7.3.1`
- **Tailwind CSS Vite Compiler**: `@tailwindcss/vite` == `4.1.18`
- **Vite React Plugin**: `@vitejs/plugin-react` == `5.1.2`
- **Multi-Process Concurrency Manager**: `concurrently` == `9.2.1`
- **JavaScript Linting Engine**: `eslint` == `9.39.2`
- **ESLint rules for React hooks**: `eslint-plugin-react-hooks` == `7.0.1`
- **ESLint rules for React refresh**: `eslint-plugin-react-refresh` == `0.4.26`
- **Types for React compilation**: `@types/react` == `19.2.9`
- **Types for React DOM compilation**: `@types/react-dom` == `19.2.3`
- **ESLint Global environments config**: `globals` == `16.5.0`

---

## 🤖 5. AI Python Microservices Dependencies (`ai/nestify-ai/.venv`)

Located in `/ai/nestify-ai`. The service is structured as four FastAPI applications routed through a main Gateway API. It runs lifestyle vector embedding matching and listing auto-tagging.

### Python Libraries (Exact Resolved Versions)
- **FastAPI Core Framework**: `fastapi` == `0.136.3`
- **ASGI Web Server (Uvicorn)**: `uvicorn` == `0.49.0`
- **Data Validation & Schemas**: `pydantic` == `2.13.4`
- **FastAPI Starlette core bindings**: `starlette` == `1.2.1`
- **FastAPI multi-part body parser**: `python-multipart` == `0.0.32`
- **Tensor Computation Core (PyTorch)**: `torch` == `2.12.0`
- **Computer Vision Weights & Layers**: `torchvision` == `0.27.0`
- **Transformers Models NLP (DistilBERT)**: `transformers` == `5.10.2`
- **Similarity Index Flat Array Search**: `faiss-cpu` == `1.14.2`
- **Mathematical & Matrix operations**: `numpy` == `2.4.6`
- **Machine Learning operations**: `scikit-learn` == `1.9.0`
- **Database Connector / Mapping ORM**: `SQLAlchemy` == `2.0.50`
- **PostgreSQL Database Adapter Driver**: `psycopg2-binary` == `2.9.12`
- **Image handling and drawing**: `pillow` == `12.2.0`
- **HTTP Request handler**: `requests` == `2.34.2`
- **Environment variables loader**: `python-dotenv` == `1.2.2`
- **Math Symbol evaluation**: `sympy` == `1.14.0`
- **Text highlighting in logs**: `Pygments` == `2.20.0`
- **Formatting helpers in terminal logs**: `rich` == `15.0.0`
- **Progress bar visualization**: `tqdm` == `4.68.1`
