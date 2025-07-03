from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    """Simple API root endpoint for testing"""
    return JsonResponse({
        'message': 'Mocktopus API is running!',
        'endpoints': {
            'admin': '/admin/',
            'accounts': '/api/register/, /api/token/',
            'interviews': '/api/interviews/',
            'questions': '/api/questions/<category>/, /api/random-question/',
            'code_execution': '/api/code/',
            'coaching': '/api/coaching/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),  # Add API root
    path('api/', include('accounts.urls')),
    path('api/interviews/', include('interviews.urls')),
    path('api/', include('Questions.urls')),
    path('api/code/', include('code_execution.urls')),
    path('api/coaching/', include('coaching.urls')),
]
