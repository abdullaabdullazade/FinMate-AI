"""
PDF Report Generation Service for FinMate AI
Creates professional monthly financial reports
"""

from weasyprint import HTML, CSS
from jinja2 import Template
from sqlalchemy.orm import Session
from models import User, Expense
from datetime import datetime, timedelta
import calendar
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
from collections import defaultdict

CURRENCY_RATES = {
    "AZN": 1.0,
    "USD": 1.7,
    "EUR": 1.82,
    "TRY": 0.055,
    "RUB": 0.018,
    "GBP": 2.15
}


class PDFGenerator:
    """Handles PDF report generation"""
    
    @staticmethod
    def _convert_from_azn(amount: float, target_currency: str) -> float:
        """Convert AZN to selected currency for göstərim"""
        rate = CURRENCY_RATES.get(target_currency.upper(), 1.0)
        if rate == 0:
            return amount
        if target_currency.upper() == "AZN":
            return amount
        return amount / rate
    
    @staticmethod
    def _get_logo_base64() -> str:
        """Read project logo and return base64 string"""
        try:
            with open("static/icons/icon-512.png", "rb") as f:
                return base64.b64encode(f.read()).decode()
        except Exception:
            return ""

    @staticmethod
    def create_spending_chart(category_data: dict) -> str:
        """
        Create pie chart for category spending
        Returns base64 encoded PNG image
        """
        if not category_data:
            return ""
        
        # Maximum size with larger fonts
        fig, ax = plt.subplots(figsize=(16, 12))
        
        categories = list(category_data.keys())
        amounts = list(category_data.values())
        
        # Custom colors
        colors = plt.cm.Set3(range(len(categories)))
        
        # Create pie chart without labels on the slices to avoid overlap
        wedges, texts, autotexts = ax.pie(
            amounts, 
            autopct='%1.1f%%', 
            colors=colors, 
            startangle=90,
            pctdistance=0.85,
            explode=[0.05] * len(amounts),
            textprops={'fontsize': 16, 'weight': 'bold'}
        )
        
        # Add a circle at the center to make it a donut chart
        centre_circle = plt.Circle((0,0),0.70,fc='white')
        fig.gca().add_artist(centre_circle)
        
        ax.axis('equal')
        
        # Add legend to the side with larger font
        ax.legend(
            wedges, 
            categories,
            title="Kateqoriyalar",
            loc="center left",
            bbox_to_anchor=(1, 0, 0.5, 1),
            fontsize=16,
            title_fontsize=18
        )
        
        plt.tight_layout()
        
        # Save to bytes
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    
    @staticmethod
    def create_trend_chart(daily_data: dict) -> str:
        """
        Create line chart for daily spending trend
        Returns base64 encoded PNG image
        """
        if not daily_data:
            return ""
        
        # Increased size
        fig, ax = plt.subplots(figsize=(16, 9))
        
        dates = list(daily_data.keys())
        amounts = list(daily_data.values())
        
        ax.plot(dates, amounts, marker='o', color='#4F46E5', linewidth=5, markersize=12)
        ax.fill_between(dates, amounts, alpha=0.2, color='#4F46E5')
        ax.set_xlabel('Tarix', fontsize=16, weight='bold')
        ax.set_ylabel('Məbləğ (AZN)', fontsize=16, weight='bold')
        ax.set_title('Günlük Xərc Dinamikası', fontsize=20, weight='bold', pad=25)
        ax.grid(True, alpha=0.3, linestyle='--')
        
        # Rotate x-axis labels
        plt.xticks(rotation=45, ha='right', fontsize=14)
        plt.yticks(fontsize=14)
        
        plt.tight_layout()
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    
    @staticmethod
    def generate_monthly_report(
        user_id: int, 
        month: int, 
        year: int, 
        db_session: Session
    ) -> bytes:
        """
        Generate comprehensive monthly PDF report
        
        Args:
            user_id: User ID
            month: Month number (1-12)
            year: Year
            db_session: Database session
            
        Returns:
            PDF bytes
        """
        
        # Get user
        user = db_session.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Month boundaries
        month_start = datetime(year, month, 1)
        days_in_month = calendar.monthrange(year, month)[1]
        month_end = datetime(year, month, days_in_month, 23, 59, 59)
        
        # Get expenses for the month
        expenses = db_session.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.date >= month_start,
            Expense.date <= month_end
        ).order_by(Expense.date.desc()).all()
        
        # Calculate statistics
        total_spending = sum(exp.amount for exp in expenses)
        currency = (user.currency or "AZN").upper()
        
        # Category breakdown
        category_data = defaultdict(float)
        for exp in expenses:
            category_data[exp.category] += exp.amount
        
        # Top merchants
        merchant_data = defaultdict(float)
        for exp in expenses:
            merchant_data[exp.merchant] += exp.amount
        
        top_merchants = sorted(merchant_data.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Daily spending
        daily_data = defaultdict(float)
        for exp in expenses:
            day_key = exp.date.strftime("%Y-%m-%d")
            daily_data[day_key] += exp.amount
        
        # Fill missing days with 0
        current_date = month_start
        while current_date <= month_end:
            day_key = current_date.strftime("%Y-%m-%d")
            if day_key not in daily_data:
                daily_data[day_key] = 0
            current_date += timedelta(days=1)
        
        daily_data = dict(sorted(daily_data.items()))
        
        # Subscriptions
        subscriptions = [exp for exp in expenses if exp.is_subscription]
        
        # Budget compliance
        budget = user.monthly_budget
        budget_used_pct = (total_spending / budget * 100) if budget > 0 else 0
        budget_status_ok = total_spending <= budget
        
        # Generate charts
        display_category_data = {cat: PDFGenerator._convert_from_azn(val, currency) for cat, val in category_data.items()}
        display_daily = {day: PDFGenerator._convert_from_azn(val, currency) for day, val in daily_data.items()}
        
        category_chart = PDFGenerator.create_spending_chart(dict(display_category_data))
        trend_chart = PDFGenerator.create_trend_chart(display_daily)
        
        # Month name (AZ)
        month_names_az = {
            1: "Yanvar", 2: "Fevral", 3: "Mart", 4: "Aprel", 5: "May", 6: "İyun",
            7: "İyul", 8: "Avqust", 9: "Sentyabr", 10: "Oktyabr", 11: "Noyabr", 12: "Dekabr"
        }
        month_name = month_names_az.get(month, calendar.month_name[month])
        
        # Convert amounts for göstərim valyutası
        display_total_spending = PDFGenerator._convert_from_azn(total_spending, currency)
        display_budget = PDFGenerator._convert_from_azn(budget, currency)
        display_budget_used_pct = budget_used_pct
        display_top_merchants = [(m, PDFGenerator._convert_from_azn(a, currency)) for m, a in top_merchants]
        display_expenses = [
            {
                "date": exp.date,
                "merchant": exp.merchant,
                "category": exp.category,
                "amount": PDFGenerator._convert_from_azn(exp.amount, currency)
            } for exp in expenses
        ]
        display_subs = [
            {
                "merchant": sub.merchant,
                "amount": PDFGenerator._convert_from_azn(sub.amount, currency)
            } for sub in subscriptions
        ]
        
        # HTML template
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: A4;
                    margin: 2cm;
                }
                body {
                    font-family: 'Arial', sans-serif;
                    color: #333;
                    line-height: 1.6;
                }
                .cover {
                    text-align: center;
                    padding: 80px 0;
                    background: linear-gradient(135deg, #4F46E5, #9333EA);
                    color: #fff;
                    border-radius: 24px;
                    box-shadow: 0 20px 60px rgba(79, 70, 229, 0.25);
                }
                .cover h1 {
                    font-size: 44px;
                    color: #fff;
                    margin-bottom: 20px;
                }
                .cover h2 {
                    font-size: 20px;
                    color: #E0E7FF;
                }
                .stats {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 16px;
                    margin: 24px 0;
                }
                .stat-box {
                    background: linear-gradient(135deg, #EEF2FF, #F8FAFC);
                    padding: 16px;
                    border-radius: 14px;
                    border: 1px solid #E5E7EB;
                }
                .stat-box h3 {
                    margin: 0 0 6px 0;
                    color: #6B7280;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .stat-box .value {
                    font-size: 30px;
                    font-weight: bold;
                    color: #111827;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 16px 0;
                }
                table th {
                    background: #4F46E5;
                    color: white;
                    padding: 10px;
                    text-align: left;
                }
                table td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #E5E7EB;
                }
                table tr:nth-child(even) {
                    background: #F9FAFB;
                }
                .section {
                    page-break-before: always;
                    margin-top: 12px;
                }
                .section h2 {
                    color: #4F46E5;
                    border-bottom: 2px solid #4F46E5;
                    padding-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .chart {
                    text-align: center;
                    margin: 20px 0;
                }
                .chart img {
                    max-width: 100%;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .badge.success {
                    background: #D1FAE5;
                    color: #065F46;
                }
                .badge.danger {
                    background: #FEE2E2;
                    color: #991B1B;
                }
            </style>
        </head>
        <body>
            <!-- Cover Page -->
            <div class="cover">
                {% if logo_base64 %}
                <img src="data:image/png;base64,{{ logo_base64 }}" alt="FinMate Logo" style="width: 120px; height: 120px; margin-bottom: 20px; border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
                {% endif %}
                <h1>FinMate AI</h1>
                <h2>Aylıq Maliyyə Hesabatı</h2>
                <p style="font-size: 20px; color: #E0E7FF; margin-top: 40px;">
                    {{ month_name }} {{ year }}
                </p>
                <p style="font-size: 16px; color: #C7D2FE;">
                    Hazırlandı: {{ user.username }}
                </p>
            </div>
            
            <!-- Executive Summary -->
            <div class="section">
                <h2>📊 Əsas Baxış</h2>
                <div class="stats">
                    <div class="stat-box">
                        <h3>Ümumi xərc</h3>
                        <div class="value">{{ "%.2f"|format(display_total_spending) }} {{ currency }}</div>
                    </div>
                    <div class="stat-box">
                        <h3>Aylıq büdcə</h3>
                        <div class="value">{{ "%.2f"|format(display_budget) }} {{ currency }}</div>
                    </div>
                    <div class="stat-box">
                        <h3>Büdcə istifadəsi</h3>
                        <div class="value">{{ "%.1f"|format(display_budget_used_pct) }}%</div>
                    </div>
                    <div class="stat-box">
                        <h3>Əməliyyat sayı</h3>
                        <div class="value">{{ expenses|length }}</div>
                    </div>
                </div>
                <p>
                    <strong>Büdcə statusu:</strong> 
                    {% if budget_status_ok %}
                        <span class="badge success">✓ Büdcə daxilində</span>
                    {% else %}
                        <span class="badge danger">⚠ Büdcədən artıq</span>
                    {% endif %}
                </p>
            </div>
            
            <!-- Category Breakdown -->
            <div class="section">
                <h2>🗂 Kateqoriyalar üzrə xərclər</h2>
                {% if category_chart %}
                <div class="chart">
                    <img src="{{ category_chart }}" alt="Category Breakdown">
                </div>
                {% endif %}
                <table>
                    <tr>
                        <th>Kateqoriya</th>
                        <th>Məbləğ ({{ currency }})</th>
                        <th>Ümumi pay</th>
                    </tr>
                    {% for category, amount in display_category_data.items() %}
                    <tr>
                        <td>{{ category }}</td>
                        <td>{{ "%.2f"|format(amount) }}</td>
                        <td>{{ "%.1f"|format((amount / display_total_spending * 100) if display_total_spending > 0 else 0) }}%</td>
                    </tr>
                    {% endfor %}
                </table>
            </div>
            
            <!-- Daily Trend -->
            <div class="section">
                <h2>📅 Günlük xərc dinamikası</h2>
                {% if trend_chart %}
                <div class="chart">
                    <img src="{{ trend_chart }}" alt="Daily Trend">
                </div>
                {% endif %}
            </div>
            
            <!-- Top Merchants -->
            <div class="section">
                <h2>🏪 Ən çox xərc edilən 10 məkan</h2>
                <table>
                    <tr>
                        <th>#</th>
                        <th>Satıcı</th>
                        <th>Məbləğ ({{ currency }})</th>
                    </tr>
                    {% for merchant, amount in display_top_merchants %}
                    <tr>
                        <td>{{ loop.index }}</td>
                        <td>{{ merchant }}</td>
                        <td>{{ "%.2f"|format(amount) }}</td>
                    </tr>
                    {% endfor %}
                </table>
            </div>
            
            <!-- Transaction History -->
            <div class="section">
                <h2>📑 Əməliyyat siyahısı</h2>
                <table>
                    <tr>
                        <th>Tarix</th>
                        <th>Satıcı</th>
                        <th>Kateqoriya</th>
                        <th>Məbləğ ({{ currency }})</th>
                    </tr>
                    {% for exp in display_expenses %}
                    <tr>
                        <td>{{ exp.date.strftime("%Y-%m-%d %H:%M") }}</td>
                        <td>{{ exp.merchant }}</td>
                        <td>{{ exp.category }}</td>
                        <td>{{ "%.2f"|format(exp.amount) }}</td>
                    </tr>
                    {% endfor %}
                </table>
            </div>
            
            {% if subscriptions %}
            <!-- Subscriptions -->
            <div class="section">
                <h2>📌 Aktiv abunəliklər</h2>
                <table>
                    <tr>
                        <th>Xidmət</th>
                        <th>Məbləğ ({{ currency }})</th>
                    </tr>
                    {% for sub in display_subs %}
                    <tr>
                        <td>{{ sub.merchant }}</td>
                        <td>{{ "%.2f"|format(sub.amount) }}</td>
                    </tr>
                    {% endfor %}
                </table>
            </div>
            {% endif %}
        </body>
        </html>
        """
        
        logo_base64 = PDFGenerator._get_logo_base64()
        
        # Render template
        template = Template(html_template)
        html_content = template.render(
            user=user,
            month_name=month_name,
            year=year,
            currency=currency,
            display_total_spending=display_total_spending,
            display_budget=display_budget,
            display_budget_used_pct=display_budget_used_pct,
            budget_status_ok=budget_status_ok,
            display_expenses=display_expenses,
            display_category_data=display_category_data,
            display_top_merchants=display_top_merchants,
            display_subs=display_subs,
            category_chart=category_chart,
            trend_chart=trend_chart,
            logo_base64=logo_base64
        )
        
        # Generate PDF
        pdf = HTML(string=html_content).write_pdf()
        
        return pdf


# Singleton instance
pdf_generator = PDFGenerator()
