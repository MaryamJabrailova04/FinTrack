from django.urls import path
from .views import RegisterView, WhoAmIView, LogoutView, GoogleLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='accounts-register'),
    path('me/', WhoAmIView.as_view(), name='accounts-me'),
    path('logout/', LogoutView.as_view(), name='accounts-logout'),
    path('google-login/', GoogleLoginView.as_view(), name='accounts-google-login'),
]


