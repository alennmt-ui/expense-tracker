# BACKEND AUDIT & EXTENSION PLAN

## PHASE 1 — BACKEND AUDIT

### 1.1 EXISTING ENDPOINTS

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/expenses` | GET | Get all expenses | ✅ Working |
| `/expense` | POST | Create expense | ✅ Working |
| `/expense/{id}` | PUT | Update expense | ✅ Working |
| `/expense/{id}` | DELETE | Delete expense | ✅ Working |
| `/income` | GET | Get all income | ✅ Working |
| `/income` | POST | Create income | ✅ Working |
| `/income/{id}` | DELETE | Delete income | ✅ Working |
| `/summary` | GET | Financial summary | ✅ Working |
| `/limit` | GET | Get monthly limit | ✅ Working |
| `/limit` | POST | Set monthly limit | ✅ Working |
| `/upload` | POST | OCR receipt upload | ✅ Working |

### 1.2 EXISTING MODELS

**Expense Model** (`expenses` table)
- `id`: Integer (PK, auto-increment)
- `merchant`: String (not null)
- `amount`: Float (not null)
- `date`: String (YYYY-MM-DD, not null)
- `category`: String (not null)

**Income Model** (`income` table)
- `id`: Integer (PK, auto-increment)
- `source`: String (not null)
- `amount`: Float (not null)
- `date`: String (YYYY-MM-DD, not null)

**Settings Model** (`settings` table)
- `id`: Integer (PK, auto-increment)
- `key`: String (unique, indexed, not null)
- `value`: Float (not null)

### 1.3 EXISTING LOGIC (REUSABLE)

**Financial Summary Calculation** (`/summary`)
- ✅ Total income calculation
- ✅ Total expense calculation
- ✅ Balance calculation (income - expense)
- ✅ Monthly limit tracking
- ✅ Current month expense calculation
- ✅ Remaining budget calculation
- ✅ Limit exceeded flag

**Data Aggregation**
- ✅ Expenses ordered by date (descending)
- ✅ Income ordered by date (descending)
- ✅ Date filtering (current month)
- ✅ Sum aggregation

**Database Operations**
- ✅ CRUD operations for expenses
- ✅ CRUD operations for income
- ✅ Key-value settings storage

---

## PHASE 2 — GAP ANALYSIS

### 2.1 MISSING FEATURES

| Feature | Frontend Needs | Backend Status | Action |
|---------|---------------|----------------|--------|
| **Subscriptions** | Full CRUD | ❌ Missing | BUILD NEW |
| **Analytics - Category Breakdown** | Pie chart data | ⚠️ Partial (has category field) | EXTEND |
| **Analytics - Monthly Trends** | Time series data | ⚠️ Partial (has date field) | EXTEND |
| **Analytics - Metrics** | Net savings, avg daily spend, savings rate | ⚠️ Partial (can calculate) | EXTEND |
| **Insights - Health Score** | Numeric score | ❌ Missing | BUILD NEW |
| **Insights - Suggestions** | AI-generated text | ❌ Missing | BUILD NEW |
| **Insights - Top Category** | Category analysis | ⚠️ Partial (has category data) | EXTEND |

### 2.2 CLASSIFICATION

**1. ALREADY SUPPORTED (Reuse)**
- ✅ Total income/expense
- ✅ Balance calculation
- ✅ Monthly expense tracking
- ✅ Date-based filtering

**2. PARTIALLY SUPPORTED (Extend)**
- ⚠️ Category breakdown (has category field, need aggregation)
- ⚠️ Monthly trends (has date field, need time series)
- ⚠️ Spending metrics (can calculate from existing data)

**3. MISSING (Build New)**
- ❌ Subscription model + CRUD
- ❌ Financial health score algorithm
- ❌ AI insights generation
- ❌ Analytics aggregation endpoint

---

## PHASE 3 — BACKEND EXTENSION PLAN

### 3.1 NEW MODELS

**Subscription Model** (`subscriptions` table)
```python
- id: Integer (PK, auto-increment)
- name: String (not null) - e.g., "Netflix"
- amount: Float (not null) - monthly cost
- billing_date: Integer (1-31, not null) - day of month
- category: String (not null) - e.g., "Entertainment"
- status: String (default "active") - active/cancelled
- created_at: String (YYYY-MM-DD)
```

### 3.2 NEW ENDPOINTS

**Subscriptions**
- `GET /subscriptions` - List all subscriptions
- `POST /subscription` - Create subscription
- `PUT /subscription/{id}` - Update subscription
- `DELETE /subscription/{id}` - Delete subscription

**Analytics**
- `GET /analytics` - Aggregated analytics data
  - Category breakdown (pie chart)
  - Monthly trends (6 months)
  - Key metrics (savings, avg spend, rate)

**Insights**
- `GET /insights` - Financial insights
  - Health score (0-100)
  - Top spending category
  - Suggestions (rule-based)

### 3.3 REUSE STRATEGY

**For Analytics:**
- ✅ Reuse existing `Expense` queries
- ✅ Reuse existing `Income` queries
- ✅ Reuse date filtering logic
- ✅ Add GROUP BY for category aggregation
- ✅ Add date range filtering for trends

**For Insights:**
- ✅ Reuse expense/income totals from `/summary`
- ✅ Reuse category data from expenses
- ✅ Calculate health score from existing metrics
- ✅ Generate suggestions based on spending patterns

**For Subscriptions:**
- ✅ Follow same pattern as Expense/Income models
- ✅ Reuse database session management
- ✅ Reuse CRUD patterns

### 3.4 NO DUPLICATION

**Avoid:**
- ❌ Don't recalculate totals (use `/summary` logic)
- ❌ Don't duplicate expense queries
- ❌ Don't create separate date filtering functions
- ❌ Don't rebuild CRUD patterns

**Reuse:**
- ✅ Use existing database session (`get_db`)
- ✅ Use existing error handling patterns
- ✅ Use existing response models pattern
- ✅ Use existing date format (YYYY-MM-DD)

---

## PHASE 4 — IMPLEMENTATION DETAILS

### 4.1 SUBSCRIPTION MODEL

**File:** `backend/subscription_models.py`
```python
from sqlalchemy import Column, Integer, String, Float
from database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    billing_date = Column(Integer, nullable=False)  # 1-31
    category = Column(String, nullable=False)
    status = Column(String, default="active")
    created_at = Column(String, nullable=False)
