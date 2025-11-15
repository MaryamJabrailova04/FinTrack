from django.urls import path
from .views import ChatView, ReceiptParseView, ReceiptCommitView

urlpatterns = [  # type: ignore[var-annotated]
    path('chat/', ChatView.as_view(), name='ai-chat'),
    path('receipt/parse/', ReceiptParseView.as_view(), name='ai-receipt-parse'),
    path('receipt/commit/', ReceiptCommitView.as_view(), name='ai-receipt-commit'),
]

