# Loop Feedback Platform

This repository is split into a separated **Frontend** and **Backend** architecture.

## 🚀 Setup Instructions

You need to run two separate servers during development.

### 1. Database & Backend Setup
Navigate into the `backend` directory to set up the database and start the Express server.

```bash
cd backend
npm install
```
**Configure Environment Variables:**
1. Create a `.env` file in the `backend/` directory (you can copy `.env.example` if it exists).
2. Add your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

**Initialize the Database:**
```bash
npx prisma migrate dev --name init
npm run prisma seed
```

**Start the Backend Server:**
```bash
npm run dev
```
*The backend will be running on http://localhost:4000*

### 2. Frontend Setup
Open a **new** terminal window and navigate into the `frontend` directory to start the Next.js application.

```bash
cd frontend
npm install
npm run dev
```
*The frontend will be running on http://localhost:3000*

---

## 🌿 Git Workflow (Step-by-Step)

To maintain a clean codebase, we do not push directly to `main`. Instead, we push to specific branches (`frontend` or `backend`) based on the scope of the work.

### Step 1: Switch to the Correct Branch
Before you start coding, switch to the branch corresponding to what you are working on.

**If working on the UI (React/Next.js):**
```bash
git checkout frontend
```

**If working on the API (Express/Prisma):**
```bash
git checkout backend
```

### Step 2: Commit Your Changes
Once you have made changes, stage and commit them.
```bash
git add .
git commit -m "Your descriptive commit message"
```

### Step 3: Push to GitHub
Push your committed changes to the branch on GitHub.

*(If you are on the frontend branch)*
```bash
git push origin frontend
```

*(If you are on the backend branch)*
```bash
git push origin backend
```

### Step 4: Merge to Main
Once your feature is complete and pushed to GitHub:
1. Go to the repository on GitHub.
2. Open a **Pull Request** from `frontend` (or `backend`) into `main`.
3. Review the changes and merge the Pull Request. 

Alternatively, to merge locally:
```bash
git checkout main
git merge frontend  # (or backend)
git push origin main
```
