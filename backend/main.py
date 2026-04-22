"""
FastAPI Application for Receipt Processing
Connects OCR and Extractor modules via REST API
Includes database persistence with SQLAlchemy
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from collections import defaultdict
import os
import sys
import shutil
from pathlib import Path

# Add modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ocr'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'extractor'))

from ocr_module import process_receipt
from extractor import clean_text, extract_fields

# Import database components
from database import engine, get_db, Base
from models import Expense
from schemas import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from income_models import Income
from income_schemas import IncomeCreate, IncomeResponse, FinancialSummary
from settings_models import Settings
from settings_schemas import MonthlyLimitSet, MonthlyLimitResponse
from subscription_models import Subscription
from subscription_schemas import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from analytics_schemas import AnalyticsResponse, MonthlyTrend, AnalyticsMetrics
from insights_schemas import InsightsResponse, TopCategory, Suggestion

app = FastAPI(title="Receipt Processing API", version="1.0.0")

# Create database tables on startup
Base.metadata.create_all(bind=engine)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "https://frontend-rho-six-66.vercel.app",  # Vercel production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
TEMP_UPLOAD_DIR = "temp_uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Create temp directory if it doesn't exist
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)


def validate_image_file(filename: str) -> bool:
    """
    Validate if file has allowed image extension
    
    Args:
        filename (str): Name of the uploaded file
        
    Returns:
        bool: True if valid, False otherwise
    """
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


@app.post("/upload")
async def upload_receipt(file: UploadFile = File(...)):
    """
    Upload receipt image and extract structured data
    
    Args:
        file: Uploaded image file
        
    Returns:
        JSON response with extracted data
    """
    temp_file_path = None
    
    try:
        # Validate file type
        if not validate_image_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Save uploaded file temporarily
        temp_file_path = os.path.join(TEMP_UPLOAD_DIR, file.filename)
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Step 1: OCR - Extract text from image
        try:
            ocr_text = process_receipt(temp_file_path, output_txt_path=None)
        except EnvironmentError as e:
            raise HTTPException(
                status_code=503,
                detail=f"OCR service unavailable: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"OCR processing failed: {str(e)}"
            )
        
        # Check if OCR returned empty text
        if not ocr_text or not ocr_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No text could be extracted from the image"
            )
        
        # Step 2: Extract structured data from OCR text
        try:
            cleaned_text = clean_text(ocr_text)
            extracted_data = extract_fields(cleaned_text)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Data extraction failed: {str(e)}"
            )
        
        # Return success response
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "merchant_name": extracted_data.get("merchant_name", ""),
                    "total_amount": extracted_data.get("total_amount", ""),
                    "date": extracted_data.get("date", "")
                }
            }
        )
    
    except HTTPException:
        raise
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
    
    finally:
        # Clean up: Delete temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                print(f"Warning: Could not delete temp file {temp_file_path}: {e}")


@app.get("/")
async def root():
    """
    Root endpoint - API health check
    """
    return {
        "message": "Receipt Processing API",
        "status": "running",
        "endpoints": {
            "upload": "/upload (POST) - Upload receipt for OCR",
            "expenses": "/expenses (GET) - Get all expenses",
            "expense": "/expense (POST) - Create new expense",
            "update": "/expense/{id} (PUT) - Update expense",
            "delete": "/expense/{id} (DELETE) - Delete expense",
            "income": "/income (POST) - Create new income",
            "incomes": "/income (GET) - Get all income",
            "delete_income": "/income/{id} (DELETE) - Delete income",
            "summary": "/summary (GET) - Get financial summary",
            "set_limit": "/limit (POST) - Set monthly spending limit",
            "get_limit": "/limit (GET) - Get monthly spending limit",
            "subscriptions": "/subscriptions (GET) - Get all subscriptions",
            "subscription": "/subscription (POST) - Create subscription",
            "analytics": "/analytics (GET) - Get analytics data",
            "insights": "/insights (GET) - Get financial insights"
        }
    }


# ==================== EXPENSE CRUD ENDPOINTS ====================

@app.post("/expense", response_model=ExpenseResponse, status_code=201)
async def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    """
    Create a new expense in the database
    
    Args:
        expense: ExpenseCreate schema with validated expense data
        db: Database session (injected)
        
    Returns:
        Created expense with ID
        
    Raises:
        HTTPException 400: Validation error
        HTTPException 500: Database error
    """
    try:
        # Create new Expense model instance
        db_expense = Expense(
            merchant=expense.merchant,
            amount=expense.amount,
            date=expense.date,
            category=expense.category
        )
        
        # Add to database session
        db.add(db_expense)
        
        # Commit transaction
        db.commit()
        
        # Refresh to get the generated ID
        db.refresh(db_expense)
        
        return db_expense
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create expense: {str(e)}"
        )


@app.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(db: Session = Depends(get_db)):
    """
    Get all expenses from the database
    
    Args:
        db: Database session (injected)
        
    Returns:
        List of all expenses
    """
    try:
        # Query all expenses, ordered by date descending
        expenses = db.query(Expense).order_by(Expense.date.desc()).all()
        return expenses
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch expenses: {str(e)}"
        )


@app.get("/expense/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: int, db: Session = Depends(get_db)):
    """
    Get a single expense by ID
    
    Args:
        expense_id: ID of the expense
        db: Database session (injected)
        
    Returns:
        Expense data
    """
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    
    if not expense:
        raise HTTPException(
            status_code=404,
            detail=f"Expense with ID {expense_id} not found"
        )
    
    return expense


@app.put("/expense/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int, 
    expense_update: ExpenseUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an existing expense by ID
    
    Args:
        expense_id: ID of the expense to update
        expense_update: ExpenseUpdate schema with fields to update
        db: Database session (injected)
        
    Returns:
        Updated expense data
        
    Raises:
        HTTPException 404: Expense not found
        HTTPException 400: Validation error
        HTTPException 500: Database error
    """
    try:
        # Find the expense
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        
        if not expense:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        # Update only provided fields
        update_data = expense_update.model_dump(exclude_unset=True)
        
        # Check if there's anything to update
        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No fields provided for update"
            )
        
        # Apply updates
        for field, value in update_data.items():
            setattr(expense, field, value)
        
        # Commit changes
        db.commit()
        db.refresh(expense)
        
        return expense
    
    except HTTPException:
        raise
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update expense: {str(e)}"
        )


