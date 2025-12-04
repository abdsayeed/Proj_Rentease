# Troubleshooting Guide - Rentease

## Current Status

### ✅ What's Working:
- Backend API is running (http://127.0.0.1:5000)
- Frontend is running (http://localhost:4200)
- API calls are successful (200 status codes in logs)
- Home page with properties listing
- Login and Registration
- Premium design applied

### ⚠️ Reported Issues:
- Dashboard not working properly
- Favorites page not working
- Add Properties page not working

## Diagnostic Information

### Backend Logs Show:
```
✅ GET /api/v1/users/favorites HTTP/1.1" 200
✅ GET /api/v1/users/inquiries HTTP/1.1" 200
✅ GET /api/v1/agent/properties HTTP/1.1" 200
✅ POST /auth/login HTTP/1.1" 200
✅ POST /auth/register HTTP/1.1" 201
```

All API endpoints are responding successfully!

## Possible Causes & Solutions

### 1. **Pages Show Loading Spinner Forever**

**Cause**: The dashboard component has a 10-second timeout that might be triggering

**Solution**: 
- Refresh the page (Ctrl + F5)
- Check browser console for errors (F12)
- Clear browser cache and localStorage

### 2. **Pages Show Empty State**

**Cause**: You might not have data yet

**For Dashboard**:
- User role: Needs favorites or inquiries
- Agent role: Needs to add properties first
- Admin role: Should show statistics

**For Favorites**:
- You need to add properties to favorites first
- Go to home page → Click on a property → Add to favorites

**For Add Properties**:
- Only works if logged in as Agent or Admin
- Check your role in localStorage: `localStorage.getItem('role')`

### 3. **Authentication Issues**

**Check if you're logged in**:
1. Open browser console (F12)
2. Type: `localStorage.getItem('token')`
3. If null, you need to login again

**Check your role**:
1. Open browser console (F12)
2. Type: `localStorage.getItem('role')`
3. Should return: 'user', 'agent', or 'admin'

### 4. **Route Guards Blocking Access**

**Add Property** requires agent or admin role:
- If you're a regular user, you can't access this page
- Register a new account with "Agent" role

**Admin Panel** requires admin role:
- Update your role in MongoDB:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## Quick Fixes

### Fix 1: Clear Browser Data
```
1. Press Ctrl + Shift + Delete
2. Clear cached images and files
3. Clear cookies and site data
4. Refresh page (Ctrl + F5)
```

### Fix 2: Re-login
```
1. Logout (if logged in)
2. Clear localStorage: localStorage.clear()
3. Login again
4. Try accessing the pages
```

### Fix 3: Check Role
```javascript
// In browser console (F12)
console.log('Token:', localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));

// If role is wrong, update it:
localStorage.setItem('role', 'agent'); // or 'admin'
```

### Fix 4: Register as Agent
```
1. Logout
2. Go to Register page
3. Select "Agent (Property Owner)" role
4. Register and login
5. Try Add Property page
```

## Testing Each Feature

### Test Dashboard:
1. Login with any account
2. Go to http://localhost:4200/dashboard
3. Should see:
   - User: Favorites and inquiries count
   - Agent: Properties count and add button
   - Admin: System statistics

### Test Favorites:
1. Login as any user
2. Go to home page
3. Click on a property
4. Add to favorites
5. Go to http://localhost:4200/favorites
6. Should see your favorited properties

### Test Add Property:
1. Login as Agent or Admin
2. Go to http://localhost:4200/add-property
3. Fill in the form:
   - Title (required)
   - Price (required)
   - Location (required)
   - Property Type
4. Click "Add Property"
5. Should redirect to dashboard

## API Endpoints Test

Test if backend is working:

### Test Properties:
```
http://127.0.0.1:5000/api/v1/properties/
```

### Test Login:
```
POST http://127.0.0.1:5000/auth/login
Body: {"email": "test@test.com", "password": "password"}
```

### Test Agent Properties (need token):
```
GET http://127.0.0.1:5000/api/v1/agent/properties
Header: Authorization: Bearer YOUR_TOKEN
```

## Browser Console Commands

### Check Authentication:
```javascript
console.log('Logged in:', !!localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));
```

### Force Role Change (for testing):
```javascript
localStorage.setItem('role', 'agent'); // Change to agent
window.location.reload(); // Reload page
```

### Clear All Data:
```javascript
localStorage.clear();
window.location.href = '/login';
```

## Common Error Messages

### "Request timeout"
- Backend might be slow
- Refresh the page
- Check backend is running

### "Failed to load"
- Check CORS configuration
- Verify backend is on port 5000
- Verify frontend is on port 4200

### "403 Forbidden"
- Wrong role for the page
- Agent pages need agent/admin role
- Admin pages need admin role

### "401 Unauthorized"
- Token expired or invalid
- Login again

## Still Not Working?

### Check These:

1. **Backend Running?**
   ```
   Check: http://127.0.0.1:5000
   Should see: {"msg": "RentEase API running"}
   ```

2. **Frontend Running?**
   ```
   Check: http://localhost:4200
   Should see: Home page with properties
   ```

3. **MongoDB Running?**
   ```
   Check if MongoDB service is running
   ```

4. **Browser Console Errors?**
   ```
   Press F12 → Console tab
   Look for red error messages
   ```

5. **Network Tab**:
   ```
   Press F12 → Network tab
   Reload page
   Check if API calls are failing
   ```

## Contact Information

If issues persist:
1. Check browser console for specific errors
2. Check backend logs for API errors
3. Verify you're using the correct role for each feature
4. Try with a fresh user account

## Quick Test Script

Run this in browser console to test everything:

```javascript
// Test authentication
console.log('=== Authentication Test ===');
console.log('Token exists:', !!localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));

// Test API
fetch('http://127.0.0.1:5000/api/v1/properties/')
  .then(r => r.json())
  .then(d => console.log('Properties loaded:', d.length))
  .catch(e => console.error('API Error:', e));

// Test auth API
const token = localStorage.getItem('token');
if (token) {
  fetch('http://127.0.0.1:5000/api/v1/users/favorites', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(d => console.log('Favorites loaded:', d.length))
  .catch(e => console.error('Favorites Error:', e));
}
```

This will show you exactly what's working and what's not!
