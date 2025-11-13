# Feature #2 - Quick Start Testing Guide

## Starting the Application

### 1. Start Backend & Frontend

```powershell
# From project root
cd e:\code\NutriMap
docker-compose up -d
```

### 2. Verify Services

```powershell
# Check backend is running
docker-compose logs backend --tail=20

# Check frontend is running
docker-compose logs frontend --tail=20
```

---

## Accessing the Application

### URLs:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## User Testing Workflow

### Step 1: Authentication

1. Navigate to http://localhost:3000
2. Click "Sign In" or go to `/login`
3. Use test credentials:

   - Email: `test@example.com`
   - Password: `password123`

   OR register new account:

   - Click "Sign Up"
   - Fill in email, password, confirm password
   - Click "Create Account"

### Step 2: Access Profile Page

1. After login, go to Dashboard
2. Click "My Profile" (or navigate to `/profile`)
3. Should see tabbed interface with:
   - Basic Info tab (selected by default)
   - Skills tab
   - Career Interests tab
   - Experience tab
   - CV/Resume tab

---

## Testing Each Feature

### Feature: Basic Profile Update

**Tab:** Basic Info

1. **Edit Information:**

   - Change Full Name → Click "Save Changes"
   - Update Phone Number → Click "Save Changes"
   - Add Avatar URL → Click "Save Changes"
   - Update Bio → Click "Save Changes"

2. **Expected Results:**

   - Green success message appears
   - Message disappears after 3 seconds
   - Data persists on page reload

3. **Error Handling:**
   - Try invalid URL for avatar
   - Should see error message

---

### Feature: Skill Management

**Tab:** Skills

1. **Add Skill:**

   - Select a skill from dropdown (e.g., "JavaScript")
   - Choose proficiency level (Beginner/Intermediate/Advanced/Expert)
   - Click "Add Skill"
   - Skill appears in "Your Skills" section

2. **View Skills:**

   - All added skills display as badges
   - Each skill shows proficiency level in tooltip (on hover)
   - Shows total skill count in tab

3. **Remove Skill:**

   - Click "✕" on any skill badge
   - Skill disappears immediately
   - Success message appears

4. **Error Handling:**
   - Try adding without selecting skill → shows error
   - Network error → shows error message

---

### Feature: Career Interests

**Tab:** Career Interests

1. **Add Interest:**

   - Type interest in input field (e.g., "Data Science")
   - Click "Add Interest"
   - Interest appears as tag below

2. **Add Multiple:**

   - Keep adding interests
   - All appear in list
   - Can add duplicates (prevents via validation)

3. **Remove Interest:**

   - Click "✕" on interest tag
   - Interest removes immediately

4. **Save Interests:**
   - After adding interests, click "Save Career Interests"
   - Green success message appears
   - Interests persist on reload

---

### Feature: Work Experience

**Tab:** Experience

1. **Add Experience:**

   - Click in textarea
   - Type work experience description
   - Can include: roles, achievements, skills used, etc.

2. **Save Experience:**

   - Click "Save Experience" button
   - Success message appears
   - Data persists on page reload

3. **Edit Experience:**
   - Update text in textarea
   - Click "Save Experience" again
   - Previous data is replaced

---

### Feature: CV/Resume Management

**Tab:** CV/Resume

1. **Add CV:**

   - Click in textarea
   - Paste or type full CV/resume content
   - Click "Save CV"
   - Success message appears

2. **Edit CV:**

   - Update text content
   - Click "Save CV"
   - Changes persist

3. **Large Content:**
   - Try pasting long CV (5000+ characters)
   - Should handle without issues

---

## Testing Jobs Page Redesign

### Navigate to Jobs Page

```
URL: http://localhost:3000/jobs
```

### Feature: Search

1. **Search by Title:**

   - Type "Developer" in search box
   - Jobs list filters in real-time
   - Shows only matching jobs

