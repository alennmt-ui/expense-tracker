# Monthly Spending Limit Feature - Implementation Guide

## Overview
Added a Monthly Spending Limit feature to help users track their spending against a budget. The system calculates current month expenses, shows remaining budget, and displays warnings when the limit is exceeded.

---

## BACKEND IMPLEMENTATION

### 1. Settings Model

**File:** `backend/settings_models.py`

```python
class Settings(Base):
    """Settings model for storing application configuration"""
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(Float, nullable=False)
```

**Purpose:** Simple key-value storage for application settings

**Storage Pattern:**
- Key: `'monthly_limit'`
- Value: Limit amount (float)

**Database Table:** `settings`
- Automatically created on application startup
- Unique constraint on `key` field

---

### 2. Settings Schemas

**File:** `backend/settings_schemas.py`

#### MonthlyLimitSet Schema
Used for POST /limit endpoint

**Validation:**
- `limit`: Must be > 0, < 1,000,000,000, rounded to 2 decimals

**Example:**
```json
{
  "limit": 3000.00
}
```

#### MonthlyLimitResponse Schema
Used for GET /limit endpoint

**Example:**
```json
{
  "monthly_limit": 3000.00
}
```

---

### 3. Updated FinancialSummary Schema

**File:** `backend/income_schemas.py`

**New Fields Added:**
```python
monthly_limit: Optional[float] = None
remaining: Optional[float] = None
limit_exceeded: bool = False
```

**Example Response:**
```json
{
  "total_income": 10000.00,
  "total_expense": 3500.00,
  "balance": 6500.00,
  "monthly_limit": 5000.00,
  "remaining": 1500.00,
  "limit_exceeded": false
}
```

---

### 4. API Endpoints

**File:** `backend/main.py`

#### POST /limit
Set or update monthly spending limit

**Request Body:**
```json
{
  "limit": 3000.00
}
```

**Response:** 200 OK
```json
{
  "monthly_limit": 3000.00
}
```

**Logic:**
1. Check if `monthly_limit` setting exists
2. If exists: Update value
3. If not exists: Create new setting
4. Commit to database

**Error Responses:**
- 400: Validation error (limit <= 0)
- 500: Database error

---

#### GET /limit
Retrieve current monthly spending limit

**Response:** 200 OK
```json
{
  "monthly_limit": 3000.00
}
```

**Logic:**
- Returns current limit if set
- Returns 0.0 if no limit is set

**Error Responses:**
- 500: Database error

---

#### Updated GET /summary
Enhanced to include monthly limit calculations

**Response:** 200 OK
```json
{
  "total_income": 10000.00,
  "total_expense": 3500.00,
  "balance": 6500.00,
  "monthly_limit": 5000.00,
  "remaining": 1500.00,
  "limit_exceeded": false
}
```

**Calculation Logic:**

```python
# 1. Get monthly limit from settings
limit_setting = db.query(Settings).filter(Settings.key == 'monthly_limit').first()
monthly_limit = limit_setting.value if limit_setting else None

# 2. Calculate current month expenses
current_month = datetime.now().strftime('%Y-%m')  # e.g., "2024-01"
current_month_expenses = db.query(Expense).filter(
    Expense.date.like(f"{current_month}%")
).all()
current_month_total = sum(exp.amount for exp in current_month_expenses)

# 3. Calculate remaining budget
if monthly_limit is not None:
    remaining = monthly_limit - current_month_total
    limit_exceeded = current_month_total > monthly_limit
```

**Key Points:**
- Only calculates current month expenses (not all-time)
- `remaining` can be negative if limit exceeded
- `limit_exceeded` is boolean flag for easy checking

---

## FRONTEND IMPLEMENTATION

### 1. SetMonthlyLimit Component

**File:** `frontend/src/components/SetMonthlyLimit.js`

**Features:**
- Displays current monthly limit
- Form to set/update limit
- Validation (limit > 0)
- Loading states
- Success/error messages