```

**File:** `backend/subscription_schemas.py`
```python
from pydantic import BaseModel, Field

class SubscriptionCreate(BaseModel):
    name: str
    amount: float = Field(gt=0)
    billing_date: int = Field(ge=1, le=31)
    category: str
    status: str = "active"

class SubscriptionResponse(BaseModel):
    id: int
    name: str
    amount: float
    billing_date: int
    category: str
    status: str
    created_at: str
    
    class Config:
        from_attributes = True
```

### 4.2 ANALYTICS ENDPOINT

**Logic:**
```python
@app.get("/analytics")
async def get_analytics(db: Session = Depends(get_db)):
    # 1. Category Breakdown (reuse expense data)
    expenses = db.query(Expense).all()
    category_totals = {}
    for exp in expenses:
        category_totals[exp.category] = category_totals.get(exp.category, 0) + exp.amount
    
    # 2. Monthly Trends (last 6 months)
    # Group expenses and income by month
    
    # 3. Key Metrics
    # Reuse summary logic
    total_income = sum(i.amount for i in db.query(Income).all())
    total_expense = sum(e.amount for e in expenses)
    net_savings = total_income - total_expense
    
    # Calculate avg daily spend (current month)
    current_month = datetime.now().strftime('%Y-%m')
    month_expenses = [e for e in expenses if e.date.startswith(current_month)]
    days_in_month = datetime.now().day
    avg_daily_spend = sum(e.amount for e in month_expenses) / days_in_month if days_in_month > 0 else 0
    
    # Savings rate
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0
    
    return {
        "category_breakdown": category_totals,
        "monthly_trends": [...],  # 6 months data
        "metrics": {
            "net_savings": net_savings,
            "avg_daily_spend": avg_daily_spend,
            "savings_rate": savings_rate
        }
    }
```

### 4.3 INSIGHTS ENDPOINT

**Logic:**
```python
@app.get("/insights")
async def get_insights(db: Session = Depends(get_db)):
    expenses = db.query(Expense).all()
    income = db.query(Income).all()
    
    # 1. Health Score (0-100)
    total_income = sum(i.amount for i in income)
    total_expense = sum(e.amount for e in expenses)
    
    # Simple algorithm:
    # - Savings rate: 40 points (max if >30%)
    # - Expense/Income ratio: 30 points (max if <70%)
    # - Budget adherence: 30 points (max if within limit)
    
    savings_rate = ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0
    health_score = min(100, int(
        (min(savings_rate / 30, 1) * 40) +  # Savings component
        (max(0, 1 - total_expense / total_income) * 30) +  # Expense ratio
        30  # Base score
    ))
    
    # 2. Top Spending Category
    category_totals = {}
    for exp in expenses:
        category_totals[exp.category] = category_totals.get(exp.category, 0) + exp.amount
    top_category = max(category_totals.items(), key=lambda x: x[1]) if category_totals else ("None", 0)
    
    # 3. Suggestions (rule-based)
    suggestions = []
    if savings_rate < 20:
        suggestions.append({
            "title": "Increase Savings Rate",
            "description": f"Your savings rate is {savings_rate:.1f}%. Aim for at least 20%.",
            "type": "optimization",
            "impact": "High"
        })
    
    if top_category[1] > total_expense * 0.3:
        suggestions.append({
            "title": "High Spending Alert",
            "description": f"{top_category[0]} accounts for {top_category[1]/total_expense*100:.0f}% of expenses.",
            "type": "audit",
            "impact": "Medium"
        })
    
    return {
        "health_score": health_score,
        "top_category": {"name": top_category[0], "amount": top_category[1]},
        "suggestions": suggestions
    }