@app.delete("/expense/{expense_id}")
async def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """
    Delete an expense by ID
    
    Args:
        expense_id: ID of the expense to delete
        db: Database session (injected)
        
    Returns:
        Success message
    """
    try:
        # Find the expense
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        
        if not expense:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        # Delete the expense
        db.delete(expense)
        db.commit()
        
        return {
            "status": "success",
            "message": f"Expense {expense_id} deleted successfully"
        }
    
    except HTTPException:
        raise
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete expense: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}


# ==================== INCOME CRUD ENDPOINTS ====================

@app.post("/income", response_model=IncomeResponse, status_code=201)
async def create_income(income: IncomeCreate, db: Session = Depends(get_db)):
    """
    Create a new income entry in the database
    
    Args:
        income: IncomeCreate schema with validated income data
        db: Database session (injected)
        
    Returns:
        Created income with ID
        
    Raises:
        HTTPException 400: Validation error
        HTTPException 500: Database error
    """
    try:
        # Create new Income model instance
        db_income = Income(
            source=income.source,
            amount=income.amount,
            date=income.date,
            category=income.category
        )
        
        # Add to database session
        db.add(db_income)
        
        # Commit transaction
        db.commit()
        
        # Refresh to get the generated ID
        db.refresh(db_income)
        
        return db_income
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create income: {str(e)}"
        )


@app.get("/income", response_model=List[IncomeResponse])
async def get_income(db: Session = Depends(get_db)):
    """
    Get all income entries from the database
    
    Args:
        db: Database session (injected)
        
    Returns:
        List of all income entries
    """
    try:
        # Query all income, ordered by date descending
        income = db.query(Income).order_by(Income.date.desc()).all()
        return income
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch income: {str(e)}"
        )


@app.delete("/income/{income_id}")
async def delete_income(income_id: int, db: Session = Depends(get_db)):
    """
    Delete an income entry by ID
    
    Args:
        income_id: ID of the income to delete
        db: Database session (injected)
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: Income not found
        HTTPException 500: Database error
    """
    try:
        # Find the income
        income = db.query(Income).filter(Income.id == income_id).first()
        
        if not income:
            raise HTTPException(
                status_code=404,
                detail=f"Income with ID {income_id} not found"
            )
        
        # Delete the income
        db.delete(income)
        db.commit()
        
        return {
            "status": "success",
            "message": f"Income {income_id} deleted successfully"
        }
    
    except HTTPException:
        raise
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete income: {str(e)}"
        )


