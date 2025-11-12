# Frontend Authentication - Testing & Verification Guide

## ✅ Quick Verification Checklist

### Pre-Testing Setup

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Database migrated with user tables
- [ ] Environment variables set in `.env`

---

## 🧪 Manual Testing Scenarios

### Scenario 1: User Registration

**Steps:**

1. Open `http://localhost:3000/register`
2. Fill in form:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Password: "SecurePass123"
   - Confirm Password: "SecurePass123"
3. Click "Create Account"

**Expected Results:**

- ✅ Form validates all fields
- ✅ Password strength indicator shows
- ✅ Success message appears
- ✅ Redirected to `/dashboard` after 1.5 seconds
- ✅ User data in localStorage under `userData`
- ✅ Token in localStorage under `userToken`

**Test Invalid Cases:**

- [ ] Empty fields → Show error messages
- [ ] Short name → "must be at least 2 characters"
- [ ] Invalid email → "Email is invalid"
- [ ] Short password → "must be at least 8 characters"
- [ ] No digit in password → "must contain at least one digit"
- [ ] Passwords don't match → "Passwords do not match"

---

### Scenario 2: User Login

**Steps:**

1. Open `http://localhost:3000/login`
2. Enter credentials:
   - Email: "john@example.com"
   - Password: "SecurePass123"
3. Click "Sign In"

**Expected Results:**

- ✅ Form validates email and password
- ✅ Success message appears
- ✅ Redirected to `/dashboard`
- ✅ Token stored in localStorage
- ✅ User data displayed in dashboard

**Test Invalid Cases:**

- [ ] Wrong password → "Invalid email or password"
- [ ] Non-existent email → "Invalid email or password"
- [ ] Empty fields → Validation errors

**Test Remember Me:**

- [ ] Check "Remember me" checkbox
- [ ] Login with valid credentials
- [ ] Close and reopen `/login`
- [ ] Email should be pre-filled in form

---

### Scenario 3: Protected Routes

**Steps:**

1. Logout or open incognito window
2. Try accessing `http://localhost:3000/dashboard` directly

**Expected Results:**

- ✅ Automatically redirected to `/login`
- ✅ No dashboard content visible without token

**Test with Expired Token:**

1. Manually delete `userToken` from localStorage while on dashboard
2. Perform any action that requires API call

**Expected Results:**

- ✅ 401 error from API
- ✅ Redirected to `/login`
- ✅ Token cleared from localStorage

---

### Scenario 4: Logout

**Steps:**

1. Login to dashboard
2. Click "Logout" button in navbar

**Expected Results:**

- ✅ Call to `/users/logout` endpoint
- ✅ All tokens cleared from localStorage
- ✅ User data cleared from localStorage
- ✅ Redirected to `/login`
- [ ] Can't access `/dashboard` without logging in again

---

### Scenario 5: Already Logged In Redirect

**Steps:**

1. Login and go to dashboard
2. Try accessing `/login` or `/register`

**Expected Results:**

- ✅ Automatically redirected to `/dashboard`
- ✅ Can't manually navigate to login pages when authenticated

---

### Scenario 6: Dashboard Display

**Steps:**

1. Login successfully
2. Check dashboard page

**Expected Results:**

- ✅ User's full name displayed in welcome message
- ✅ User's email displayed in account info
- ✅ User's username displayed
- ✅ User's role displayed (should be "student")
- ✅ All navigation links visible
- ✅ Logout button functional

---

## 🔍 Browser DevTools Verification

### Network Tab

1. Open Developer Tools → Network tab
2. Register/Login with valid credentials
3. Look for POST request to `/users/register` or `/users/login`

