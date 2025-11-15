from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from django.db.models import Sum
from datetime import date
from calendar import monthrange
from .models import Expense, Category
from .serializers import ExpenseSerializer, CategorySerializer
from subscriptions.models import Subscription


class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user).order_by('-time', '-id')
        serializer = ExpenseSerializer(expenses, many=True)

        today = date.today()
        qp_year = request.query_params.get('year')
        qp_month = request.query_params.get('month')
        try:
            year = int(qp_year) if qp_year is not None else today.year
        except Exception:
            year = today.year
        try:
            month = int(qp_month) if qp_month is not None else today.month
            if not 1 <= month <= 12:
                month = today.month
        except Exception:
            month = today.month
        start_date = date(year, month, 1)
        end_date = date(year, month, monthrange(year, month)[1])

        # Monthly expenses total (current month only)
        monthly_expenses_total = Expense.objects.filter(
            user=request.user, time__date__range=(start_date, end_date)
        ).aggregate(total=Sum('price'))['total'] or 0

        # Monthly subscriptions total (active and started on/before end of month)
        monthly_subs_total = Subscription.objects.filter(
            user=request.user, is_active=True, start_date__lte=end_date
        ).aggregate(total=Sum('price'))['total'] or 0

        total_spendings = (monthly_expenses_total or 0) + (monthly_subs_total or 0)
        monthly_goal = getattr(request.user, 'monthly_goal', 0) or 0
        left_budget = monthly_goal - total_spendings
        return Response({
            "period": {"year": year, "month": month},
            "summary": {
                "monthly_goal": monthly_goal,
                "expenses_monthly": monthly_expenses_total,
                "subscriptions_monthly": monthly_subs_total,
                "total_spendings": total_spendings,
                "left_budget": left_budget,
            },
            "results": serializer.data
        })

    def post(self, request):
        data = request.data.copy()
        serializer = ExpenseSerializer(data=data)
        if serializer.is_valid():
            expense = Expense.objects.create(
                user=request.user,
                name=serializer.validated_data['name'],
                price=serializer.validated_data['price'],
                category=serializer.validated_data.get('category'),
                time=serializer.validated_data.get('time') or None,
                note=serializer.validated_data.get('note', ''),
            )
            return Response(ExpenseSerializer(expense).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        return Expense.objects.filter(user=user, pk=pk).first()

    def get(self, request, pk):
        expense = self.get_object(request.user, pk)
        if not expense:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ExpenseSerializer(expense).data)

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def delete(self, request, pk):
        expense = self.get_object(request.user, pk)
        if not expense:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _update(self, request, pk, partial):
        expense = self.get_object(request.user, pk)
        if not expense:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense, data=request.data, partial=partial)
        if serializer.is_valid():
            expense.name = serializer.validated_data.get('name', expense.name)
            expense.price = serializer.validated_data.get('price', expense.price)
            if 'category' in serializer.validated_data:
                expense.category = serializer.validated_data.get('category')
            expense.time = serializer.validated_data.get('time', expense.time)
            expense.note = serializer.validated_data.get('note', expense.note)
            expense.save()
            return Response(ExpenseSerializer(expense).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Category.objects.filter(models.Q(user__isnull=True) | models.Q(user=request.user))
        serializer = CategorySerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get('name')
        if not name:
            return Response({"name": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        cat, _ = Category.objects.get_or_create(user=request.user, name=name)
        return Response(CategorySerializer(cat).data, status=status.HTTP_201_CREATED)

from django.shortcuts import render

# Create your views here.