# ==================== FINANCIAL SUMMARY ENDPOINT ====================

@app.get("/summary", response_model=FinancialSummary)
async def get_financial_summary(db: Session = Depends(get_db)):
    """
    Get financial summary with total income, expenses, balance, and monthly limit info
    
    Args:
        db: Database session (injected)
        
    Returns:
        FinancialSummary with:
        - total_income: Sum of all income amounts
        - total_expense: Sum of all expense amounts
        - balance: total_income - total_expense
        - monthly_limit: Current monthly spending limit (if set)
        - remaining: Remaining budget for current month
        - limit_exceeded: Whether current month expenses exceed limit
    """
    try:
        # Calculate total income
        income_result = db.query(Income).all()
        total_income = sum(income.amount for income in income_result)
        
        # Calculate total expenses
        expense_result = db.query(Expense).all()
        total_expense = sum(expense.amount for expense in expense_result)
        
        # Calculate balance
        balance = total_income - total_expense
        
        # Get monthly limit from settings
        limit_setting = db.query(Settings).filter(Settings.key == 'monthly_limit').first()
        monthly_limit = limit_setting.value if limit_setting else None
        
        # Calculate current month expenses
        current_month = datetime.now().strftime('%Y-%m')
        current_month_expenses = db.query(Expense).filter(
            Expense.date.like(f"{current_month}%")
        ).all()
        current_month_total = sum(exp.amount for exp in current_month_expenses)
        
        # Calculate remaining budget and check if limit exceeded
        remaining = None
        limit_exceeded = False
        
        if monthly_limit is not None:
            remaining = monthly_limit - current_month_total
            limit_exceeded = current_month_total > monthly_limit
        
        return FinancialSummary(
            total_income=round(total_income, 2),
            total_expense=round(total_expense, 2),
            balance=round(balance, 2),
            monthly_limit=round(monthly_limit, 2) if monthly_limit else None,
            remaining=round(remaining, 2) if remaining is not None else None,
            limit_exceeded=limit_exceeded
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate financial summary: {str(e)}"
        )


# ==================== MONTHLY LIMIT ENDPOINTS ====================

@app.post("/limit", response_model=MonthlyLimitResponse)
async def set_monthly_limit(limit_data: MonthlyLimitSet, db: Session = Depends(get_db)):
    """
    Set or update monthly spending limit
    
    Args:
        limit_data: MonthlyLimitSet schema with limit value
        db: Database session (injected)
        
    Returns:
        MonthlyLimitResponse with updated limit
        
    Raises:
        HTTPException 400: Validation error
        HTTPException 500: Database error
    """
    try:
        # Check if monthly_limit setting already exists
        limit_setting = db.query(Settings).filter(Settings.key == 'monthly_limit').first()
        
        if limit_setting:
            # Update existing limit
            limit_setting.value = limit_data.limit
        else:
            # Create new limit setting
            limit_setting = Settings(
                key='monthly_limit',
                value=limit_data.limit
            )
            db.add(limit_setting)
        
        # Commit changes
        db.commit()
        db.refresh(limit_setting)
        
        return MonthlyLimitResponse(monthly_limit=limit_setting.value)
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to set monthly limit: {str(e)}"
        )


@app.get("/limit", response_model=MonthlyLimitResponse)
async def get_monthly_limit(db: Session = Depends(get_db)):
    """
    Get current monthly spending limit
    
    Args:
        db: Database session (injected)
        
    Returns:
        MonthlyLimitResponse with current limit (0 if not set)
    """
    try:
        # Get monthly_limit setting
        limit_setting = db.query(Settings).filter(Settings.key == 'monthly_limit').first()
        
        if limit_setting:
            return MonthlyLimitResponse(monthly_limit=limit_setting.value)
        else:
            # Return 0 if no limit is set
            return MonthlyLimitResponse(monthly_limit=0.0)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch monthly limit: {str(e)}"
        )


# ==================== SUBSCRIPTION CRUD ENDPOINTS ====================

