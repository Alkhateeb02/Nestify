# Nestify - Comprehensive Student Housing Platform

Nestify is a modern web application designed to connect students with property owners, featuring AI-driven roommate matching, property tagging, and secure booking management.

## 🚀 Project Structure

- **/backend**: Express.js API with Prisma ORM and PostgreSQL.
- **/gradp-react**: Vite-based React frontend with Tailwind CSS and Framer Motion.
- **/ai**: Python-based microservice for roommate matching and AI tagging.

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL**
- **Python** (3.10+)

### 2. Backend Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   - Copy `.env.example` to `.env`.
   - Update `DATABASE_URL` and other variables.
4. Initialize Database (Prisma):
   ```bash
   npx prisma migrate dev
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to `/gradp-react`:
   ```bash
   cd gradp-react
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 4. AI Microservice Setup
1. Navigate to `/ai/nestify-ai`:
   ```bash
   cd ai/nestify-ai
   ```
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the service:
   ```bash
   python main.py
   ```

---

## 🛠️ Key Features
- **Dual Login Portals**: Separate, secure login flows for students and landlords.
- **AI Roommate Matching**: Smart similarity scoring for students.
- **Interactive Dashboards**: Tailored views for property management and student search.
- **Real-time Notifications**: Email and socket-based updates.

## 🤝 Contribution
1. Clone the repository.
2. Follow the setup steps above.
3. Ensure you have the `.env` file configured locally.
4. Use `npm run dev:all` in the frontend directory to start both backend and frontend simultaneously.
