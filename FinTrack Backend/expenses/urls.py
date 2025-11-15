from django.urls import path
from .views import ExpenseListCreateView, ExpenseDetailView, CategoryListCreateView

urlpatterns = [
    path('', ExpenseListCreateView.as_view(), name='expenses-list-create'),
    path('<int:pk>/', ExpenseDetailView.as_view(), name='expenses-detail'),
    path('categories/', CategoryListCreateView.as_view(), name='categories-list-create'),
]


