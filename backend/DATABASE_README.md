# Backend API with Database Persistence

FastAPI backend with SQLite database for expense management and OCR receipt processing.

## New Features Added

### Database Layer
- **SQLite** database (`expenses.db`)
- **SQLAlchemy ORM** for database operations
- Automatic table creation on startup
- Proper session management with dependency injection

### New Files Created

```
backend/
├── database.py          # Database configuration and session management
├── models.py            # SQLAlchemy models (Expense table)
├── schemas.py           # Pydantic schemas for validation
├── main.py              # Updated with CRUD endpoints
└── expenses.db          # SQLite database (auto-created)
```

## Installation

1. Install new dependencies:
```bash
pip install sqlalchemy==2.0.23
```

Or install all:
```bash
pip install -r requirements_updated.txt
```

2. Run the server:
```bash
python main.py
```

The database will be automatically created on first run.

## Database Schema

### Expense Table

| Column   | Type   | Description                    |
|----------|--------|--------------------------------|
| id       | int    | Primary key (auto-increment)   |
| merchant | string | Merchant/store name            |
| amount   | float  | Expense amount                 |
| date     | string | Date (YYYY-MM-DD format)       |
| category | string | Expense category               |

## API Endpoints

### 1. Upload Receipt (OCR)
**POST** `/upload`

Upload receipt image for OCR processing.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response:**
```json
{
  "status": "success",
  "data": {
    "merchant_name": "Store Name",
    "total_amount": "25.50",
    "date": "2024-01-15"
  }
}
```

---

### 2. Create Expense
**POST** `/expense`

Save a new expense to the database.

**Request Body:**
```json
{
  "merchant": "Starbucks",
  "amount": 5.50,
  "date": "2024-01-15",
  "category": "Food"
}
```

**Response:**
```json
{
  "id": 1,
  "merchant": "Starbucks",
  "amount": 5.50,
  "date": "2024-01-15",
  "category": "Food"
}
```

---

### 3. Get All Expenses
**GET** `/expenses`

Retrieve all expenses from the database (ordered by date, newest first).

**Response:**
```json
[
  {
    "id": 1,
    "merchant": "Starbucks",
    "amount": 5.50,
    "date": "2024-01-15",
    "category": "Food"
  },
  {
    "id": 2,
    "merchant": "Uber",
    "amount": 12.00,
    "date": "2024-01-14",
    "category": "Transport"
  }
]
```

---

### 4. Get Single Expense
**GET** `/expense/{id}`

Retrieve a specific expense by ID.

**Response:**
```json
{
  "id": 1,
  "merchant": "Starbucks",
  "amount": 5.50,
  "date": "2024-01-15",
  "category": "Food"
}
```

---

### 5. Delete Expense
**DELETE** `/expense/{id}`

Delete an expense by ID.

**Response:**
```json
{
  "status": "success",
  "message": "Expense 1 deleted successfully"
}
```

---

## Usage Flow

### Complete Receipt Processing Flow

1. **Upload Receipt**
   ```bash
   curl -X POST "http://localhost:8000/upload" \
     -F "file=@receipt.jpg"
   ```

2. **Save Extracted Data**
   ```bash
   curl -X POST "http://localhost:8000/expense" \
     -H "Content-Type: application/json" \
     -d '{
       "merchant": "Days Inn",
       "amount": 6.02,
       "date": "2012-07-14",
       "category": "Hotel"
     }'
   ```

3. **Retrieve All Expenses**
   ```bash
   curl "http://localhost:8000/expenses"
   ```

---

## Frontend Integration

### Update Frontend to Use Database

Replace localStorage with API calls:

```javascript
// Load expenses from database
useEffect(() => {
  fetch('http://localhost:8000/expenses')
    .then(res => res.json())
    .then(data => setExpenses(data))
    .catch(err => console.error(err));
}, []);

// Add expense to database
const addExpense = async (expense) => {
  const response = await fetch('http://localhost:8000/expense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense)
  });
  const newExpense = await response.json();
  setExpenses([...expenses, newExpense]);
};

// Delete expense from database
const deleteExpense = async (id) => {
  await fetch(`http://localhost:8000/expense/${id}`, {
    method: 'DELETE'
  });
  setExpenses(expenses.filter(e => e.id !== id));
};
```

---

## Testing with cURL

### Create Expense
```bash
curl -X POST "http://localhost:8000/expense" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "Walmart",
    "amount": 45.99,
    "date": "2024-01-20",
    "category": "Shopping"
  }'
```

### Get All Expenses
```bash
curl "http://localhost:8000/expenses"
```

### Delete Expense
```bash
curl -X DELETE "http://localhost:8000/expense/1"
```

---

## Interactive API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

You can test all endpoints directly from the browser!

---

## Database Management

### View Database Contents

Using SQLite CLI:
```bash
sqlite3 expenses.db
```

```sql
-- View all expenses
SELECT * FROM expenses;

-- Count expenses
SELECT COUNT(*) FROM expenses;

-- Delete all expenses
DELETE FROM expenses;
```

### Backup Database
```bash
cp expenses.db expenses_backup.db
```

---

## Error Handling

All endpoints include proper error handling:

- **400**: Bad request (invalid data)
- **404**: Resource not found
- **422**: Validation error
- **500**: Server error

Example error response:
```json
{
  "detail": "Expense with ID 999 not found"
}
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│         FastAPI Application             │
├─────────────────────────────────────────┤
│  Endpoints:                             │
│  • POST /upload    (OCR)                │
│  • POST /expense   (Create)             │
│  • GET  /expenses  (Read All)           │
│  • GET  /expense/{id} (Read One)        │
│  • DELETE /expense/{id} (Delete)        │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      SQLAlchemy ORM Layer               │
├─────────────────────────────────────────┤
│  • Models (Expense)                     │
│  • Schemas (Pydantic validation)        │
│  • Session management                   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         SQLite Database                 │
│         (expenses.db)                   │
├─────────────────────────────────────────┤
│  Table: expenses                        │
│  • id, merchant, amount, date, category │
└─────────────────────────────────────────┘
```

---

## Benefits of Database Persistence

✅ **Persistent Storage**: Data survives server restarts
✅ **Concurrent Access**: Multiple clients can access data
✅ **Data Integrity**: ACID transactions
✅ **Scalability**: Easy to migrate to PostgreSQL/MySQL
✅ **Query Power**: Complex filtering and sorting
✅ **Backup**: Easy database backup and restore

---

## Next Steps (Optional Enhancements)

1. Add filtering: `/expenses?category=Food&date=2024-01-15`
2. Add pagination: `/expenses?skip=0&limit=10`
3. Add update endpoint: `PUT /expense/{id}`
4. Add search: `/expenses/search?q=starbucks`
5. Add date range queries
6. Add expense statistics endpoint
7. Add user authentication
8. Migrate to PostgreSQL for production

---

## Troubleshooting

### Database locked error
- Close any SQLite browser tools
- Restart the server

### Table doesn't exist
- Delete `expenses.db` and restart server
- Tables will be recreated automatically

### Import errors
- Make sure all new files are in the backend directory
- Install SQLAlchemy: `pip install sqlalchemy`

---

## Summary

You now have a complete backend with:
- ✅ OCR receipt processing
- ✅ SQLite database persistence
- ✅ Full CRUD API for expenses
- ✅ Proper error handling
- ✅ Clean modular architecture
- ✅ Ready for frontend integration

The system is production-ready for local use!
