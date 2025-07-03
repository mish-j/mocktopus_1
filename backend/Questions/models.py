from django.db import models
import json

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Question(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='questions')
    title = models.CharField(max_length=200)
    question_text = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    examples = models.JSONField(default=list, help_text="List of example inputs and outputs")
    constraints = models.TextField(blank=True, help_text="Problem constraints")
    hints = models.TextField(blank=True, help_text="Hints for solving the problem")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.difficulty})"
    
    def get_examples(self):
        """Return formatted examples"""
        if not self.examples:
            return []
        return self.examples
