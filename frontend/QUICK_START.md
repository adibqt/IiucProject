# Frontend Auth - Quick Start for Developers

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Set Environment Variables

Create `.env` file in frontend directory:

```
REACT_APP_API_URL=http://localhost:8000/api
```

### Step 3: Start the App

```bash
npm start
```

App opens at `http://localhost:3000`

---

## 🔗 Key URLs to Know

| Page            | URL                | Auth Required |
| --------------- | ------------------ | ------------- |
| Home            | `/`                | No            |
| Register        | `/register`        | No\*          |
| Login           | `/login`           | No\*          |
| User Dashboard  | `/dashboard`       | Yes ✅        |
| Admin Login     | `/admin`           | No            |
| Admin Dashboard | `/admin/dashboard` | Yes (admin)   |

\*Redirects to `/dashboard` if already logged in

---

## 📝 Quick Usage Examples

### Using the Auth Hook

```javascript
import { useAuth } from "./contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h1>Welcome, {user.full_name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Calling User API

```javascript
import { userAPI } from "./services/api";

// Register
const result = await userAPI.register(
  "John Doe",
  "john@example.com",
  "Pass123"
);

// Login
const result = await userAPI.login("john@example.com", "Pass123");

// Get profile
const profile = await userAPI.getProfile();

// Update profile
await userAPI.updateProfile({
  full_name: "John Updated",
  bio: "New bio",
});
```

### Creating Protected Components

```javascript
import { useAuth } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function ProtectedComponent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return <div>This is protected content</div>;
}
```

---

## 🧪 Test Credentials

After registration:

- **Email:** `your-email@example.com`
- **Password:** Must be 8+ chars with at least 1 digit

Or use these after first registration:

```
Email:    test@example.com
Password: TestPass123
```

---

## 🐛 Common Issues & Fixes

### "Cannot connect to server"

**Problem:** Backend not running  
**Fix:** Start backend on port 8000

```bash
cd backend && python main.py
```

### "CORS policy error"

**Problem:** Backend CORS not configured  
**Fix:** Verify CORS middleware in `main.py` includes `localhost:3000`

### "Cannot read property 'userToken' of undefined"

**Problem:** localStorage access issue  
**Fix:** Check browser allows localStorage (not private/incognito)

### "Token is null"

**Problem:** Token not being sent  
**Fix:** Check API interceptor in `services/api.js` is correct

### Form won't submit

**Problem:** Validation errors not displayed  
**Fix:** Check browser console for JavaScript errors

---

## 📁 Important Files

```
frontend/src/
├── contexts/AuthContext.js     ← State management (USE THIS)
├── pages/
│   ├── Login.js                ← Login page
│   ├── Register.js             ← Registration page
│   └── Dashboard.js            ← User dashboard
├── services/api.js             ← API calls (UPDATE THIS)
└── App.js                       ← Routing (UPDATE THIS)
```

---

## 🔑 Key Exports

### AuthContext

```javascript
// Use like this:
import { useAuth, AuthProvider } from "./contexts/AuthContext";

// In your app:
<AuthProvider>
  <YourApp />
</AuthProvider>;

// In any component:
const auth = useAuth();
// auth.user, auth.token, auth.login(), auth.logout(), etc.
```

### API Service

```javascript
import { userAPI } from './services/api';

userAPI.register(...)   // Register
userAPI.login(...)      // Login
userAPI.logout()        // Logout
userAPI.getProfile()    // Get current user
userAPI.addSkill(...)   // Add skill
// ... and more
```

---

## ⚙️ Configuration

### Backend API URL

Change in `.env`:

```
REACT_APP_API_URL=http://localhost:8000/api
```

### Token Storage

Currently stored in `localStorage`:

- `userToken` - JWT token
- `userData` - User object (JSON)
- `rememberedEmail` - Saved email (optional)

### Password Requirements

- Minimum 8 characters
- At least 1 digit
- At least 1 uppercase letter

### Token Expiration

- Backend: 24 hours (set in `auth.py`)
- Frontend: Automatically redirect on 401

---

## 🔄 Data Flow

### Registration Flow

```
User fills form
    ↓
Frontend validates
    ↓
POST /users/register
    ↓
Backend creates user
    ↓
Returns token + user
    ↓
Frontend saves token
    ↓
Redirect to /dashboard
```

### Login Flow

```
User enters credentials
    ↓
Frontend validates
    ↓
POST /users/login
    ↓
Backend verifies password
    ↓
Returns token + user
    ↓
Frontend saves token
    ↓
