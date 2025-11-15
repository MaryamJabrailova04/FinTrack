from django.urls import path
from .views import SettingsMeView

urlpatterns = [
    path('me/', SettingsMeView.as_view(), name='settings-me'),
]


