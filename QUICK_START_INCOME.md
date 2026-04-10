# Quick Start Guide - Income & Balance System

## Prerequisites
- Backend running on http://localhost:8000
- Frontend running on http://localhost:3000

## Step 1: Restart Backend

The backend needs to restart to create the new `income` table.

```bash
cd c:\developer\expense\backend
python main.py
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The `income` table will be automatically created in `expenses.db`.

---

## Step 2: Restart Frontend

```bash
cd c:\developer\expense\frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view the app in the browser.
Local: http://localhost:3000
```

---

## Step 3: Test Income Features

### Add Income Entry

1. Open http://localhost:3000
2. Click **"Add Income"** in navigation
3. Fill the form:
   - Source: "Monthly Salary"
   - Amount: 5000
   - Date: Select today's date
4. Click **"Add Income"**
5. See success message

### View Income List

1. Click **"Income List"** in navigation
2. See your income entry in the table
3. Amount should be displayed in green

### Check Dashboard

1. Click **"Dashboard"** in navigation
2. See three cards:
   - **Total Income**: $5000.00 (green card)
   - **Total Expenses**: $X.XX (red card)
   - **Balance**: $X.XX (blue card)
3. Balance should be green if positive, red if negative

---

## Step 4: Test Balance Calculation

### Scenario 1: Positive Balance

1. Add Income: $5000 (Salary)
2. Add Expense: $2000 (Rent)
3. Check Dashboard:
   - Total Income: $5000.00
   - Total Expenses: $2000.00
   - Balance: $3000.00 (green text)

### Scenario 2: Negative Balance

1. Add Expense: $4000 (Large Purchase)
2. Check Dashboard:
   - Total Income: $5000.00
   - Total Expenses: $6000.00
   - Balance: -$1000.00 (red text)

---

## Step 5: Test Delete Income

1. Go to **"Income List"**
2. Click **"Delete"** on an entry
3. Confirm deletion in dialog
4. Entry disappears from list
5. Check Dashboard - balance updates automatically

---

## Step 6: Test API Endpoints (Optional)

Open http://localhost:8000/docs to test API directly:

### Test POST /income
```json
{
  "source": "Freelance Project",
  "amount": 1500.00,
  "date": "2024-01-20"
}
```

### Test GET /income
Returns all income entries

### Test GET /summary
Returns:
```json
{
  "total_income": 6500.00,
  "total_expense": 2000.00,
  "balance": 4500.00
}
```

### Test DELETE /income/{id}
Delete income by ID

---

## Validation Tests

### Test Invalid Amount
1. Go to "Add Income"
2. Enter amount: -100
3. Try to submit
4. See error: "Amount must be greater than 0"

### Test Future Date
1. Try to select a future date
2. Date picker should prevent future dates
3. If you bypass it, see error: "Date cannot be in the future"

### Test Empty Source
1. Leave source field empty
2. Try to submit
3. See error: "Income source is required"

---

## Navigation Overview

**New Navigation Options:**
- Add Income - Add new income entries
- Income List - View and delete income entries

**Existing Navigation:**
- Dashboard - View financial summary
- Add Expense - Add expenses manually
- Upload Receipt - OCR-based expense entry
- Expense List - View and edit expenses
- Charts - Expense visualizations

---

## Troubleshooting

### Backend Error: "Income table not found"
**Solution:** Restart backend to create the table

### Frontend Error: "Failed to fetch income"
**Solution:** Check backend is running on port 8000

### Summary Not Updating
**Solution:** Refresh the page or navigate away and back to Dashboard

### Balance Shows $0.00
**Solution:** Add at least one income or expense entry

---

## Success Indicators

✅ Income table created in database
✅ Can add income entries
✅ Income list displays entries
✅ Dashboard shows three summary cards
✅ Balance calculates correctly
✅ Balance color changes based on positive/negative
✅ Delete income works and updates summary
✅ Validation prevents invalid data

---

## What's Working

- ✅ Add income with validation
- ✅ View all income entries
- ✅ Delete income entries
- ✅ Financial summary calculation
- ✅ Dashboard display with three cards
- ✅ Automatic balance updates
- ✅ Color-coded balance (green/red)
- ✅ Income amounts in green
- ✅ Confirmation dialogs for delete

---

## Quick Test Sequence

```
1. Add Income: $5000 (Salary)
2. Add Income: $1500 (Freelance)
3. Add Expense: $2000 (Rent)
4. Add Expense: $500 (Groceries)
5. Check Dashboard:
   - Total Income: $6500.00
   - Total Expenses: $2500.00
   - Balance: $4000.00 (green)
6. Delete one income entry
7. Check Dashboard updates
8. View Income List
9. View Expense List
```

---

## System is Ready! 🎉

You now have a complete financial tracking system with:
- Income tracking
- Expense tracking
- Balance calculation
- Visual dashboard
- Full CRUD operations
- Comprehensive validation

Start tracking your finances!
