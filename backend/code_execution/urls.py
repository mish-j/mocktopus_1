from django.urls import path
from . import views

urlpatterns = [
    path('execute/', views.execute_code, name='execute_code'),
    path('result/<uuid:execution_id>/', views.get_execution_result, name='get_execution_result'),
    path('history/', views.get_execution_history, name='get_execution_history'),
    path('languages/', views.get_supported_languages, name='get_supported_languages'),
]
