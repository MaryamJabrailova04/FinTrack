"""
URL configuration for fintrack project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from .views import HealthView, MainPageView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthView.as_view(), name='health'),
    # Auth (JWT)
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    # Main page (optional)
    # path('', MainPageView.as_view(), name='main'),
    # App endpoints
    path('api/expenses/', include('expenses.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/profile/', include('profiles.urls')),
    path('api/settings/', include('settingsapp.urls')),
    path('api/rewards/', include('rewards.urls')),
    path('api/history/', include('historyapp.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/ai/', include('aiassistant.urls')),
]

schema_view = get_schema_view(
    openapi.Info(
        title="Finance Tracker API",
        default_version='v1',
        description="API documentation for Finance Tracker",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns += [
    re_path(r'^api/schema(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
