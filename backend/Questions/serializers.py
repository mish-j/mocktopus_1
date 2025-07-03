from rest_framework import serializers
from .models import Category, Question

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class QuestionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 
            'category_name', 
            'title',
            'question_text', 
            'difficulty',
            'examples',
            'constraints',
            'hints',
            'created_at'
        ]