**Expected Response:**

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "role": "student",
    "...": "..."
  }
}
```

**Response Headers:**

- [ ] Status: 200 (login) or 201 (register)
- [ ] Content-Type: application/json
- [ ] CORS headers present

### Application Tab (Storage)

1. Open Developer Tools → Application → Local Storage
2. Look for entries:
   - `userToken` - Should contain JWT token
   - `userData` - Should contain user JSON
   - `rememberedEmail` - Only if remember me checked

**Expected Format:**

```
userToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
userData: {"id":1,"email":"john@example.com",...}
```

### Console

1. Check for JavaScript errors
2. Look for API response logs (if enabled)
3. No 404 or 401 errors on successful auth

---

## 🎯 Component-Specific Tests

### Register Component

```javascript
// Test password strength indicator
- Empty → null
- "pass" → Weak
- "Pass123" → Fair
- "Pass1@word" → Good
- "Pass1@word!#" → Strong
```

### Login Component

```javascript
// Test validation
- Valid email format required
- Password minimum 6 characters
- Both fields required
```

### Dashboard Component

```javascript
// Test rendering
- Welcome message with user name
- Account info populated
- Navigation accessible
- Logout button clickable
```

### AuthContext

```javascript
// Test state management
- User state updates after login
- Token state updates after register
- Loading state shows during auth check
- isAuthenticated flag toggles correctly
```

---

## 🚨 Error Handling Tests

### Network Errors

1. Disconnect internet
2. Try to login/register
3. Check error message: "Cannot connect to server"

### Backend Down

1. Stop backend server
2. Try to login/register
3. Should show network error

### Invalid Credentials

1. Enter non-existent email
2. Try to login
3. Should show: "Invalid email or password"

### Validation Errors

1. Submit form with empty fields
2. Should show individual field errors
3. All errors should disappear when typing

---

## 📱 Responsive Design Tests

### Desktop (1920x1080)

- [ ] Form centered and properly sized
- [ ] All text readable
- [ ] Buttons properly sized for clicking
- [ ] Navigation bar horizontal layout

### Tablet (768x1024)

- [ ] Form still centered
- [ ] Touch-friendly button sizes
- [ ] Text remains readable
- [ ] Navigation adjusts

### Mobile (375x667)

- [ ] Form fills screen appropriately
- [ ] No horizontal scrolling
- [ ] Buttons easily tappable
- [ ] Password label visible with input
- [ ] Navigation items stacked (if applicable)

---

## 🔗 Integration Tests

### With Existing Admin Auth

1. Login as admin at `/admin`
2. Verify admin dashboard works
3. Login as user at `/login`
4. Verify user dashboard works
5. Both should have separate tokens

### Token in API Requests

1. Login as user
2. Open Network tab in DevTools
3. Perform any action (refresh profile, etc.)
4. Check Authorization header: `Bearer {token}`

### Logout Behavior

1. Login as user
2. Manually delete `userToken` from localStorage
3. Try to access protected route
4. Should redirect to `/login` immediately

---

## ✨ Polish & UX Tests

### Animations

- [ ] Form inputs have smooth transitions
- [ ] Alerts slide down smoothly
- [ ] Loading spinner rotates smoothly
- [ ] Buttons have hover effects

### Error Messages

- [ ] Display inline with field
- [ ] Color-coded (red for errors)
- [ ] Clear and actionable
- [ ] Shake animation on error

### Success Messages

- [ ] Green background and text
- [ ] Display at top of form
- [ ] Show for sufficient time
- [ ] Auto-dismiss or closeable

### Focus States

- [ ] Outline visible when tabbing
- [ ] Accessible color contrast
- [ ] Form fields clearly focused

---

## 🐛 Common Issues & Solutions

| Issue                              | Solution                                               |
| ---------------------------------- | ------------------------------------------------------ |
| Login redirects to empty dashboard | Check backend is running on 8000                       |
| CORS error                         | Verify backend CORS middleware includes localhost:3000 |
| Token not saving                   | Check localStorage permissions                         |
| Can't logout                       | Verify `/users/logout` endpoint exists                 |
| Form validation doesn't work       | Check browser console for JS errors                    |
| Page blank after login             | Verify Dashboard.js imports are correct                |

---

## 📋 Pre-Deployment Checklist

- [ ] All forms validate correctly
- [ ] Error messages are user-friendly
- [ ] Loading states display properly
- [ ] Token persists in localStorage
- [ ] Protected routes redirect properly
- [ ] Logout clears all data
- [ ] Mobile responsive works
- [ ] No console errors
- [ ] API calls use correct endpoints
- [ ] Environment variables configured
- [ ] Backend endpoints accessible
- [ ] CORS properly configured
- [ ] Security: No passwords logged
- [ ] Security: Tokens not exposed in URLs
- [ ] Testing in multiple browsers
- [ ] Testing on mobile devices

---

## 🎬 Quick Test Commands

```bash
# Start both services
# Terminal 1: Backend
cd backend && python main.py

# Terminal 2: Frontend
cd frontend && npm start

# In Browser
# Register: http://localhost:3000/register
# Login: http://localhost:3000/login
# Dashboard: http://localhost:3000/dashboard
```

---

**Test Status:** Ready for QA
**Last Updated:** November 13, 2025
