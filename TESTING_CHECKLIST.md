# Quick Testing Checklist

## Before Testing

### 1. Start Backend
```bash
cd backend
python main.py
```
✅ Should see: "Uvicorn running on http://0.0.0.0:8000"

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
✅ Should see: "Local: http://localhost:3000"

---

## Test Each Page

### Dashboard (/)
- [ ] Balance card shows correct amount
- [ ] Income/expense stats display
- [ ] Recent transactions list appears
- [ ] Pie chart renders
- [ ] Add expense button works
- [ ] Upload receipt button works
- [ ] Delete transaction works

### Expenses (/expenses)
- [ ] Page loads without errors
- [ ] Loading spinner appears briefly
- [ ] Table displays all expenses
- [ ] Total amount is calculated
- [ ] Date is formatted correctly
- [ ] Delete button shows confirmation
- [ ] Delete removes expense and refreshes

### Income (/income)
- [ ] Page loads without errors
- [ ] Loading spinner appears briefly
- [ ] Table displays all income
- [ ] Total income is calculated
- [ ] Amounts show with + prefix
- [ ] Delete button works

### Reports (/reports)
- [ ] Page loads without errors
- [ ] Summary cards show correct totals
- [ ] Pie chart displays categories
- [ ] Bar chart displays categories
- [ ] Charts have proper colors
- [ ] Tooltips work on hover

### Settings (/settings)
- [ ] Page loads without errors
- [ ] Current limit displays
- [ ] Input field is pre-filled
- [ ] Can enter new limit
- [ ] Save button works
- [ ] Success message appears
- [ ] Limit updates on dashboard

---

## Browser Console Checks

Open DevTools (F12) → Console tab

### Expected Logs:
```
Fetching expenses from API...
Expenses fetched: [...]
Fetching income from API...
Income fetched: [...]
Fetching spending limit from API...
Limit fetched: {...}
```

### Should NOT See:
- ❌ CORS errors
- ❌ 404 errors
- ❌ Failed to fetch
- ❌ Undefined errors
- ❌ TypeScript errors

---

## Network Tab Checks

Open DevTools (F12) → Network tab

### Expected Requests:
- `GET /summary` → 200 OK
- `GET /expenses` → 200 OK
- `GET /income` → 200 OK
- `GET /limit` → 200 OK
- `POST /expense` → 201 Created (when adding)
- `DELETE /expense/1` → 200 OK (when deleting)

### Response Preview:
Click on any request → Preview tab
Should see JSON data, not HTML error page

---

## Common Issues & Solutions

### Issue: "Failed to fetch"
**Solution**: Backend not running. Start with `python main.py`

### Issue: CORS error
**Solution**: 
- Check backend allows `http://localhost:3000`
- Restart backend after CORS config change

### Issue: Empty data
**Solution**:
- Add some test data via Dashboard
- Check backend database has data

### Issue: Page stuck on loading
**Solution**:
- Check browser console for errors
- Verify API URL is `http://localhost:8000`
- Check backend is responding

### Issue: TypeScript errors
**Solution**:
- Run `npm install` to ensure dependencies
- Check `api.ts` interfaces match backend

---

## Quick Smoke Test

1. Open http://localhost:3000
2. Dashboard should load with data
3. Click "Analytics" → Should show charts
4. Click "Settings" → Should show limit form
5. Navigate back to Dashboard
6. Add an expense
7. Go to Expenses page → Should see new expense
8. Delete the expense → Should disappear

If all above work: ✅ **Everything is working!**

---

## Data Verification

### Check Backend Has Data:
```bash
# In browser or curl
curl http://localhost:8000/expenses
curl http://localhost:8000/income
curl http://localhost:8000/summary
```

Should return JSON arrays/objects, not empty `[]`

### Add Test Data:
Use Dashboard "Add Expense" button to create:
- 3-5 expenses in different categories
- 1-2 income entries
- Set a spending limit

Then test all pages again.

---

## Success Criteria

✅ All pages load without errors
✅ All pages show real data from backend
✅ Loading spinners appear during fetch
✅ Error messages show if backend is down
✅ Delete buttons work and refresh data
✅ Settings form saves successfully
✅ Charts display correct data
✅ Navigation works between all pages
✅ No console errors
✅ All API requests return 200/201

---

## If Everything Works

🎉 **Congratulations!** Your expense tracker is fully functional:
- ✅ Frontend connected to backend
- ✅ All pages fetching real data
- ✅ CRUD operations working
- ✅ Charts and analytics displaying
- ✅ Settings management functional

## Next Steps:
1. Add more features (edit, filters, search)
2. Improve UI/UX (animations, toasts)
3. Add data validation
4. Implement pagination
5. Add export functionality
