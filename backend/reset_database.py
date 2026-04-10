"""
Database Reset Script
Deletes all data from the database and resets to zero
"""

from database import engine, Base
from models import Expense
from income_models import Income
from settings_models import Settings
from sqlalchemy.orm import Session

def reset_database():
    """Delete all data from all tables"""
    print("🗑️  Resetting database to zero...")
    
    # Create a session
    with Session(engine) as session:
        try:
            # Delete all expenses
            deleted_expenses = session.query(Expense).delete()
            print(f"   ✅ Deleted {deleted_expenses} expenses")
            
            # Delete all income
            deleted_income = session.query(Income).delete()
            print(f"   ✅ Deleted {deleted_income} income entries")
            
            # Delete all settings
            deleted_settings = session.query(Settings).delete()
            print(f"   ✅ Deleted {deleted_settings} settings")
            
            # Commit the changes
            session.commit()
            
            print("\n✅ Database reset complete! All data is now zero.")
            print("   - Total Income: $0.00")
            print("   - Total Expenses: $0.00")
            print("   - Balance: $0.00")
            print("   - Monthly Limit: Not set")
            
        except Exception as e:
            session.rollback()
            print(f"\n❌ Error resetting database: {e}")
            raise

if __name__ == "__main__":
    reset_database()
