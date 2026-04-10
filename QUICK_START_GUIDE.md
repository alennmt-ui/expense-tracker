# Quick Start Guide - Real Data Testing

## Start the Application

### 1. Start Backend (Terminal 1)
```bash
cd c:\developer\expense\backend
python main.py
```
✅ Backend running on: `http://localhost:8000`

### 2. Start Frontend (Terminal 2)
```bash
cd c:\developer\expense\frontend
npm run dev
```
✅ Frontend running on: `http://localhost:3000`

---

## Test Real Data Features

### Test 1: Add Expense
1. Click **"Add Expense"** button (right panel)
2. Fill in:
   - Merchant: "Whole Foods"
   - Amount: 150
   - Category: "Groceries"
   - Date: Today
3. Click **"Add Expense"**

**Expected Result**:
- ✅ Dashboard balance decreases by $150
- ✅ Category chart updates with Groceries
- ✅ Recent transactions shows new expense
- ✅ Monthly spending limit bar updates

---

### Test 2: Add Income
1. Click **"Add Income"** button (right panel)
2. Fill in:
   - Source: "Dividend Income"
   - Amount: 500
   - Date: Today
3. Click **"Add Income"**

**Expected Result**:
- ✅ Dashboard balance increases by $500
- ✅ Passive Income card shows $500
- ✅ Recent transactions shows new income
- ✅ Health score may increase

---

### Test 3: Add Subscription
1. Navigate to **"Subscriptions"** page (left sidebar)
2. Click **"Add Subscription"** button
3. Fill in:
   - Name: "Netflix"
   - Amount: 15.99
   - Billing Date: 1
   - Category: "Entertainment"
4. Click **"Add"**

**Expected Result**:
- ✅ Subscription appears in list
- ✅ Dashboard Fixed Costs card shows $15.99
- ✅ Dashboard subscriptions list shows Netflix
- ✅ Insights may suggest subscription review

---

### Test 4: View Analytics
1. Navigate to **"Analytics"** page (left sidebar)
2. Observe:
   - Category breakdown chart
   - Monthly trends chart
   - Metrics (savings rate, daily spend)

**Expected Result**:
- ✅ Category chart shows real expense breakdown
- ✅ Monthly trends show last 6 months
- ✅ Metrics calculated from real data
- ✅ No hardcoded values

---

### Test 5: View Insights
1. Navigate to **"Insights"** page (left sidebar)
2. Observe:
   - Health score (0-100)
   - Top spending category
   - Suggestions list

**Expected Result**:
- ✅ Health score calculated from savings rate
- ✅ Top category identified correctly
- ✅ Suggestions relevant to spending patterns
- ✅ No static suggestions

---

### Test 6: Set Monthly Limit
1. On Dashboard, hover over spending limit bar
2. Click **edit icon** (top right)
3. Set limit: 2000
4. Click **"Set Limit"**

**Expected Result**:
- ✅ Spending limit bar updates
- ✅ Consumed percentage recalculates
- ✅ Remaining amount updates
- ✅ Data persists after refresh

---

### Test 7: Data Persistence
1. Add 2-3 expenses
2. Add 1-2 income entries
3. Add 1 subscription
4. **Refresh the page** (F5)

**Expected Result**:
- ✅ All data still visible
- ✅ Charts still show real data
- ✅ Balance unchanged
- ✅ No data loss

---

### Test 8: Delete Operations
1. Navigate to **"Expenses"** page
2. Click **delete** on an expense
3. Navigate to **"Subscriptions"** page
4. Click **delete** on a subscription

**Expected Result**:
- ✅ Expense removed from list
- ✅ Dashboard balance updates
- ✅ Subscription removed from list
- ✅ Fixed costs updates

---

## Verify No Mock Data

### Dashboard Checks
- [ ] Balance is NOT $0 (if you added data)
- [ ] Passive Income is NOT $0 (if you added dividend income)
- [ ] Fixed Costs is NOT $0 (if you added subscriptions)
- [ ] Category chart does NOT show "Housing 35%, Food 25%"
- [ ] Trend chart does NOT show random values
- [ ] Health score is NOT 84
- [ ] Optimization suggestion is NOT "Reducing Dining Out by 12%"
- [ ] Subscriptions list is NOT empty

