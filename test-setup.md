# Testing Setup for Two Users

## Method 1: Different Browsers (Easiest)
1. **Browser 1 (Chrome)**: Open http://localhost:3000
   - Login as User 1 (e.g., ravi)
   - Join interview room

2. **Browser 2 (Firefox or Chrome Incognito)**: Open http://localhost:3000  
   - Login as User 2 (e.g., sani)
   - Join same interview room

## Method 2: Different Ports (More realistic)

### Terminal 1: Start Backend
```bash
cd c:\Users\HP\Desktop\mocktopus\backend
python manage.py runserver
```

### Terminal 2: Start Frontend on Port 3000
```bash
cd c:\Users\HP\Desktop\mocktopus
npm start
```

### Terminal 3: Start Second Frontend on Port 3001
```bash
cd c:\Users\HP\Desktop\mocktopus
set PORT=3001 && npm start
```

Then:
- User 1: http://localhost:3000 
- User 2: http://localhost:3001

## Method 3: Use Different Devices
- User 1: Your computer (localhost:3000)
- User 2: Another computer on same network (YOUR_IP:3000)

## Testing Checklist
- [ ] Both users can join the same room
- [ ] Partner connection status shows "Connected"
- [ ] Both users see the same question
- [ ] Code changes sync between users
- [ ] Language changes sync between users
- [ ] Video call works (optional)
