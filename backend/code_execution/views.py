from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import CodeExecution
from .serializers import (
    CodeExecutionRequestSerializer, 
    CodeExecutionResponseSerializer,
    CodeExecutionSerializer
)
from .executor import CodeExecutor
import threading

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def execute_code(request):
    """
    Execute code submitted by the user
    """
    serializer = CodeExecutionRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid request data', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create execution record
    execution = CodeExecution.objects.create(
        user=request.user,
        language=serializer.validated_data['language'],
        code=serializer.validated_data['code'],
        input_data=serializer.validated_data.get('input_data', ''),
        room_id=serializer.validated_data.get('room_id'),
        status='pending'
    )
    
    # Execute code asynchronously
    def execute_async():
        try:
            execution.status = 'running'
            execution.save()
            
            executor = CodeExecutor()
            result = executor.execute_code(
                language=execution.language,
                code=execution.code,
                input_data=execution.input_data or ''
            )
            
            # Update execution record with results
            execution.status = result['status']
            execution.output = result['output']
            execution.error_output = result['error']
            execution.execution_time = result['execution_time']
            execution.memory_usage = result['memory_usage']
            execution.completed_at = timezone.now()
            execution.save()
            
        except Exception as e:
            execution.status = 'error'
            execution.error_output = f'Internal error: {str(e)}'
            execution.completed_at = timezone.now()
            execution.save()
    
    # Start execution in background thread
    thread = threading.Thread(target=execute_async)
    thread.daemon = True
    thread.start()
    
    # Return execution ID immediately
    return Response({
        'execution_id': execution.id,
        'status': 'pending',
        'message': 'Code execution started'
    }, status=status.HTTP_202_ACCEPTED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_execution_result(request, execution_id):
    """
    Get the result of a code execution
    """
    try:
        execution = CodeExecution.objects.get(id=execution_id, user=request.user)
        serializer = CodeExecutionResponseSerializer(execution)
        return Response(serializer.data)
    except CodeExecution.DoesNotExist:
        return Response(
            {'error': 'Execution not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_execution_history(request):
    """
    Get user's code execution history
    """
    room_id = request.query_params.get('room_id')
    executions = CodeExecution.objects.filter(user=request.user)
    
    if room_id:
        executions = executions.filter(room_id=room_id)
    
    executions = executions[:20]  # Limit to recent 20 executions
    serializer = CodeExecutionSerializer(executions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_supported_languages(request):
    """
    Get list of supported programming languages
    """
    languages = [
        {'id': choice[0], 'name': choice[1]} 
        for choice in CodeExecution.LANGUAGE_CHOICES
    ]
    return Response({'languages': languages})
