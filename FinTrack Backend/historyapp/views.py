from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date, datetime
from calendar import monthrange
from django.db.models import Sum
from expenses.models import Expense
from subscriptions.models import Subscription


def month_end(year: int, month: int) -> date:
    return date(year, month, monthrange(year, month)[1])


class HistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        include_details = request.query_params.get('details', 'false').lower() == 'true'

        today = date.today()
        year = int(year) if year and year.isdigit() else today.year

        if month:
            # Single month breakdown
            try:
                month_int = int(month)
                assert 1 <= month_int <= 12
            except Exception:
                return Response({"detail": "Invalid month"}, status=400)

            start_dt = datetime(year, month_int, 1)
            end_dt = datetime(year, month_int, monthrange(year, month_int)[1], 23, 59, 59)

            expenses_qs = Expense.objects.filter(user=request.user, time__range=(start_dt, end_dt))
            expenses_total = expenses_qs.aggregate(total=Sum('price'))['total'] or 0

            # Subscriptions active by end of month
            subs_qs = Subscription.objects.filter(
                user=request.user, is_active=True, start_date__lte=month_end(year, month_int)
            )
            subs_total = subs_qs.aggregate(total=Sum('price'))['total'] or 0

            payload = {
                "year": year,
                "month": month_int,
                "totals": {
                    "expenses": expenses_total,
                    "subscriptions": subs_total,
                    "combined": expenses_total + subs_total,
                },
            }
            if include_details:
                payload["expenses"] = [
                    {"id": e.id, "name": e.name, "price": e.price, "time": e.time, "category": getattr(e.category, 'name', None)}
                    for e in expenses_qs.order_by('-time', '-id')
                ]
                payload["subscriptions"] = [
                    {"id": s.id, "name": s.name, "price": s.price, "start_date": s.start_date, "monthly_day": s.monthly_day}
                    for s in subs_qs.order_by('name')
                ]
            return Response(payload)

        # Full year aggregation by month
        months = []
        for m in range(1, 13):
            start_dt = datetime(year, m, 1)
            end_dt = datetime(year, m, monthrange(year, m)[1], 23, 59, 59)
            expenses_total = Expense.objects.filter(
                user=request.user, time__range=(start_dt, end_dt)
            ).aggregate(total=Sum('price'))['total'] or 0
            subs_total = Subscription.objects.filter(
                user=request.user, is_active=True, start_date__lte=month_end(year, m)
            ).aggregate(total=Sum('price'))['total'] or 0
            months.append({
                "month": m,
                "expenses": expenses_total,
                "subscriptions": subs_total,
                "combined": expenses_total + subs_total,
            })

        return Response({"year": year, "months": months})

from django.shortcuts import render

# Create your views here.