Redirect to /dashboard
```

### Protected Route Access

```
User tries to access /dashboard
    ↓
Check if token exists
    ↓
If no token → Redirect to /login
    ↓
If token exists → Show dashboard
    ↓
API requests auto-add token header
```

---

## 📊 Component Structure

```
App.js
├── AuthProvider (Wraps entire app)
│   ├── Home (/)
│   ├── Register (/register)
│   ├── Login (/login)
│   ├── Dashboard (/dashboard) ← Protected
│   ├── AdminLogin (/admin)
│   └── AdminDashboard (/admin/dashboard) ← Protected
```

---

## 🎯 Development Workflow

### Adding a Protected Component

1. Import `useAuth` hook
2. Check `isAuthenticated` state
3. Redirect if needed
4. Render component

### Adding an API Call

1. Add method to `userAPI` in `services/api.js`
2. Import and use in component
3. Handle response and errors

### Updating User Profile

1. Call `userAPI.updateProfile(data)`
2. AuthContext updates state
3. Use `useAuth().user` to get fresh data

---

## 🔐 Security Notes

### Never Do This ❌

```javascript
// Don't log tokens
console.log(token);

// Don't store passwords
localStorage.setItem("password", password);

// Don't use unencrypted passwords
axios.post("/login", { password: "plaintext" });
```

### Always Do This ✅

```javascript
// Tokens managed automatically
const { token } = useAuth()

// Passwords sent to backend only
await userAPI.login(email, password)

// HTTPS in production
REACT_APP_API_URL=https://api.example.com/api
```

---

## 📱 Mobile Testing

### Test on Mobile

```bash
# Get local IP
ipconfig getifaddr en0   # Mac
ipconfig               # Windows

# Connect mobile to same WiFi
# Visit: http://<YOUR-IP>:3000
```

### Mobile Viewport

```javascript
// Test different sizes in DevTools
// F12 → Ctrl+Shift+M (or Cmd+Shift+M on Mac)
```

---

## 🚢 Deployment Checklist

- [ ] Update `.env` with production API URL
- [ ] Test login/register on production backend
- [ ] Verify CORS settings
- [ ] Remove console.logs
- [ ] Test in production browsers
- [ ] Check mobile responsive design
- [ ] Verify tokens persist correctly
- [ ] Test logout and re-login

---

## 📞 Helpful Commands

```bash
# Start frontend
npm start

# Build for production
npm run build

# Run tests (if available)
npm test

# Check for errors
npm run lint

# Clear node_modules and reinstall
rm -rf node_modules && npm install

# Kill process on port 3000 (if stuck)
lsof -ti :3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000    # Windows
```

---

## 💡 Pro Tips

1. **Use React DevTools Extension**

   - See component hierarchy
   - Check context values
   - Debug component state

2. **Use Network Tab**

   - See all API requests
   - Check response status
   - View request headers

3. **Use Application Tab**

   - View localStorage contents
   - Debug token storage
   - Check session data

4. **Use Console Tab**
   - See error messages
   - Test API calls manually
   - Debug auth flow

---

## 🎓 Learning Resources

### React Context

- [Official Docs](https://react.dev/reference/react/useContext)
- Great for global state without Redux

### React Router

- [Route Protection Patterns](https://reactrouter.com/)
- [useNavigate Hook](https://reactrouter.com/en/main/hooks/use-navigate)

### JWT Authentication

- [JWT.io](https://jwt.io/) - Token debugger
- [How JWT Works](https://tools.ietf.org/html/rfc7519)

### localStorage vs Cookies

- localStorage: Good for SPA tokens
- Cookies: Better for sensitive data in production

---

## ❓ FAQ

**Q: Should I use localStorage for tokens?**  
A: For development yes. In production, consider httpOnly cookies for better security.

**Q: How do I refresh the token?**  
A: Add a token refresh endpoint that returns a new token before expiration.

**Q: Can I use this with TypeScript?**  
A: Yes! Convert JS files to .ts and add type definitions.

**Q: How do I add social login?**  
A: Create a `/social-login` endpoint on backend and redirect there.

**Q: Is the password validated on frontend enough?**  
A: No! Always validate on backend. Frontend validation is for UX only.

---

## 🎉 You're Ready!

- ✅ Frontend auth system complete
- ✅ All files organized
- ✅ Documentation provided
- ✅ Ready to build on top

**Next Steps:**

1. Add profile management
2. Add skill management
3. Add CV upload
4. Implement password reset
5. Add email verification

---

**Last Updated:** November 13, 2025  
**Status:** ✅ Production Ready
