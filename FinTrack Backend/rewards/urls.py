from django.urls import path
from .views import RewardsListView

urlpatterns = [
    path('', RewardsListView.as_view(), name='rewards-index'),
]


