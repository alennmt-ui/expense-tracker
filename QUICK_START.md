# Quick Start - Reconnected Application

## ✅ Setup Complete

The frontend has been reconnected to the FastAPI backend.

---

## 🚀 Start the Application

### Terminal 1: Start Backend (FastAPI)
```bash
cd backend
uvicorn main:app --reload
```
**Backend runs on:** http://localhost:8000

### Terminal 2: Start Frontend (Express + Vite)
```bash
cd frontend
npm run dev
```
**Frontend runs on:** http://localhost:3000

---

## 🌐 Access the Application

**Open browser:** http://localhost:3000

---

## 🔧 How It Works

1. **Frontend Server (Port 3000)**
   - Express server with Vite middleware
   - Serves the React application
   - Has mock API routes (not used anymore)

2. **API Client (src/api/)**
   - Uses `VITE_API_URL=http://localhost:8000` from `.env`
   - All API calls go to FastAPI backend
   - Mock routes in server.ts are bypassed

3. **Backend (Port 8000)**
   - FastAPI with SQLite database
   - CORS allows port 3000
   - Handles all data operations

---

## 📊 Data Flow

```
Browser (localhost:3000)
  ↓
React App
  ↓
API Client (src/api/)
  ↓
FastAPI Backend (localhost:8000)
  ↓
SQLite Database
```

---

## ✅ Test Checklist

1. **Dashboard Loads**
   - Open http://localhost:3000
   - Dashboard displays data from backend
   - If database is empty, you'll see $0 values

2. **Add Expense**
   - Click "Add Expense" (right panel)
   - Fill form: merchant, amount, date, category
   - Submit → saves to backend database
   - Appears in transactions list

3. **Add Income**
   - Click "Add Income" (right panel)
   - Fill form: source, amount, date
   - Submit → saves to backend database
   - Appears in transactions list

4. **View Expenses Page**
   - Click "Expenses" in sidebar
   - Shows all expenses from database
   - Delete button works

5. **View Income Page**
   - Click "Income" in sidebar
   - Shows all income from database
   - Delete button works

6. **Set Monthly Limit**
   - Hover over "Monthly Spending Limit" bar
   - Click edit icon
   - Set limit → saves to backend

7. **OCR Receipt Upload**
   - Click "Scan Receipt" (right panel)
   - Upload receipt image
   - Extracts data → prefills expense form
   - Submit → creates expense

8. **Data Persistence**
   - Refresh page → data persists
   - Restart backend → data persists (SQLite)

---

## 🗄️ Database

**Location:** `backend/expenses.db`

**Reset Database:**
```bash
cd backend
python reset_database.py
```

---

## 🐛 Troubleshooting

### Frontend shows "Failed to load data"
- Check backend is running on port 8000
- Check `.env` has `VITE_API_URL=http://localhost:8000`
- Check browser console for errors

### CORS errors
- Backend already allows port 3000
- If issues persist, check backend terminal for errors

### Port already in use
**Backend (8000):**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend (3000):**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Gemini API warnings
- Warnings about "API key should be set" are from server.ts
- These are for the mock OCR (not used)
- Real OCR uses backend's Gemini integration
- Safe to ignore

---

## 📝 Notes

- Frontend server.ts has mock API routes (not used)
- All API calls go to FastAPI backend via .env config
- Backend handles all data operations
- Database is SQLite (expenses.db)
- CORS is configured for port 3000

---

## ✅ Ready to Use

Both servers are running:
- ✅ Backend: http://localhost:8000
- ✅ Frontend: http://localhost:3000

Open http://localhost:3000 and start using the application!
