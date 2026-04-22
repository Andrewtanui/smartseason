from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView, UserListView, CreateAgentView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('create-agent/', CreateAgentView.as_view(), name='create_agent'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('', UserListView.as_view(), name='user_list'),
]