2. **Search by Company:**

   - Type company name
   - Filters jobs from that company

3. **Search by Description:**
   - Type keyword from job description
   - Matches and displays relevant jobs

### Feature: Filtering

1. **Filter by Job Type:**

   - Select "Full-time" from dropdown
   - Only full-time jobs display
   - Counter shows filtered count

2. **Filter by Location:**

   - Select location from dropdown
   - Only jobs in that location display

3. **Filter by Skill:**

   - Select skill from "Required Skill" dropdown
   - Only jobs requiring that skill display

4. **Multiple Filters:**
   - Apply Job Type: "Internship"
   - Apply Location: "San Francisco"
   - Apply Skill: "JavaScript"
   - Only jobs matching ALL three filters show

### Feature: Job Cards

1. **Card Content:**

   - Job title displays prominently
   - Company name shows in cyan color
   - Job type badge (Full-time/Part-time/etc.)
   - Location with location icon
   - Description preview

2. **Match Percentage:**

   - Shows in badge on right side
   - Percentage based on skill overlap
   - Only shows if user has matching skills

3. **Matched Skills:**
   - Shows "Matched Skills:" section if any match
   - Lists first 3 matching skills
   - Shows "+N more" if more than 3 match

### Feature: Clear Filters

1. Click "Clear All Filters" button
2. All filters reset to default
3. All jobs display again
4. Counter updates

### Feature: Mobile Filters

1. On mobile device (or resize to < 768px):
   - Sidebar collapses
   - "⚙ Filters" button appears
   - Click button to open filter sidebar
   - Click "✕" to close sidebar

---

## Testing Response Times

### Profile Page Load

- Should load in < 1 second
- Profile data appears within 1-2 seconds
- Skills list loads with profile data

### Jobs Page Load

- Jobs list loads within 1-2 seconds
- Filter options available immediately
- Search is real-time (no delay)

### API Calls

- Add skill response: < 500ms
- Update profile response: < 500ms
- Save CV response: < 1000ms (larger text)

---

## Testing Error Scenarios

### Network Errors

1. **Simulate offline:**

   - Browser DevTools → Network → Offline
   - Try to save profile
   - Should show error message
   - Message should be user-friendly

2. **Bad Gateway:**
   - Stop backend container
   - Try to access profile
   - Should show error message
   - Doesn't crash frontend

### Invalid Data

1. **Invalid URL:**

   - Try invalid avatar URL
   - Click Save
   - Should show error

2. **Too Long Content:**
   - Try pasting extremely long CV (100k+ chars)
   - Should handle gracefully or show size error

---

## Testing Responsive Design

### Desktop (1920x1080)

- Sidebar displays on left
- Content area is spacious
- All text readable
- Buttons properly sized

### Tablet (768px)

- Sidebar collapses
- Filter button appears
- Job cards stack nicely
- Form inputs full width

### Mobile (375px)

- Sidebar hidden by default
- Filter button visible
- Tabs stacked or scrollable
- Cards display full width
- Buttons full width
- Text readable without zoom

---

## Testing Animations

### Profile Page

1. Page load → "fadeInDown" animation on header
2. Tab switch → Tab content "fadeIn"
3. Add skill → Skill badge appears with animation
4. Alert notifications → "slideInDown" animation

### Jobs Page

1. Page load → Jobs list "fadeIn"
2. Job card hover → Card lifts up, border highlights
3. Search filter → Jobs animate in/out
4. Clear filters → Smooth update to all jobs

---

## Testing Data Persistence

### Profile Data:

1. Edit basic info
2. Navigate away (to Jobs, Home, Dashboard)
3. Return to Profile
4. Data should be unchanged
5. Refresh page
6. Data persists from backend

### Skills:

1. Add 3 skills
2. Navigate away
3. Return to Profile
4. Skills should still be there

### Career Interests:

1. Add 5 interests
2. Click "Save Career Interests"
3. Refresh page
4. Interests should still be there