### Analytics Checks
- [ ] Category breakdown matches your expenses
- [ ] Monthly trends show real months (Jan, Feb, etc.)
- [ ] Metrics change when you add data

### Insights Checks
- [ ] Health score changes with spending
- [ ] Top category matches highest spending
- [ ] Suggestions are relevant to your data

---

## API Testing (Optional)

### Using Browser
Visit: `http://localhost:8000/docs`

This opens FastAPI's interactive API documentation where you can:
- Test all 17 endpoints
- See request/response schemas
- Execute API calls directly

### Using curl

**Get Summary**:
```bash
curl http://localhost:8000/summary
```

**Get Analytics**:
```bash
curl http://localhost:8000/analytics
```

**Get Insights**:
```bash
curl http://localhost:8000/insights
```

**Get Subscriptions**:
```bash
curl http://localhost:8000/subscriptions
```

---

## Database Inspection (Optional)

### Using SQLite Browser
1. Download: https://sqlitebrowser.org/
2. Open: `c:\developer\expense\backend\expenses.db`
3. View tables:
   - expenses
   - income
   - subscriptions
   - settings

### Using Python
```python
import sqlite3

conn = sqlite3.connect('backend/expenses.db')
cursor = conn.cursor()

# View all expenses
cursor.execute("SELECT * FROM expenses")
print(cursor.fetchall())

# View all subscriptions
cursor.execute("SELECT * FROM subscriptions")
print(cursor.fetchall())

conn.close()
```

---

## Troubleshooting

### Backend Not Starting
**Error**: `ModuleNotFoundError: No module named 'fastapi'`
**Fix**:
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Not Starting
**Error**: `Cannot find module 'vite'`
**Fix**:
```bash
cd frontend
npm install
```

### CORS Error
**Error**: `Access-Control-Allow-Origin`
**Fix**: Ensure backend is running on port 8000 and frontend on port 3000

### Database Locked
**Error**: `database is locked`
**Fix**: Close any SQLite browser windows and restart backend

### No Data Showing
**Issue**: Dashboard shows all zeros
**Fix**: Add some expenses and income using the UI

---

## Sample Data Script (Optional)

Create `backend/seed_data.py`:
```python
from database import get_db
from models import Expense
from income_models import Income
from subscription_models import Subscription
from datetime import datetime, timedelta

db = next(get_db())

# Add expenses
expenses = [
    Expense(merchant="Whole Foods", amount=150, date="2024-01-15", category="Groceries"),
    Expense(merchant="Shell Gas", amount=60, date="2024-01-16", category="Transport"),
    Expense(merchant="Netflix", amount=15.99, date="2024-01-01", category="Entertainment"),
]

# Add income
income = [
    Income(source="Salary", amount=5000, date="2024-01-01"),
    Income(source="Dividend Income", amount=200, date="2024-01-15"),
]

# Add subscriptions
subscriptions = [
    Subscription(name="Netflix", amount=15.99, billing_date=1, category="Entertainment", status="active", created_at="2024-01-01"),
    Subscription(name="Spotify", amount=9.99, billing_date=5, category="Entertainment", status="active", created_at="2024-01-01"),
]

for exp in expenses:
    db.add(exp)
for inc in income:
    db.add(inc)
for sub in subscriptions:
    db.add(sub)

db.commit()
print("Sample data added!")
```

Run:
```bash
cd backend
python seed_data.py
```

---

## Success Criteria

✅ **All tests pass**
✅ **No mock data visible**
✅ **All features work with real data**
✅ **Data persists after refresh**
✅ **Charts update dynamically**
✅ **Calculations are correct**

---

## Next Steps

1. ✅ Test all features above
2. ✅ Verify no mock data
3. ✅ Check data persistence
4. ✅ Review calculations
5. ✅ Test edge cases (empty data, large amounts)
6. 🚀 Deploy to production (optional)

---

## Support Resources

- **Backend API Docs**: http://localhost:8000/docs
- **Implementation Guide**: `REAL_DATA_IMPLEMENTATION.md`
- **Mock Data Removal**: `MOCK_DATA_REMOVAL.md`
- **Executive Summary**: `IMPLEMENTATION_SUMMARY.md`

---

**Status**: Ready to Test 🚀
