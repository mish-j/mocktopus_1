from django.urls import path
from .views import RegisterView


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
# accounts/urls.py
from django.urls import path
from .views import RegisterView, CurrentUserView, ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path("current-user/", CurrentUserView.as_view(), name="current-user"),
    path("profile/", ProfileView.as_view(), name="profile"),
    
    # 🔐 JWT LOGIN (login to get token)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