**Validation:**
- Limit must be entered
- Limit must be > 0
- Limit must be < 1,000,000,000

**Usage:**
```jsx
<SetMonthlyLimit />
```

**User Flow:**
1. See current limit displayed
2. Enter new limit amount
3. Click "Update Limit"
4. See success message
5. Limit updates immediately

---

### 2. Updated Dashboard Component

**File:** `frontend/src/components/Dashboard.js`

**New Features:**

#### Monthly Limit Card
Displays when limit is set (limit > 0)

**Shows:**
- Monthly Limit amount
- Spent This Month amount
- Remaining budget
- Progress bar (visual representation)
- Warning banner if limit exceeded

**Warning Banner:**
```jsx
{summary.limit_exceeded && (
  <div className="warning-banner">
    ⚠️ Warning: You have exceeded your monthly spending limit!
  </div>
)}
```

**Limit Information Display:**
```jsx
<div className="limit-info">
  <div className="limit-stat">
    <span>Monthly Limit:</span>
    <span>$3000.00</span>
  </div>
  <div className="limit-stat">
    <span>Spent This Month:</span>
    <span>$3500.00</span>
  </div>
  <div className="limit-stat">
    <span>Remaining:</span>
    <span className="remaining-negative">-$500.00</span>
  </div>
</div>
```

**Progress Bar:**
- Green when under limit
- Red when limit exceeded
- Shows percentage of limit used
- Width adjusts based on spending

**Calculation:**
```javascript
const currentMonth = new Date().toISOString().slice(0, 7); // "2024-01"
const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
```

---

### 3. Updated Navigation

**File:** `frontend/src/components/Navbar.js`

**New Navigation Option:**
- "Set Limit" button added between "Income List" and "Charts"

**Full Navigation:**
1. Dashboard
2. Add Expense
3. Upload Receipt
4. Expense List
5. Add Income
6. Income List
7. **Set Limit** (new)
8. Charts

---

### 4. Updated App.js

**File:** `frontend/src/App.js`

**Changes:**
- Imported `SetMonthlyLimit` component
- Added `'setLimit'` view case in renderView()

**New View:**
```javascript
case 'setLimit':
  return (
    <>
      {errorDisplay}
      <SetMonthlyLimit />
    </>
  );
```

---

### 5. CSS Styles

**File:** `frontend/src/App.css`

**New Styles Added:**

#### Warning Banner
```css
.warning-banner {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  padding: 1rem;
  border-radius: 4px;
}
```

#### Limit Information
```css
.limit-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.limit-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.remaining-positive {
  color: #27ae60;
}

.remaining-negative {
  color: #e74c3c;
}
```

#### Progress Bar
```css
.progress-bar-container {
  width: 100%;
  height: 30px;
  background-color: #ecf0f1;
  border-radius: 15px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #27ae60 0%, #2ecc71 100%);
}

.progress-bar.progress-exceeded {
  background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
}
```

---

## USAGE GUIDE

### Setting Monthly Limit

1. **Navigate to Set Limit**
   - Click "Set Limit" in navigation bar

2. **View Current Limit**
   - See current limit displayed at top
   - Shows $0.00 if no limit is set

3. **Enter New Limit**
   - Enter desired monthly spending limit
   - Example: 3000 for $3000/month budget

4. **Submit**
   - Click "Update Limit" button
   - See success message
   - Limit is saved immediately

---

### Viewing Limit on Dashboard

1. **Navigate to Dashboard**
   - Click "Dashboard" in navigation

2. **View Monthly Limit Card**
   - Card appears below main stats (if limit is set)
   - Shows three key metrics:
     - Monthly Limit
     - Spent This Month
     - Remaining

3. **Check Progress Bar**
   - Visual representation of spending
   - Green = under limit
   - Red = over limit
   - Shows percentage used

4. **Warning Banner**
   - Appears if limit is exceeded
   - Yellow background with warning icon
   - Clear message about exceeding limit

---

### Understanding the Calculations