```

---

## PHASE 5 — FRONTEND CONNECTION

### 5.1 NEW API MODULES

**File:** `frontend/src/api/subscriptions.ts`
```typescript
export async function getSubscriptions(): Promise<SubscriptionResponse[]>
export async function createSubscription(data): Promise<SubscriptionResponse>
export async function deleteSubscription(id): Promise<void>
```

**File:** `frontend/src/api/analytics.ts`
```typescript
export async function getAnalytics(): Promise<AnalyticsResponse>
```

**File:** `frontend/src/api/insights.ts`
```typescript
export async function getInsights(): Promise<InsightsResponse>
```

### 5.2 DATA MAPPING

**Analytics Page:**
- `GET /analytics` → category pie chart
- `GET /analytics` → monthly trend chart
- `GET /analytics` → metrics cards

**Subscriptions Page:**
- `GET /subscriptions` → subscription table
- `POST /subscription` → add subscription
- `DELETE /subscription/{id}` → delete subscription

**Insights Page:**
- `GET /insights` → health score
- `GET /insights` → suggestions list
- `GET /insights` → top category

### 5.3 NO UI CHANGES

- ✅ Keep existing chart components
- ✅ Keep existing table layouts
- ✅ Keep existing card designs
- ✅ Only replace mock data with API calls

---

## PHASE 6 — VALIDATION CHECKLIST

### 6.1 NO DUPLICATION
- [ ] Analytics reuses expense/income queries
- [ ] Insights reuses summary calculations
- [ ] Subscriptions follow existing CRUD pattern
- [ ] No duplicate date filtering logic

### 6.2 CORRECT DATA USAGE
- [ ] Category breakdown uses existing expense.category
- [ ] Monthly trends use existing date fields
- [ ] Health score uses existing totals
- [ ] Subscriptions stored in separate table

### 6.3 REAL DATA REFLECTION
- [ ] Charts update when expenses change
- [ ] Insights change based on spending patterns
- [ ] Health score recalculates on data change
- [ ] Subscriptions persist in database

### 6.4 DATABASE PERSISTENCE
- [ ] Subscriptions table created
- [ ] CRUD operations work
- [ ] Data survives server restart
- [ ] Foreign key constraints (if needed)

---

## RISKS & LIMITATIONS

### Risks
1. **Performance:** Analytics endpoint may be slow with large datasets
   - Mitigation: Add pagination, caching, or database indexing
   
2. **Health Score Algorithm:** Simple rule-based, not ML
   - Limitation: Won't adapt to user patterns
   - Future: Could integrate actual AI/ML

3. **Insights Generation:** Static rules, not dynamic
   - Limitation: Limited suggestion variety
   - Future: Could use LLM for personalized insights

4. **Date Format:** String-based dates may cause sorting issues
   - Mitigation: Already ordered by date in queries
   - Future: Consider migrating to Date type

### Limitations
1. **No Historical Tracking:** Subscriptions don't track payment history
2. **No Recurring Logic:** Subscriptions don't auto-create expenses
3. **No Budget Categories:** Can't set per-category limits
4. **No Multi-Currency:** All amounts in single currency

---

## IMPLEMENTATION PRIORITY

### Phase 1 (Critical)
1. Subscription model + CRUD endpoints
2. Analytics endpoint (basic)
3. Frontend API integration

### Phase 2 (Important)
4. Insights endpoint
5. Health score algorithm
6. Suggestion generation

### Phase 3 (Enhancement)
7. Performance optimization
8. Advanced analytics
9. ML-based insights

---

## ESTIMATED EFFORT

- Subscription model + endpoints: 2 hours
- Analytics endpoint: 3 hours
- Insights endpoint: 2 hours
- Frontend integration: 2 hours
- Testing + debugging: 2 hours

**Total: ~11 hours**

---

## SUCCESS CRITERIA

✅ Subscriptions page shows real data from database
✅ Analytics charts reflect actual expenses/income
✅ Insights change based on user spending
✅ Health score updates dynamically
✅ No duplicate backend logic
✅ No UI changes required
✅ All data persists in database