---

## Testing Cross-Browser

### Chrome/Edge

- All features should work
- Animations smooth
- Responsive design works

### Firefox

- Check form inputs render correctly
- Animations work
- Filters responsive

### Safari (Mac/iOS)

- Verify gradient text renders
- Check backdrop-filter blur effect
- Test on iPad

---

## Debugging Tips

### Frontend Console Errors

```javascript
// Open DevTools (F12)
// Go to Console tab
// Should show no red errors
// Check Network tab for API calls
```

### Backend API Calls

```
// Check Network tab in DevTools
// Click on API call
// View Request and Response
// Should have 200/201 status codes
```

### Check Backend Logs

```powershell
docker-compose logs backend -f
# Watch for incoming requests
# Check for any errors
```

---

## Test Data Creation

### Creating Test User with Skills

```powershell
# Use backend API docs
# Go to http://localhost:8000/docs
# Try endpoints manually
# Test POST /api/users/me/skills/{skill_id}
```

### Seed Jobs

```powershell
# Use Postman or curl
# POST http://localhost:8000/api/jobs/seed
# Creates sample jobs with skills
```

---

## Success Criteria Checklist

### Profile Page:

- [ ] Page loads without errors
- [ ] All 5 tabs visible and clickable
- [ ] Basic info editable and saveable
- [ ] Skills can be added and removed
- [ ] Career interests can be managed
- [ ] Experience textarea works
- [ ] CV textarea works
- [ ] Success/error alerts appear
- [ ] Page responsive on mobile
- [ ] Data persists on reload

### Jobs Page:

- [ ] All jobs load
- [ ] Search filters in real-time
- [ ] Job type filter works
- [ ] Location filter works
- [ ] Skill filter works
- [ ] Multiple filters work together
- [ ] Job cards show all info
- [ ] Match percentage displays correctly
- [ ] Matched skills display correctly
- [ ] Mobile filter toggle works
- [ ] Clear filters button works
- [ ] Empty state shows when no results
- [ ] Page responsive on all sizes

---

## Common Issues & Solutions

### Issue: Profile won't load

**Solution:**

- Check backend is running
- Check JWT token valid in localStorage
- Open DevTools console for errors
- Try logout and login again

### Issue: Skills not saving

**Solution:**

- Check backend logs
- Verify skill ID is correct
- Check network tab for 200/201 response
- Try refresh page

### Issue: Jobs not showing match %

**Solution:**

- Add skills to profile first
- Refresh jobs page
- Check if job requires matching skills
- View browser console for errors

### Issue: Mobile filter button not working

**Solution:**

- Check screen width is < 768px
- Verify CSS media query loading
- Check no console errors
- Try clearing browser cache

---

## Performance Testing

### Measure Page Load

1. Open DevTools
2. Go to Performance tab
3. Reload page
4. Check metrics:
   - First Contentful Paint (FCP): < 1s
   - Largest Contentful Paint (LCP): < 2s
   - Cumulative Layout Shift (CLS): < 0.1

### Check Memory Usage

1. Open DevTools
2. Go to Memory tab
3. Take heap snapshot
4. Compare after navigation
5. Should not continuously grow

---

## Next Steps After Testing

1. **If all tests pass:**

   - Mark Feature #2 as complete
   - Proceed to Feature #3 (Job Applications)
   - Update deployment checklist

2. **If issues found:**
   - Document issues in bug report
   - Prioritize by severity
   - Create fixes in feature branch
   - Re-test after fixes

---

## Support Resources

- **API Documentation:** http://localhost:8000/docs
- **Frontend Code:** `/frontend/src/pages/Profile.jsx`
- **Backend Code:** `/backend/routes/profile_routes.py`
- **Styling:** `/frontend/src/pages/Profile.css`
- **Services:** `/frontend/src/services/profileService.js`

---

**Happy Testing! 🎉**
