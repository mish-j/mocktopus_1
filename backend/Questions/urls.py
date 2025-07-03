from django.urls import path
from .views import QuestionListByCategoryView, get_random_question, get_question_by_id

urlpatterns = [
    path('questions/<str:category>/', QuestionListByCategoryView.as_view(), name='questions-by-category'),
    path('random-question/', get_random_question, name='random-question'),
    path('question/<int:question_id>/', get_question_by_id, name='question-by-id'),
]
