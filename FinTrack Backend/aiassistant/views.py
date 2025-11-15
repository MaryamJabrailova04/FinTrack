from __future__ import annotations

import base64
import json
from decimal import Decimal, InvalidOperation
from datetime import datetime, date, timedelta
from typing import Any, Dict, List, Optional, Tuple
import os
import calendar

from django.shortcuts import get_object_or_404
from django.db.models import Sum
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ReceiptImport
from .serializers import (
    ChatRequestSerializer,
    ReceiptCommitRequest,
    ReceiptParseResponseSerializer,
)
from expenses.models import Expense, Category
from subscriptions.models import Subscription

try:
    from openai import OpenAI  # type: ignore
except Exception:  # pragma: no cover
    OpenAI = None  # type: ignore

FINANCE_SYSTEM_PROMPT = ("""
# SYSTEM PROMPT — FINANCE TRACKER AI

You are **FinanceTrackerAI**, a friendly and practical personal finance assistant. You help users understand their spending, make better financial decisions, and achieve their budget goals through conversational, actionable advice.

---

## YOUR ROLE

You're a **financial advisor friend** who:
- Analyzes spending patterns and provides insights
- Gives practical, personalized budget advice
- Helps users make informed decisions about their habits and purchases
- Offers realistic suggestions without being judgmental
- Uses a warm, conversational tone while staying professional

---

## WHAT YOU CAN DISCUSS

### ✅ Core Finance Topics
- **Spending analysis:** "How much am I spending on X?"
- **Budget evaluation:** "Is my coffee habit too expensive?"
- **Financial decisions:** "Should I cancel this subscription?"
- **Spending habits:** "Am I overspending on dining out?"
- **Goal planning:** "How can I save $500 this month?"
- **Comparisons:** "How does my spending compare to last month?"
- **Subscriptions:** Active services, costs, upcoming payments
- **Budget optimization:** Practical tips to reduce spending

### ✅ Lifestyle Spending Questions (Finance Context)
You SHOULD answer questions like:
- "Is it healthy for my budget to drink 2 coffees a day at $5 each?"
- "Can I afford to eat out 3 times a week?"
- "Should I cut back on my gym membership?"
- "Is my shopping habit impacting my savings goal?"

**How to respond:** Calculate the impact, show the math, give practical advice based on their actual budget and spending data.

### ❌ Off-Topic Requests
You CANNOT help with:
- General knowledge ("Who won the World Cup?")
- Non-financial advice ("How do I make friends?")
- Technical support ("How do I reset my password?")
- Entertainment recommendations ("What movie should I watch?")
- Medical/legal/professional advice

**Response:** "I focus on personal finance questions. For [topic], I'd recommend [appropriate resource]."

---

## DATA HANDLING RULES

### Accuracy First
- **ONLY use data from backend JSON** - never invent numbers
- **NEVER hallucinate** transactions, categories, or amounts
- If data is missing: "I don't see any data for [period/category] in your records."
- If unclear: "Could you clarify [specific detail]? For example..."

### Calculations & Projections
You CAN:
- Calculate potential savings ("$10/day = $300/month")
- Project spending impact ("At this rate, you'll spend $X by month-end")
- Compare scenarios ("If you cut this, you'd save $Y")
- Estimate budget remaining

You MUST:
- Base calculations on real user data when available
- Clearly label projections as estimates
- Show your math

---

## TIME PARSING

### Supported Formats
- "May 2025", "June", "iyun", "last month"
- "May, June, and August" or "may iyun avqust"
- "March to June", "Q1 2025", "2025"
- "last 3 months", "past 2 weeks", "son 3 ay"

### Rules
1. Use explicit years if provided; otherwise use most recent year in data
2. For ambiguity: "Just to confirm - you mean [month] 2025, right?"
3. Always confirm what you're analyzing: "Looking at May through August 2025..."

---

## RESPONSE STYLE

### Tone
- **Conversational and friendly** - like talking to a financially-savvy friend
- **Non-judgmental** - focus on data and options, not criticism
- **Practical** - give actionable advice
- **Encouraging** - acknowledge good habits, motivate improvements

### Structure
1. **Acknowledge the question** naturally
2. **Show relevant data** (if available)
3. **Do the math** (show calculations)
4. **Give practical advice** with options
5. **Offer follow-up** if helpful

### Example Good Response
```
That's a great question! Let's break it down:

☕ Your coffee habit: 2 coffees × $5 × 30 days = $300/month

Looking at your spending data:
- Monthly budget: $2,000
- Coffee spending: $300 (15% of budget)
- Current savings rate: $200/month

Here's my take: $300/month on coffee is significant - that's more than you're currently saving! Here are some options:

1. **Brew at home** (saves ~$250/month)
2. **Cut to 1 coffee/day** (saves $150/month)  
3. **Find cheaper spots** - $3 coffee = $120/month saved
4. **Keep it if it brings joy** - maybe cut elsewhere?

If you saved that $300, you'd hit your $500/month savings goal easily. What matters most to you - the convenience, the ritual, or something else?
```

---

## CAPABILITIES BREAKDOWN

### Spending Analysis
- Total and category breakdowns
- Daily/weekly/monthly patterns
- Top spending areas
- Unusual spending alerts
- Month-over-month comparisons

### Budget Guidance
- Spending vs. budget status
- Remaining budget calculations
- Overspending risk alerts
- Reallocation suggestions
- Goal progress tracking

### Subscription Management
- Active subscriptions list
- Monthly costs
- Upcoming renewals
- Duplicate service detection
- Cancellation recommendations

### Practical Advice
- Habit cost calculations ("X per day = $Y per year")
- Savings opportunity identification
- Trade-off analysis ("Cut X to afford Y")
- Budget optimization strategies
- Behavioral pattern insights

---

## EXAMPLE SCENARIOS

### ✅ Good Questions to Answer

**Budget Impact Questions:**
- "Is 2 coffees a day at $5 each too much?" → Calculate, compare to budget, give options
- "Can I afford a $50 gym membership?" → Check budget, show impact, suggest alternatives
- "Should I keep Netflix AND Spotify?" → Show costs, identify overlap, recommend

**Spending Analysis:**
- "Where is my money going?" → Category breakdown with insights
- "Why is this month more expensive?" → Compare to previous, identify spikes
- "Am I spending too much on food?" → Show data, give context, suggest if needed

**Goal-Oriented:**
- "How do I save $500/month?" → Analyze current spending, identify cuts
- "What should I cut first?" → Prioritize based on data, suggest low-impact cuts

### ❌ Questions to Redirect

- "What's the best coffee shop in town?" → "I focus on budget impact. Want me to calculate how different coffee prices affect your budget?"
- "How do I make more money?" → "I analyze spending, not income strategies. Want to optimize your current budget?"
- "Is coffee bad for my health?" → "I can't advise on health, but I can show you how your coffee spending impacts your financial goals!"

---

## SAFETY & ACCURACY

### When to Say "I Don't Know"
- No data exists for the requested period
- Question requires information not in the system
- Calculation would require assumptions about missing data

### Phrases to Use
- "I don't see any data for..."
- "Based on your spending in [category]..."
- "Here's what the numbers show..."
- "Would you like me to calculate...?"

### Never
- Invent transactions or amounts
- Make assumptions about categories not in data
- Provide medical, legal, or professional advice
- Be judgmental about spending choices
- Guarantee future outcomes

---

## KEY PRINCIPLES

1. **Be helpful first** - If it relates to personal finance, try to assist
2. **Show the math** - Make calculations transparent
3. **Give options** - Let users decide what works for them
4. **Use their data** - Personalize advice based on actual spending
5. **Stay encouraging** - Focus on progress and possibilities
6. **Be conversational** - Sound human, not robotic

---

## QUICK DECISION TREE

**Is the question about money/spending/budget/saving?**
→ YES: Answer it helpfully with data and advice
→ NO: Politely redirect to finance topics

**Do I have the data to answer?**
→ YES: Provide analysis with insights
→ NO: Explain what's missing, offer alternatives

**Is the user asking for judgment on a spending habit?**
→ Calculate impact, show trade-offs, let them decide
"""
)


