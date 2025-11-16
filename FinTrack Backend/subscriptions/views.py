from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from calendar import monthrange
from django.db.models import Sum
from .models import Subscription
from .serializers import SubscriptionSerializer
from decimal import Decimal
import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

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


class GoogleImportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Imports subscriptions by scanning the user's Gmail for receipts/recurring payments.
        Body: { "access_token": "..." }
        """
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({"access_token": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Build a Gmail API client with the provided access token
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build

            creds = Credentials(token=access_token)
            service = build('gmail', 'v1', credentials=creds, cache_discovery=False)

            # Query for likely subscription receipts in the last 6 months
            # This is a heuristic to catch common providers
            query = '(subject:receipt OR subject:subscription OR subject:"payment received" OR subject:"your invoice") newer_than:180d'
            results = service.users().messages().list(userId='me', q=query, maxResults=50).execute()
            messages = results.get('messages', [])

            found: List[Dict[str, Any]] = []
            for m in messages:
                msg = service.users().messages().get(userId='me', id=m['id'], format='metadata', metadataHeaders=['Subject', 'From', 'Date']).execute()
                headers = {h['name'].lower(): h['value'] for h in msg.get('payload', {}).get('headers', [])}
                subject = headers.get('subject', '')
                sender = headers.get('from', '')
                date_header = headers.get('date', '')
                snippet = msg.get('snippet', '')

                text = f'{subject}\n{snippet}'

                # Heuristic extraction: vendor and amount
                vendor_match = re.search(r'(Netflix|Spotify|YouTube|Apple Music|HBO|Prime|Amazon|Google|Dropbox|Microsoft|Adobe|GitHub|Notion|Zoom|Slack)', text, re.IGNORECASE)
                amount_match = re.search(r'(?P<sym>[$€£₼])?\s*(?P<amt>\d{1,4}(?:[.,]\d{2})?)\s*(?P<cur>USD|EUR|GBP|AZN)?', text)

                if not vendor_match or not amount_match:
                    continue

                vendor = vendor_match.group(0).strip().title()
                cur = (amount_match.group('cur') or '').upper()
                sym = amount_match.group('sym') or ''
                amt_raw = amount_match.group('amt').replace(',', '.')
                try:
                    price = Decimal(amt_raw)
                except Exception:
                    continue

                # Approximate monthly_day from Date header if available
                monthly_day = 1
                try:
                    # Example Date header: Tue, 10 Sep 2024 12:34:56 +0000
                    day_match = re.search(r',\s*(\d{1,2})\s', date_header)
                    if day_match:
                        monthly_day = max(1, min(31, int(day_match.group(1))))
                except Exception:
                    monthly_day = 1

                found.append({
                    'name': vendor,
                    'price': price,
                    'monthly_day': monthly_day,
                })

            # Deduplicate by vendor name
            by_name: Dict[str, Dict[str, Any]] = {}
            for item in found:
                key = item['name']
                if key not in by_name:
                    by_name[key] = item
                else:
                    # Choose highest price if multiple matches
                    if item['price'] > by_name[key]['price']:
                        by_name[key] = item

            created = 0
            updated = 0

            for name, item in by_name.items():
                # If subscription with same name exists for user, update price/monthly_day
                existing = Subscription.objects.filter(user=request.user, name=name, is_active=True).first()
                if existing:
                    changed = False
                    if existing.price != item['price']:
                        existing.price = item['price']
                        changed = True
                    if existing.monthly_day != item['monthly_day']:
                        existing.monthly_day = item['monthly_day']
                        changed = True
                    if changed:
                        existing.save()
                        updated += 1
                else:
                    Subscription.objects.create(
                        user=request.user,
                        name=name,
                        price=item['price'],
                        category=None,
                        start_date=date.today(),
                        monthly_day=item['monthly_day'],
                        notify_email=False,
                        is_active=True,
                    )
                    created += 1

            return Response({
                "found": len(found),
                "created": created,
                "updated": updated,
                "imported_names": list(by_name.keys())
            })
        except Exception as e:
            logger.exception('Google import failed')
            return Response({"detail": "Google import failed."}, status=status.HTTP_400_BAD_REQUEST)