@app.post("/subscription", response_model=SubscriptionResponse, status_code=201)
async def create_subscription(subscription: SubscriptionCreate, db: Session = Depends(get_db)):
    """
    Create a new subscription in the database
    
    Args:
        subscription: SubscriptionCreate schema with validated data
        db: Database session (injected)
        
    Returns:
        Created subscription with ID
    """
    print(f"[SUBSCRIPTION CREATE] Received data: {subscription}")
    try:
        db_subscription = Subscription(
            name=subscription.name,
            amount=subscription.amount,
            billing_date=subscription.billing_date,
            category=subscription.category,
            status=subscription.status,
            created_at=datetime.now().strftime('%Y-%m-%d')
        )
        
        db.add(db_subscription)
        db.commit()
        db.refresh(db_subscription)
        
        print(f"[SUBSCRIPTION CREATE] Success: {db_subscription.id}")
        return db_subscription
    
    except Exception as e:
        db.rollback()
        print(f"[SUBSCRIPTION CREATE] Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create subscription: {str(e)}"
        )


@app.get("/subscriptions", response_model=List[SubscriptionResponse])
async def get_subscriptions(db: Session = Depends(get_db)):
    """
    Get all subscriptions from the database
    
    Args:
        db: Database session (injected)
        
    Returns:
        List of all subscriptions
    """
    try:
        subscriptions = db.query(Subscription).order_by(Subscription.name).all()
        return subscriptions
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch subscriptions: {str(e)}"
        )