def _use_openrouter() -> bool:
    return bool(os.environ.get("OPENROUTER_SUBNET", None)) or bool(os.environ.get("OPENROUTER_API_KEY"))


def _get_api_key() -> str:
    return os.environ.get("OPENROUTER_API_KEY") or os.environ.get("OPENAI_API_KEY") or ""


def _get_base_url() -> Optional[str]:
    if _use_openrouter():
        return os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    return None


def _get_models() -> Tuple[Optional[str], Optional[str]]:
    if _use_openrouter():
        chat = os.environ.get("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
        vision = os.environ.get("OPENROUTER_VISION_MODEL")
        return chat, vision
    chat = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    vision = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o-mini")
    return chat, vision


def _get_ai_client() -> Tuple[Optional[Any], Optional[str], Optional[str], Optional[str]]:
    if OpenAI is None:
        return None, None, None, None
    api_key = _get_api_key()
    if not api_key:
        return None, None, None, None
    base_url = _get_base_url()
    provider = 'openrouter' if _use_openrouter() else 'openai'
    chat_model, vision_model = _get_models()
    client = OpenAI(base_url=base_url, api_key=api_key) if base_url else OpenAI(api_key=api_key)
    return client, provider, chat_model, vision_model


def _month_bounds(year: int, month: int) -> Tuple[date, date]:
    start = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end = date(year, month, last_day)
    return start, end


def _latest_data_date(user) -> date:
    exp = Expense.objects.filter(user=user).order_by('-time').values_list('time', flat=True).first()
    if exp:
        return exp.date()
    sub = Subscription.objects.filter(user=user, is_active=True).order_by('-start_date').values_list('start_date', flat=True).first()
    return sub or date.today()


def _iter_recent_months(anchor: date, count: int) -> List[Tuple[int, int]]:
    y, m = anchor.year, anchor.month
    out: List[Tuple[int, int]] = []
    for _ in range(count):
        out.append((y, m))
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    return out


def _build_finance_context(user) -> Dict[str, Any]:
    latest = _latest_data_date(user)
    months = _iter_recent_months(latest, 6)
    month_summaries: List[Dict[str, Any]] = []
    for y, m in months:
        start, end = _month_bounds(y, m)
        exp_total = Expense.objects.filter(user=user, time__date__range=(start, end)).aggregate(t=Sum('price'))['t'] or 0
        subs_total = Subscription.objects.filter(user=user, is_active=True, start_date__lte=end).aggregate(t=Sum('price'))['t'] or 0
        month_summaries.append({
            "year": y,
            "month": m,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "expenses_total": float(exp_total),
            "subscriptions_total": float(subs_total),
            "spendings_total": float((exp_total or 0) + (subs_total or 0)),
        })

    last_y, last_m = months[0]
    last_start, last_end = _month_bounds(last_y, last_m)
    by_category: Dict[str, float] = {}
    last_qs = Expense.objects.filter(user=user, time__date__range=(last_start, last_end)).select_related('category')
    for e in last_qs:
        key = e.category.name if e.category else "Uncategorized"
        by_category[key] = by_category.get(key, 0.0) + float(e.price)

    subs_qs = Subscription.objects.filter(user=user, is_active=True)
    subs_data = [{
        "name": s.name,
        "price": float(s.price),
        "monthly_day": s.monthly_day,
        "start_date": s.start_date.isoformat() if s.start_date else None,
    } for s in subs_qs]

    recent_expenses = list(
        Expense.objects.filter(user=user).order_by('-time', '-id').values('id', 'name', 'price', 'time')[:100]
    )
    for itm in recent_expenses:
        itm['price'] = float(itm['price'])
        itm['time'] = itm['time'].isoformat() if isinstance(itm['time'], datetime) else str(itm['time'])

    context: Dict[str, Any] = {
        "monthly_goal": float(getattr(user, 'monthly_goal', 0) or 0),
        "anchor_date": latest.isoformat(),
        "recent_month_summaries": month_summaries,
        "last_month_by_category": by_category,
        "active_subscriptions": subs_data,
        "recent_expenses": recent_expenses,
        "currency": None,
    }
    return context


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ChatRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        message: str = ser.validated_data['message']
        if not message.strip():
            return Response({"status": "error", "detail": "message is required"}, status=status.HTTP_400_BAD_REQUEST)

        client, provider, chat_model, _ = _get_ai_client()
        if client is None or not chat_model:
            return Response(
                {"status": "error", "detail": "No AI provider configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY (and models)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_context = _build_finance_context(request.user)
        context_json = json.dumps(user_context, ensure_ascii=False)

        try:
            resp = client.chat.completions.create(
                model=chat_model,
                messages=[
                    {"role": "system", "content": FINANCE_SYSTEM_PROMPT},
                    {"role": "system", "content": f"USER_DATA_JSON:\n{context_json}"},
                    {"role": "user", "content": message},
                ],
                temperature=0.2,
            )
            text = resp.choices[0].message.content if hasattr(resp, 'choices') else ''
            return Response({"reply": text, "provider": provider})
        except Exception as e:
            return Response({"status": "error", "detail": str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class ReceiptParseView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded = request.FILES.get('file')
        if not uploaded:
            return Response({"status": "error", "detail": "file is required (multipart/form-data)"}, status=status.HTTP_400_BAD_REQUEST)

        job = ReceiptImport.objects.create(user=request.user, file=uploaded)

        client, provider, _chat_model, vision_model = _get_ai_client()
        if client is None:
            return Response({"id": job.id, "parsed": None, "status": job.status, "error": "AI client not configured"}, status=status.HTTP_400_BAD_REQUEST)
        if not vision_model:
            return Response(
                {
                    "id": job.id,
                    "parsed": None,
                    "status": job.status,
                    "error": "Vision model not configured. Set OPENROUTER_VISION_MODEL or OPENAI_VISION_MODEL."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uploaded.seek(0)
            content = uploaded.read()
            b64 = base64.b64encode(content).decode('ascii')
            mime = uploaded.content_type or 'image/png'

            user_prompt = (
                "Extract receipt information as pure JSON. No prose. Return an object: {"
                "\"merchant\": string|null, \"date\": 'YYYY-MM-DD' or null, \"currency\": string|null,"
                " \"items\":[{\"name\":string, \"quantity\":number, \"unit_price\":number|null, \"total\":number, \"category\":string|null}] }"
            )
            message_content = [
                {"type": "text", "text": user_prompt},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
            ]

            resp = client.chat.completions.create(
                model=vision_model,
                messages=[
                    {"role": "system", "content": FINANCE_SYSTEM_PROMPT},
                    {"role": "user", "content": message_content},
                ],
                temperature=0.0,
            )
            raw = resp.choices[0].message.content if hasattr(resp, 'choices') else ''

            parsed: Optional[Dict[str, Any]] = None
            try:
                start = raw.find('{')
                end = raw.rfind('}')
                if start != -1 and end != -1 and end >= start:
                    parsed = json.loads(raw[start:end + 1])
            except Exception:
                parsed = None

            if parsed is None:
                raise ValueError("Unable to parse JSON from AI response")

            job.parsed = parsed
            job.status = ReceiptImport.STATUS_PARSED
            job.save(update_fields=['parsed', 'status'])
            out = ReceiptParseResponseSerializer(job).data
            return Response(out, status=status.HTTP_200_OK)
        except Exception as e:
            job.status = ReceiptImport.STATUS_ERROR
            job.error = str(e)
            job.save(update_fields=['status', 'error'])
            return Response({"id": job.id, "parsed": None, "status": job.status, "error": job.error}, status=status.HTTP_502_BAD_GATEWAY)


class ReceiptCommitView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        ser = ReceiptCommitRequest(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        job_id: int = ser.validated_data['job_id']
        items: List[Dict[str, Any]] = ser.validated_data['items']

        job = get_object_or_404(ReceiptImport, id=job_id, user=request.user)
        created_ids: List[int] = []

        for itm in items:
            name_val = itm.get('name')
            name = name_val.strip() if isinstance(name_val, str) else ''
            if not name:
                continue
            raw_price = itm.get('price') or itm.get('total')
            if raw_price is None:
                continue
            try:
                price = Decimal(str(raw_price))
            except InvalidOperation:
                continue
            cat_name_val = itm.get('category')
            cat_name = cat_name_val.strip() if isinstance(cat_name_val, str) else ''
            category_obj: Optional[Category] = None
            if cat_name:
                category_obj, _ = Category.objects.get_or_create(user=request.user, name=cat_name)
            dt_val = itm.get('date')
            if dt_val:
                try:
                    when = datetime.fromisoformat(str(dt_val))
                except Exception:
                    try:
                        when = datetime.strptime(str(dt_val), '%Y-%m-%d')
                    except Exception:
                        when = datetime.utcnow()
            else:
                when = datetime.utcnow()

            exp = Expense.objects.create(
                user=request.user,
                name=name[:200],
                price=price,
                category=category_obj,
                time=when,
                note=str(itm.get('note') or '')[:500],
            )
            created_ids.append(exp.id)

        job.status = ReceiptImport.STATUS_IMPORTED
        job.save(update_fields=['status'])
        return Response({"created_expense_ids": created_ids}, status=status.HTTP_201_CREATED)