#### Current Month Expenses
- Only counts expenses from current calendar month
- Example: If today is January 15, 2024
  - Counts all expenses with dates starting with "2024-01"
  - Does not include December 2023 or February 2024

#### Remaining Budget
```
Remaining = Monthly Limit - Current Month Expenses
```

**Examples:**
- Limit: $3000, Spent: $2000 → Remaining: $1000 (positive, green)
- Limit: $3000, Spent: $3500 → Remaining: -$500 (negative, red)

#### Limit Exceeded Flag
```
limit_exceeded = current_month_expenses > monthly_limit
```

**Triggers:**
- Warning banner appears
- Progress bar turns red
- Remaining amount shows in red

---

## TESTING CHECKLIST

### Backend Testing

#### Test POST /limit
```bash
# At http://localhost:8000/docs

# Set valid limit
POST /limit
{
  "limit": 3000.00
}
Expected: 200 OK with {"monthly_limit": 3000.00}

# Update existing limit
POST /limit
{
  "limit": 5000.00
}
Expected: 200 OK with {"monthly_limit": 5000.00}

# Invalid limit (negative)
POST /limit
{
  "limit": -100
}
Expected: 422 Validation Error

# Invalid limit (zero)
POST /limit
{
  "limit": 0
}
Expected: 422 Validation Error
```

#### Test GET /limit
```bash
# Get limit after setting
GET /limit
Expected: 200 OK with {"monthly_limit": 3000.00}

# Get limit when not set
GET /limit
Expected: 200 OK with {"monthly_limit": 0.0}
```

#### Test GET /summary with Limit
```bash
# Scenario 1: Under limit
# Set limit: $5000
# Add expenses this month: $2000
GET /summary
Expected:
{
  "total_income": X,
  "total_expense": X,
  "balance": X,
  "monthly_limit": 5000.00,
  "remaining": 3000.00,
  "limit_exceeded": false
}

# Scenario 2: Over limit
# Set limit: $3000
# Add expenses this month: $3500
GET /summary
Expected:
{
  "monthly_limit": 3000.00,
  "remaining": -500.00,
  "limit_exceeded": true
}
```

---

### Frontend Testing

#### Test Set Limit Page
1. Navigate to "Set Limit"
2. Verify current limit displays (0 if not set)
3. Enter valid limit (e.g., 3000)
4. Click "Update Limit"
5. Verify success message appears
6. Verify current limit updates to new value

#### Test Validation
1. Try to submit empty form
   - Expected: Error "Please enter a limit amount"
2. Enter negative number
   - Expected: Error "Limit must be greater than 0"
3. Enter 0
   - Expected: Error "Limit must be greater than 0"

#### Test Dashboard Display
1. Set monthly limit to $3000
2. Add expenses for current month totaling $2000
3. Navigate to Dashboard
4. Verify Monthly Limit Card appears
5. Verify displays:
   - Monthly Limit: $3000.00
   - Spent This Month: $2000.00
   - Remaining: $1000.00 (green)
6. Verify progress bar is green and shows ~67%
7. Verify no warning banner

#### Test Limit Exceeded
1. Add more expenses to exceed limit (total > $3000)
2. Refresh Dashboard
3. Verify:
   - Warning banner appears
   - Remaining amount is negative and red
   - Progress bar is red
   - Progress bar shows 100% (capped)

#### Test No Limit Set
1. Don't set any limit (or set to 0)
2. Navigate to Dashboard
3. Verify Monthly Limit Card does NOT appear
4. Verify only main stat cards show

---

## FILES CREATED/MODIFIED

### Backend Files Created
- ✅ `backend/settings_models.py` - Settings model for storing limit
- ✅ `backend/settings_schemas.py` - Pydantic schemas for limit validation

### Backend Files Modified
- ✅ `backend/income_schemas.py` - Updated FinancialSummary schema
- ✅ `backend/main.py` - Added /limit endpoints, updated /summary

