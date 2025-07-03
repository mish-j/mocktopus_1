from rest_framework import serializers
from .models import CodeExecution

class CodeExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeExecution
        fields = ['id', 'language', 'code', 'input_data', 'output', 'error_output', 
                 'execution_time', 'memory_usage', 'status', 'created_at', 'completed_at']
        read_only_fields = ['id', 'output', 'error_output', 'execution_time', 
                           'memory_usage', 'status', 'created_at', 'completed_at']

class CodeExecutionRequestSerializer(serializers.Serializer):
    language = serializers.ChoiceField(choices=CodeExecution.LANGUAGE_CHOICES)
    code = serializers.CharField()
    input_data = serializers.CharField(required=False, allow_blank=True)
    room_id = serializers.CharField(required=False, allow_blank=True)

class CodeExecutionResponseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    status = serializers.CharField()
    output = serializers.CharField()
    error_output = serializers.CharField()
    execution_time = serializers.FloatField()
    memory_usage = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    completed_at = serializers.DateTimeField()
