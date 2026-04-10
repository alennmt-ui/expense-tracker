# Frontend-Backend Integration Guide

## Overview
This document explains how the React frontend connects to the FastAPI backend for the Personal Expense Tracker application.

## Architecture

```
Frontend (React + TypeScript)
    ↓
API Service Layer (src/services/api.ts)
    ↓
Backend (FastAPI + SQLite)
```

## API Service Layer (`src/services/api.ts`)

### Purpose
- Centralized API communication
- Type-safe interfaces
- Error handling
- Reusable functions

### Functions Implemented

1. **fetchSummary()** → GET /summary
   - Returns: total_income, total_expense, balance, monthly_limit, remaining, limit_exceeded
   - Used by: Dashboard balance card, stats cards

2. **fetchExpenses()** → GET /expenses
   - Returns: Array of expense objects
   - Used by: Recent transactions list

3. **addExpense(expense)** → POST /expense
   - Sends: merchant, amount, date, category
   - Used by: Quick add form, OCR upload

4. **deleteExpense(id)** → DELETE /expense/{id}
   - Used by: Transaction delete button

5. **fetchIncome()** → GET /income
   - Returns: Array of income objects
   - Used by: Recent transactions list

6. **addIncome(income)** → POST /income
   - Sends: source, amount, date
   - Used by: Quick add form (when type is income)

7. **deleteIncome(id)** → DELETE /income/{id}
   - Used by: Transaction delete button

8. **uploadReceipt(file)** → POST /upload
   - Sends: FormData with image file
   - Returns: merchant_name, total_amount, date
   - Used by: Upload receipt button

9. **setLimit(limit)** → POST /limit
   - Sends: limit amount
   - Used by: Settings (not yet implemented in UI)

10. **getLimit()** → GET /limit
    - Returns: monthly_limit
    - Used by: Dashboard spending limit widget

## App.tsx Integration

### State Management

```typescript
// API Data
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [summary, setSummary] = useState<api.Summary | null>(null);

// UI State
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);
```

### Data Flow

#### 1. Initial Load (useEffect)
```
Component Mount
    ↓
loadData() called
    ↓
Parallel API calls:
  - fetchSummary()
  - fetchExpenses()
  - fetchIncome()
    ↓
Combine expenses + income into transactions[]
    ↓
Update state → UI renders
```

#### 2. Add Transaction
```
User fills form → Submit
    ↓
handleAddTransaction()
    ↓
if expense: api.addExpense()
if income: api.addIncome()
    ↓
loadData() (refresh all data)
    ↓
UI updates with new transaction
```

#### 3. Delete Transaction
```
User clicks delete → Confirm
    ↓
deleteTransaction(id, type)
    ↓
if expense: api.deleteExpense(id)
if income: api.deleteIncome(id)
    ↓
loadData() (refresh all data)
    ↓
UI updates without deleted item
```

#### 4. Upload Receipt (OCR)
```
User selects image file
    ↓
handleFileUpload()
    ↓
api.uploadReceipt(file)
    ↓
OCR processing (5-10 seconds)
    ↓
Returns: merchant_name, total_amount, date
    ↓
Pre-fill add transaction form
    ↓
User reviews/edits → Submit
    ↓
api.addExpense()
```

## UI Components Connected

### 1. Balance Card (Top Left)
- **Data Source**: `summary.balance`
- **Updates**: After any add/delete transaction
- **Animation**: CountUp effect on value change

### 2. Income/Expense Stats (Second Row)
- **Data Source**: `summary.total_income`, `summary.total_expense`
- **Updates**: After any add/delete transaction

### 3. Spending Limit Progress Bar
- **Data Source**: `summary.monthly_limit`, `summary.total_expense`
- **Calculation**: `(expenses / limit) * 100`
- **Color Logic**: 
  - Green: < 70%
  - Yellow: 70-90%
  - Red: > 90%

### 4. Recent Transactions List
- **Data Source**: `transactions` (combined expenses + income)
- **Sorting**: By date descending
- **Limit**: Shows first 6 items
- **Actions**: Delete button per transaction

### 5. Expense Breakdown Chart (Donut)
- **Data Source**: `transactions` filtered by type='expense'
- **Grouping**: By category
- **Updates**: After any expense add/delete

### 6. Quick Add Form (Modal)
- **Submit**: Calls `api.addExpense()` or `api.addIncome()`
- **Validation**: Amount required
- **Reset**: Clears form after success

### 7. Upload Receipt Button
- **Input**: File input (hidden)
- **Processing**: Shows spinner during OCR
- **Success**: Opens add form with pre-filled data
- **Error**: Shows error message below button

## Loading States

### 1. Initial Load
```tsx
if (loading) {
  return <LoadingSpinner />;
}
```

### 2. OCR Upload
```tsx
{isUploading ? (
  <Spinner text="Processing..." />
) : (
  <UploadIcon />
)}
```

### 3. Form Submission
- Button disabled during API call
- Could add spinner to button (future enhancement)

## Error Handling

### Global Error Display
```tsx
{error && (
  <ErrorToast message={error} onClose={() => setError(null)} />
)}
```

### Error Sources
1. Network failures (backend down)
2. API errors (validation, server errors)
3. OCR failures (no text extracted)

### Error Recovery
- User can dismiss error toast
- Can retry action
- Data remains in previous state

## Data Synchronization

### Strategy: Optimistic UI Updates
Currently using **pessimistic updates** (wait for API response):
1. User action
2. API call
3. Wait for response
4. Reload all data
5. UI updates

### Future Optimization
Could implement optimistic updates:
1. User action
2. Update UI immediately
3. API call in background
4. Rollback if error

## Type Safety

### Backend Response Types
```typescript
interface Expense {
  id: number;
  merchant: string;
  amount: number;
  date: string;
  category: string;
}

interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
  monthly_limit: number | null;
  remaining: number | null;
  limit_exceeded: boolean;
}
```

### Frontend Display Types
```typescript
interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note: string;
}
```

### Mapping
- Expense → Transaction (type='expense', note=merchant)
- Income → Transaction (type='income', note=source)

## CORS Configuration

Backend allows frontend origin:
```python
allow_origins=["http://localhost:3000"]
```

Frontend connects to:
```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## Testing the Integration

### 1. Start Backend
```bash
cd backend
uvicorn main:app --reload
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Verify Connections
- Open browser console
- Check for API calls in Network tab
- Verify no CORS errors
- Test each feature:
  - Add expense
  - Add income
  - Delete transaction
  - Upload receipt
  - View balance updates

## Known Limitations

1. **No Edit Functionality**: Can only add/delete, not edit
2. **No Pagination**: Loads all transactions (could be slow with many records)
3. **No Real-time Updates**: Must refresh to see changes from other sessions
4. **No Offline Support**: Requires backend connection
5. **No Caching**: Fetches fresh data on every action

## Future Enhancements

1. Add edit transaction functionality
2. Implement pagination for transactions
3. Add search/filter capabilities
4. Cache API responses
5. Add optimistic UI updates
6. Implement WebSocket for real-time updates
7. Add spending limit management UI
8. Export data functionality
9. Date range filters
10. Category management
