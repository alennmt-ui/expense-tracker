# Quick Start Guide - Integrated Expense Tracker

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Backend dependencies installed
- Frontend dependencies installed

## Step 1: Start Backend

```bash
cd backend
uvicorn main:app --reload
```

Backend will run on: **http://localhost:8000**

Verify backend is running:
- Open browser: http://localhost:8000
- Should see API status message

## Step 2: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

## Step 3: Test Integration

### Dashboard Load
1. Open http://localhost:5173
2. Dashboard should load with real data from backend
3. Check browser console for any errors

### Add Expense
1. Click "Add Expense" button (right panel)
2. Fill in:
   - Merchant: "Test Store"
   - Amount: 50.00
   - Date: (select today)
   - Category: Shopping
3. Click "Add Expense"
4. Expense should appear in transactions list
5. Refresh page - expense should persist

### Add Income
1. Click "Add Income" button (right panel)
2. Fill in:
   - Source: "Test Company"
   - Amount: 1000.00
   - Date: (select today)
3. Click "Add Income"
4. Income should appear in transactions list
5. Balance should update

### Set Monthly Limit
1. Hover over "Monthly Spending Limit" bar
2. Click edit icon (appears on hover)
3. Set limit: 5000
4. Click "Update Limit"
5. Limit bar should update
6. Refresh - limit should persist

### OCR Receipt Upload
1. Click "Scan Receipt" button (right panel)
2. Upload a receipt image
3. Wait for processing
4. Verify extracted data (merchant, amount, date)
5. Click "Confirm & Add Expense"
6. AddExpenseModal opens with prefilled data
7. Confirm and submit
8. Expense created from receipt

## Troubleshooting

### CORS Error
**Error:** "Access to fetch at 'http://localhost:8000/...' from origin 'http://localhost:5173' has been blocked by CORS policy"

**Fix:** Backend main.py already updated to allow localhost:5173

### Connection Refused
**Error:** "Failed to fetch" or "Network error"

**Fix:** Ensure backend is running on port 8000

### Data Not Loading
**Error:** Dashboard shows initial mock data

**Fix:** 
1. Check browser console for errors
2. Verify backend is running
3. Check .env file has correct VITE_API_URL

### Empty Transactions
**Issue:** Dashboard loads but no transactions

**Reason:** Database is empty (expected on first run)

**Fix:** Add some expenses and income using the modals

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Backend
No additional env vars needed for local development

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| http://localhost:8000/ | GET | API health check |
| http://localhost:8000/summary | GET | Financial summary |
| http://localhost:8000/expenses | GET | List expenses |
| http://localhost:8000/income | GET | List income |
| http://localhost:8000/expense | POST | Create expense |
| http://localhost:8000/income | POST | Create income |
| http://localhost:8000/limit | GET/POST | Get/Set limit |
| http://localhost:8000/upload | POST | Upload receipt |

## Database Location

SQLite database: `backend/expenses.db`

To reset database:
```bash
cd backend
rm expenses.db
# Restart backend - tables will be recreated
```

## Common Issues

### Port Already in Use

**Backend (8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend (5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Module Not Found (Backend)
```bash
cd backend
pip install -r requirements.txt
```

### Module Not Found (Frontend)
```bash
cd frontend
npm install
```

## Success Indicators

✅ Backend running: http://localhost:8000 shows API info
✅ Frontend running: http://localhost:5173 shows dashboard
✅ Data loads: Dashboard shows real data (or empty if DB is new)
✅ Add expense works: New expense appears in list
✅ Add income works: New income appears in list
✅ Refresh persists: Data remains after page refresh
✅ Limit updates: Monthly limit bar updates correctly

## Next Steps

1. Add more expenses and income
2. Test OCR with receipt images
3. Verify all calculations are correct
4. Test error handling (stop backend, try adding expense)
5. Check data persistence (restart backend, refresh frontend)

## Support

If issues persist:
1. Check browser console (F12)
2. Check backend terminal for errors
3. Verify all dependencies installed
4. Ensure ports 8000 and 5173 are available
