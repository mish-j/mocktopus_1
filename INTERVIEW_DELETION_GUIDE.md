# Interview Records Deletion Guide

This guide provides comprehensive instructions for deleting interview records from all related models in your Django backend.

## Models Containing Interview Data

1. **interviews.Interview** - Individual interview requests
2. **interviews.Match** - Matched interview sessions (main model)
3. **code_execution.CodeExecution** - Code execution records from sessions
4. **Questions.Question** - Interview questions (usually preserved)
5. **accounts.CustomUser** - User accounts (usually preserved)

## Method 1: Django Management Command (Recommended)

### Installation
The management command is already created at:
`backend/interviews/management/commands/delete_interviews.py`

### Usage Examples

```bash
# Navigate to backend directory
cd backend

# Show statistics about interview data
python manage.py delete_interviews --action stats

# Delete completed interviews only
python manage.py delete_interviews --action completed

# Delete old data (older than 30 days)
python manage.py delete_interviews --action old --days 30

# Delete data for specific user
python manage.py delete_interviews --action user --username john_doe

# Delete data in date range
python manage.py delete_interviews --action date-range --start-date 2024-01-01 --end-date 2024-01-31

# Delete specific match by room ID
python manage.py delete_interviews --action match --room-id "550e8400-e29b-41d4-a716-446655440000"

# Clean up orphaned code execution records
python manage.py delete_interviews --action orphaned

# Delete ALL interview data (DANGEROUS - requires confirmation)
python manage.py delete_interviews --action all --confirm
```

## Method 2: Django Shell Commands

### Basic Shell Access
```bash
cd backend
python manage.py shell
```

### Individual Model Deletion

```python
# Import required models
from interviews.models import Interview, Match
from code_execution.models import CodeExecution
from accounts.models import CustomUser
from django.db.models import Q

# 1. Delete all matches (this includes feedback, shared code, etc.)
Match.objects.all().delete()

# 2. Delete all individual interview requests
Interview.objects.all().delete()

# 3. Delete all code execution records
CodeExecution.objects.all().delete()

# 4. Get statistics
print(f"Remaining Interviews: {Interview.objects.count()}")
print(f"Remaining Matches: {Match.objects.count()}")
print(f"Remaining Code Executions: {CodeExecution.objects.count()}")
```

### Selective Deletion Examples

```python
# Delete completed interviews only
Match.objects.filter(status__in=['completed', 'finished']).delete()
Interview.objects.filter(status__in=['completed', 'finished']).delete()

# Delete old interviews (older than 30 days)
from datetime import datetime, timedelta
from django.utils import timezone
cutoff_date = timezone.now() - timedelta(days=30)
Match.objects.filter(created_at__lt=cutoff_date).delete()
Interview.objects.filter(created_at__lt=cutoff_date).delete()
CodeExecution.objects.filter(created_at__lt=cutoff_date).delete()

# Delete interviews for specific user
user = CustomUser.objects.get(username='john_doe')
Match.objects.filter(Q(user1=user) | Q(user2=user)).delete()
Interview.objects.filter(user=user).delete()
CodeExecution.objects.filter(user=user).delete()

# Delete specific match by room ID
room_id = "550e8400-e29b-41d4-a716-446655440000"
Match.objects.filter(room_id=room_id).delete()
CodeExecution.objects.filter(room_id=room_id).delete()

# Delete interviews by date range
from datetime import date
start_date = date(2024, 1, 1)
end_date = date(2024, 1, 31)
Match.objects.filter(date__range=[start_date, end_date]).delete()
Interview.objects.filter(date__range=[start_date, end_date]).delete()
```

## Method 3: Direct SQL (Advanced)

```bash
cd backend
python manage.py dbshell
```

```sql
-- Show table contents
SELECT COUNT(*) FROM interviews_match;
SELECT COUNT(*) FROM interviews_interview;
SELECT COUNT(*) FROM code_execution_codeexecution;

-- Delete all interview data (order matters due to foreign keys)
DELETE FROM code_execution_codeexecution;
DELETE FROM interviews_match;
DELETE FROM interviews_interview;

-- Verify deletion
SELECT COUNT(*) FROM interviews_match;
SELECT COUNT(*) FROM interviews_interview;
SELECT COUNT(*) FROM code_execution_codeexecution;
```

## What Each Model Contains

### Interview Model
- Individual user interview requests
- Type, date, time slot, status
- Links to user account

### Match Model
- Paired interview sessions
- Real-time collaboration data:
  - Shared code and language
  - Current question
  - Timer state
  - User feedback (JSON)
  - Join status tracking
- Links to both users

### CodeExecution Model
- Code execution records from interview sessions
- Language, code, input/output, execution stats
- Links to user and room_id

## Safety Recommendations

1. **Always backup** your database before mass deletions
2. **Test on development** environment first
3. **Use the management command** for safety and logging
4. **Start with `--action stats`** to see what you're working with
5. **Use selective deletion** before nuclear options
6. **Keep Questions and Categories** unless specifically needed

## Backup Before Deletion

```bash
# Create database backup
cd backend
python manage.py dumpdata interviews code_execution > interview_backup.json

# Restore if needed
python manage.py loaddata interview_backup.json
```

## Most Common Use Cases

1. **Development cleanup**: `python manage.py delete_interviews --action all --confirm`
2. **Production maintenance**: `python manage.py delete_interviews --action old --days 90`
3. **User data removal**: `python manage.py delete_interviews --action user --username USERNAME`
4. **Completed sessions cleanup**: `python manage.py delete_interviews --action completed`

Choose the method that best fits your needs and comfort level with Django administration!
