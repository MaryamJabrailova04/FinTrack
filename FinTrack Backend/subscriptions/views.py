from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from calendar import monthrange
from django.db.models import Sum
from .models import Subscription
from .serializers import SubscriptionSerializer


class SubscriptionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subs = Subscription.objects.filter(user=request.user, is_active=True).order_by('name')
        return Response(SubscriptionSerializer(subs, many=True).data)

    def post(self, request):
        serializer = SubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            sub = Subscription.objects.create(
                user=request.user,
                name=serializer.validated_data['name'],
                price=serializer.validated_data['price'],
                category=serializer.validated_data.get('category'),
                start_date=serializer.validated_data['start_date'],
                monthly_day=serializer.validated_data['monthly_day'],
                notify_email=serializer.validated_data.get('notify_email', False),
                is_active=serializer.validated_data.get('is_active', True),
            )
            return Response(SubscriptionSerializer(sub).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        return Subscription.objects.filter(user=user, pk=pk).first()

    def get(self, request, pk):
        obj = self.get_object(request.user, pk)
        if not obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(SubscriptionSerializer(obj).data)

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def delete(self, request, pk):
        obj = self.get_object(request.user, pk)
        if not obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _update(self, request, pk, partial):
        obj = self.get_object(request.user, pk)
        if not obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = SubscriptionSerializer(obj, data=request.data, partial=partial)
        if serializer.is_valid():
            for field in ['name', 'price', 'category', 'start_date', 'monthly_day', 'notify_email', 'is_active']:
                if field in serializer.validated_data:
                    setattr(obj, field, serializer.validated_data[field])
            obj.save()
            return Response(SubscriptionSerializer(obj).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionCalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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

        days_in_month = monthrange(year, month)[1]
        end_of_month = date(year, month, days_in_month)

        subs = (Subscription.objects
                .filter(user=request.user, is_active=True, start_date__lte=end_of_month)
                .select_related('category')
                .order_by('name'))

        # Prepare day buckets
        calendar_days = {d: [] for d in range(1, days_in_month + 1)}
        total_amount = 0
        for s in subs:
            day = s.monthly_day
            if day > days_in_month:
                day = days_in_month
            calendar_days[day].append({
                "id": s.id,
                "name": s.name,
                "price": s.price,
                "category": s.category.name if s.category else None,
                "notify_email": s.notify_email,
            })
            total_amount += float(s.price)

        # Convert to list
        days_list = [{"day": d, "subscriptions": calendar_days[d]} for d in range(1, days_in_month + 1)]

        return Response({
            "year": year,
            "month": month,
            "totals": {
                "subscriptions_count": subs.count(),
                "subscriptions_monthly": total_amount
            },
            "days": days_list
        })

from django.shortcuts import render

# Create your views here.