### Frontend Files Created
- ✅ `frontend/src/components/SetMonthlyLimit.js` - Set limit component

### Frontend Files Modified
- ✅ `frontend/src/App.js` - Added SetMonthlyLimit to navigation
- ✅ `frontend/src/App.css` - Added limit-related styles
- ✅ `frontend/src/components/Dashboard.js` - Added limit display
- ✅ `frontend/src/components/Navbar.js` - Added "Set Limit" button

### Documentation Created
- ✅ `MONTHLY_LIMIT_IMPLEMENTATION.md` - This file

---

## ARCHITECTURE PATTERNS

### Simple Storage Pattern
- Used Settings table with key-value pairs
- Single row for `monthly_limit` setting
- Easy to extend for future settings

### Reused Existing Patterns
- Validation: Same pattern as Expense/Income
- API structure: Consistent with other endpoints
- Component structure: Follows AddExpense/AddIncome pattern
- Error handling: Same try-catch pattern

### Clean Separation
- Backend: Models, schemas, endpoints
- Frontend: Components, styles, navigation
- Clear data flow: API → State → UI

---

## KEY FEATURES

✅ **Set Monthly Limit** - Simple form to set/update budget
✅ **Current Month Calculation** - Only counts current month expenses
✅ **Visual Progress Bar** - Shows spending progress
✅ **Warning System** - Alert when limit exceeded
✅ **Color Coding** - Green (under), Red (over)
✅ **Validation** - Prevents invalid limits
✅ **Persistent Storage** - Limit saved in database
✅ **Real-time Updates** - Dashboard updates automatically

---

## EXAMPLE SCENARIOS

### Scenario 1: Setting First Limit
```
1. User navigates to "Set Limit"
2. Sees "Current Monthly Limit: $0.00"
3. Enters 3000 in form
4. Clicks "Update Limit"
5. Sees "Monthly limit updated successfully!"
6. Current limit now shows $3000.00
```

### Scenario 2: Under Budget
```
1. Monthly limit set to $3000
2. Current month expenses: $2000
3. Dashboard shows:
   - Monthly Limit: $3000.00
   - Spent This Month: $2000.00
   - Remaining: $1000.00 (green)
   - Progress bar: 66.7% (green)
   - No warning banner
```

### Scenario 3: Over Budget
```
1. Monthly limit set to $3000
2. Current month expenses: $3500
3. Dashboard shows:
   - ⚠️ Warning banner appears
   - Monthly Limit: $3000.00
   - Spent This Month: $3500.00
   - Remaining: -$500.00 (red)
   - Progress bar: 100% (red)
```

### Scenario 4: New Month
```
1. Previous month: Spent $3500 (over limit)
2. New month starts (e.g., February 1)
3. Dashboard resets:
   - Spent This Month: $0.00
   - Remaining: $3000.00 (full budget)
   - Progress bar: 0%
   - No warning banner
4. Limit remains at $3000 (persistent)
```

---

## SUMMARY

Successfully implemented Monthly Spending Limit feature with:

✅ **Backend:** Settings storage, limit endpoints, enhanced summary calculation
✅ **Frontend:** Set limit UI, dashboard display, warning system
✅ **Validation:** Comprehensive validation on both sides
✅ **User Experience:** Visual progress bar, color coding, clear warnings
✅ **Code Quality:** Clean, modular, follows existing patterns

The feature helps users stay within budget by tracking current month spending and providing visual feedback when approaching or exceeding their limit.

---

## QUICK START

1. **Restart Backend** (to create settings table)
   ```bash
   cd c:\developer\expense\backend
   python main.py
   ```

2. **Restart Frontend**
   ```bash
   cd c:\developer\expense\frontend
   npm start
   ```

3. **Set Your Limit**
   - Navigate to "Set Limit"
   - Enter your monthly budget
   - Click "Update Limit"

4. **Track Your Spending**
   - View Dashboard
   - See progress toward limit
   - Get warnings if exceeded

**Feature is ready to use!** 🎯
