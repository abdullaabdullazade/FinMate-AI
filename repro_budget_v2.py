
from datetime import datetime

# Mock Data
class User:
    def __init__(self, monthly_budget, currency):
        self.monthly_budget = monthly_budget
        self.currency = currency

CURRENCY_RATES = {
    "AZN": 1.0,
    "USD": 1.7,
    "EUR": 1.97,
}

def convert_currency(amount, from_c, to_c):
    from_rate = CURRENCY_RATES.get(from_c.upper())
    to_rate = CURRENCY_RATES.get(to_c.upper())
    if not from_rate or not to_rate or to_c.upper() == from_c.upper():
        return amount
    azn_value = amount * from_rate if from_c.upper() != "AZN" else amount
    if to_c.upper() == "AZN":
        return azn_value
    return azn_value / to_rate

def test_scenario(budget_azn, currency, spending_eur):
    print(f"--- Scenario: Budget {budget_azn} AZN, Currency {currency}, Spending {spending_eur} EUR ---")
    user = User(budget_azn, currency)
    
    # Calculate spending in AZN
    spending_azn = spending_eur * CURRENCY_RATES["EUR"]
    print(f"Spending AZN: {spending_azn}")
    
    # Dashboard logic (FIXED)
    monthly_budget_display = convert_currency(user.monthly_budget, "AZN", user.currency)
    total_spending = convert_currency(spending_azn, "AZN", user.currency)
    remaining_budget = convert_currency(user.monthly_budget - spending_azn, "AZN", user.currency)
    
    budget_percentage = (spending_azn / user.monthly_budget * 100)
    
    # Alert logic (FIXED)
    alert_remaining = remaining_budget # Now using the converted remaining budget
    
    print(f"Dashboard Budget Display: {monthly_budget_display}")
    print(f"Dashboard Total Spending: {total_spending}")
    print(f"Dashboard Remaining: {remaining_budget}")
    print(f"Budget Percentage: {budget_percentage}%")
    print(f"Alert Remaining (Fixed): {alert_remaining}")
    
    # Forecast Logic (FIXED)
    # Mocking forecast service return (in AZN)
    forecast_azn = {
        "projected_total": spending_azn * 1.5, # Mock projection
        "budget": user.monthly_budget
    }
    
    # Route logic conversion
    forecast_converted = {
        "projected_total": convert_currency(forecast_azn["projected_total"], "AZN", user.currency),
        "budget": convert_currency(forecast_azn["budget"], "AZN", user.currency)
    }
    
    print(f"Forecast Projected (AZN): {forecast_azn['projected_total']}")
    print(f"Forecast Projected (Converted): {forecast_converted['projected_total']}")
    print("\n")

# Scenario A: Correctly stored AZN budget
test_scenario(8200, "EUR", 1941.98)