@app.put("/subscription/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: int,
    subscription_update: SubscriptionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing subscription by ID
    
    Args:
        subscription_id: ID of the subscription to update
        subscription_update: SubscriptionUpdate schema with fields to update
        db: Database session (injected)
        
    Returns:
        Updated subscription data
    """
    try:
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        
        if not subscription:
            raise HTTPException(
                status_code=404,
                detail=f"Subscription with ID {subscription_id} not found"
            )
        
        update_data = subscription_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No fields provided for update"
            )
        
        for field, value in update_data.items():
            setattr(subscription, field, value)
        
        db.commit()
        db.refresh(subscription)
        
        return subscription
    
    except HTTPException:
        raise
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update subscription: {str(e)}"
        )


@app.delete("/subscription/{subscription_id}")
async def delete_subscription(subscription_id: int, db: Session = Depends(get_db)):
    """
    Delete a subscription by ID
    
    Args:
        subscription_id: ID of the subscription to delete
        db: Database session (injected)
        
    Returns:
        Success message
    """
    try:
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        
        if not subscription:
            raise HTTPException(
                status_code=404,
                detail=f"Subscription with ID {subscription_id} not found"
            )
        
        db.delete(subscription)
        db.commit()
        
        return {
            "status": "success",
            "message": f"Subscription {subscription_id} deleted successfully"
        }
    
    except HTTPException:
        raise
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete subscription: {str(e)}"
        )


# ==================== ANALYTICS ENDPOINT ====================

@app.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(db: Session = Depends(get_db)):
    """
    Get analytics data including category breakdown, monthly trends, and key metrics
    
    Reuses existing expense and income data for calculations
    
    Args:
        db: Database session (injected)
        
    Returns:
        AnalyticsResponse with category breakdown, trends, and metrics
    """
    try:
        # Fetch all expenses and income (reuse existing queries)
        expenses = db.query(Expense).all()
        income = db.query(Income).all()
        
        # 1. Category Breakdown (reuse expense data)
        category_breakdown = defaultdict(float)
        for exp in expenses:
            category_breakdown[exp.category] += exp.amount
        
        # 2. Monthly Trends (last 6 months)
        monthly_data = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
        
        # Get last 6 months
        today = datetime.now()
        months = []
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=30 * i)
            month_key = month_date.strftime('%Y-%m')
            month_name = month_date.strftime('%b')
            months.append((month_key, month_name))
        
        # Aggregate expenses by month
        for exp in expenses:
            month_key = exp.date[:7]  # YYYY-MM
            if month_key in [m[0] for m in months]:
                monthly_data[month_key]["expense"] += exp.amount
        
        # Aggregate income by month
        for inc in income:
            month_key = inc.date[:7]  # YYYY-MM
            if month_key in [m[0] for m in months]:
                monthly_data[month_key]["income"] += inc.amount
        
        # Build monthly trends list
        monthly_trends = [
            MonthlyTrend(
                month=month_name,
                income=round(monthly_data[month_key]["income"], 2),
                expense=round(monthly_data[month_key]["expense"], 2)
            )
            for month_key, month_name in months
        ]
        
        # 3. Key Metrics (reuse summary logic)
        total_income = sum(i.amount for i in income)
        total_expense = sum(e.amount for e in expenses)
        net_savings = total_income - total_expense
        
        # Calculate avg daily spend (current month)
        current_month = today.strftime('%Y-%m')
        current_month_expenses = [e for e in expenses if e.date.startswith(current_month)]
        days_in_month = today.day
        avg_daily_spend = sum(e.amount for e in current_month_expenses) / days_in_month if days_in_month > 0 else 0
        
        # Savings rate
        savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0
        
        metrics = AnalyticsMetrics(
            net_savings=round(net_savings, 2),
            avg_daily_spend=round(avg_daily_spend, 2),
            savings_rate=round(savings_rate, 2)
        )
        
        return AnalyticsResponse(
            category_breakdown=dict(category_breakdown),
            monthly_trends=monthly_trends,
            metrics=metrics
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate analytics: {str(e)}"
        )


# ==================== INSIGHTS ENDPOINT ====================

@app.get("/insights", response_model=InsightsResponse)
async def get_insights(db: Session = Depends(get_db)):
    """
    Get financial insights including health score, top category, and suggestions
    
    Reuses existing expense and income data for calculations
    
    Args:
        db: Database session (injected)
        
    Returns:
        InsightsResponse with health score, top category, and suggestions
    """
    try:
        # Fetch all expenses and income (reuse existing queries)
        expenses = db.query(Expense).all()
        income = db.query(Income).all()
        
        total_income = sum(i.amount for i in income)
        total_expense = sum(e.amount for e in expenses)
        
        # 1. Health Score (0-100)
        # Algorithm:
        # - Savings rate component: 40 points (max if >30%)
        # - Expense/Income ratio: 30 points (max if <70%)
        # - Base score: 30 points
        
        savings_rate = ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0
        expense_ratio = (total_expense / total_income) if total_income > 0 else 1
        
        health_score = min(100, int(
            (min(savings_rate / 30, 1) * 40) +  # Savings component
            (max(0, 1 - expense_ratio) * 30) +  # Expense ratio component
            30  # Base score
        ))
        
        # 2. Top Spending Category (reuse expense data)
        category_totals = defaultdict(float)
        for exp in expenses:
            category_totals[exp.category] += exp.amount
        
        if category_totals:
            top_cat_name, top_cat_amount = max(category_totals.items(), key=lambda x: x[1])
            top_cat_percentage = (top_cat_amount / total_expense * 100) if total_expense > 0 else 0
        else:
            top_cat_name, top_cat_amount, top_cat_percentage = "None", 0.0, 0.0
        
        top_category = TopCategory(
            name=top_cat_name,
            amount=round(top_cat_amount, 2),
            percentage=round(top_cat_percentage, 2)
        )
        
        # 3. Suggestions (rule-based)
        suggestions = []
        
        # Suggestion 1: Low savings rate
        if savings_rate < 20:
            suggestions.append(Suggestion(
                title="Increase Savings Rate",
                description=f"Your savings rate is {savings_rate:.1f}%. Financial experts recommend saving at least 20% of your income.",
                type="optimization",
                impact="High"
            ))
        
        # Suggestion 2: High category spending
        if top_cat_percentage > 30:
            suggestions.append(Suggestion(
                title="High Category Spending",
                description=f"{top_cat_name} accounts for {top_cat_percentage:.0f}% of your expenses. Consider reducing spending in this category.",
                type="audit",
                impact="High"
            ))
        
        # Suggestion 3: Good savings rate
        if savings_rate >= 30:
            suggestions.append(Suggestion(
                title="Excellent Savings Rate",
                description=f"You're saving {savings_rate:.1f}% of your income. Consider investing surplus funds for long-term growth.",
                type="opportunity",
                impact="Medium"
            ))
        
        # Suggestion 4: Check subscriptions
        subscriptions = db.query(Subscription).filter(Subscription.status == "active").all()
        total_subscriptions = sum(s.amount for s in subscriptions)
        if total_subscriptions > total_income * 0.05:
            suggestions.append(Suggestion(
                title="Subscription Review",
                description=f"Your subscriptions cost ${total_subscriptions:.2f}/month. Review and cancel unused services.",
                type="audit",
                impact="Medium"
            ))
        
        return InsightsResponse(
            health_score=health_score,
            top_category=top_category,
            suggestions=suggestions
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate insights: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
