#!/usr/bin/env python3
"""
Test script to verify income addition and dashboard stats calculation
"""

import sqlite3
from datetime import datetime

DB_PATH = "finmate.db"

def test_income_display():
    """Test if incomes should be displayed on dashboard"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("=" * 60)
    print("INCOME DASHBOARD TEST")
    print("=" * 60)
    
    # Get current month
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    print(f"\n📅 Current UTC Time: {now}")
    print(f"📅 Month Start: {month_start}")
    print(f"📅 Month: {now.strftime('%Y-%m (%B)')}\n")
    
    # Get all users with incomes
    cursor.execute("""
        SELECT u.id, u.username, u.monthly_budget, u.monthly_income
        FROM users u
        WHERE u.id IN (SELECT DISTINCT user_id FROM incomes)
    """)
    users = cursor.fetchall()
    
    print(f"Found {len(users)} user(s) with income records:\n")
    
    for user_id, username, budget, monthly_income in users:
        print(f"\n{'='*60}")
        print(f"👤 User: {username} (ID: {user_id})")
        print(f"   Monthly Budget: {budget} AZN")
        print(f"   Monthly Income (Salary): {monthly_income or 0} AZN")
        print(f"{'='*60}")
        
        # Get all incomes for this user
        cursor.execute("""
            SELECT id, amount, source, date, is_recurring
            FROM incomes
            WHERE user_id = ?
            ORDER BY date DESC
        """, (user_id,))
        all_incomes = cursor.fetchall()
        
        print(f"\n📊 Total Income Records: {len(all_incomes)}")
        
        # Get this month's incomes
        cursor.execute("""
            SELECT id, amount, source, date, is_recurring
            FROM incomes
            WHERE user_id = ? AND date >= ?
            ORDER BY date DESC
        """, (user_id, month_start.strftime('%Y-%m-%d %H:%M:%S')))
        month_incomes = cursor.fetchall()
        
        print(f"📊 This Month's Incomes: {len(month_incomes)}")
        
        if month_incomes:
            total_month_income = sum(inc[1] for inc in month_incomes)
            print(f"\n✅ SHOULD BE VISIBLE ON DASHBOARD:")
            print(f"   'Ümumi gəlir' = {total_month_income:.2f} AZN\n")
            print("   Income breakdown:")
            for inc_id, amount, source, date, is_recurring in month_incomes:
                rec_marker = "🔄" if is_recurring else "  "
                print(f"   {rec_marker} {source}: {amount:.2f} AZN (Date: {date})")
        else:
            print(f"\n⚠️  NO INCOMES THIS MONTH - Dashboard will show 0.00 AZN")
            print(f"   All {len(all_incomes)} income(s) are from previous months:")
            for inc_id, amount, source, date, is_recurring in all_incomes[:5]:
                date_obj = datetime.strptime(date, '%Y-%m-%d %H:%M:%S.%f')
                month_str = date_obj.strftime('%Y-%m (%B)')
                print(f"     - {source}: {amount:.2f} AZN ({month_str})")
            if len(all_incomes) > 5:
                print(f"     ... and {len(all_incomes) - 5} more")
        
        # Get expenses for comparison
        cursor.execute("""
            SELECT COUNT(*), COALESCE(SUM(amount), 0)
            FROM expenses
            WHERE user_id = ? AND date >= ?
        """, (user_id, month_start.strftime('%Y-%m-%d %H:%M:%S')))
        expense_count, total_expenses = cursor.fetchone()
        
        print(f"\n💰 Month Summary:")
        print(f"   Expenses: {total_expenses:.2f} AZN ({expense_count} transactions)")
        if month_incomes:
            total_month_income = sum(inc[1] for inc in month_incomes)
            available = budget + total_month_income - total_expenses
            print(f"   Income: {total_month_income:.2f} AZN ({len(month_incomes)} records)")
            print(f"   Available: {available:.2f} AZN")
        else:
            available = budget - total_expenses
            print(f"   Income: 0.00 AZN (no records this month)")
            print(f"   Available: {available:.2f} AZN")
    
    conn.close()
    
    print(f"\n{'='*60}")
    print("TEST COMPLETE")
    print("=" * 60)
    print("\n💡 If income shows 0.00 on dashboard but there are records above,")
    print("   the issue is likely:")
    print("   1. Frontend not refreshing after adding income")
    print("   2. JavaScript error preventing stats update")
    print("   3. HTMX not triggering 'update-stats' event")
    print("\n   Check browser console (F12) for errors!")

if __name__ == "__main__":
    test_income_display()
