from django.urls import path
from .views import SubscriptionListCreateView, SubscriptionDetailView, SubscriptionCalendarView, GoogleImportView

urlpatterns = [
    path('', SubscriptionListCreateView.as_view(), name='subscriptions-list-create'),
    path('<int:pk>/', SubscriptionDetailView.as_view(), name='subscriptions-detail'),
    path('calendar/', SubscriptionCalendarView.as_view(), name='subscriptions-calendar'),
    path('import/google/', GoogleImportView.as_view(), name='subscriptions-import-google'),
]


