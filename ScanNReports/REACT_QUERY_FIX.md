# React Query Fix - Dashboard Error Resolution

**Date:** 2026-03-06  
**Issue:** Dashboard showing "Error: No QueryClient set, use QueryClientProvider to set one"  
**Status:** ✅ FIXED

## Problem

After successful login, users reached the dashboard but encountered a React Query error preventing the page from loading. The error message indicated that no QueryClient was set up.

## Root Cause

The application had **two entry point files**:
- `frontend/src/main.jsx` - ❌ Missing QueryClientProvider (was being loaded)
- `frontend/src/main.tsx` - ✅ Proper QueryClientProvider setup (was NOT being loaded)

The `frontend/index.html` was referencing `/src/main.jsx`, which only rendered the App component directly without wrapping it in the required QueryClientProvider.

```jsx
// BAD: main.jsx (old)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```tsx
// GOOD: main.tsx (correct)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

## Fix Applied

1. **Deleted** `frontend/src/main.jsx` (the incorrect entry file)
2. **Updated** `frontend/index.html` to reference `main.tsx` instead:
   ```html
   <script type="module" src="/src/main.tsx"></script>
   ```
3. **Rebuilt** Docker containers to apply the fix:
   ```bash
   docker-compose down
   docker-compose build --no-cache app
   docker-compose up -d
   ```

## Verification

✅ QueryClient properly created in main.tsx  
✅ QueryClientProvider wraps the entire app  
✅ Dashboard route is inside provider  
✅ No console errors about QueryClient  
✅ Dashboard loads successfully  
✅ Containers rebuilt and running (healthy)  
✅ QueryClient found in compiled bundle (`/app/frontend/dist/assets/index-BWYQLr7K.js`)

### Container Status
```
NAME         IMAGE                COMMAND                  SERVICE   STATUS
sipper-app   sipper-app           "python -m uvicorn a…"   app       Up (healthy)
sipper-db    postgres:16-alpine   "docker-entrypoint.s…"   db        Up (healthy)
```

### Frontend Loads
```
$ curl -s http://localhost:8000/ | grep title
<title>SIPPER - SIP Testing Platform</title>
```

## Files Changed

- `frontend/src/main.jsx` - Deleted (duplicate/incorrect entry point)
- `frontend/index.html` - Updated to reference `main.tsx`

## Next Steps

- Monitor dashboard performance
- Verify data fetching works correctly
- Test all React Query hooks in other components

## Lessons Learned

- Always check for duplicate entry files when React Query context errors appear
- Verify index.html references the correct entry point
- In multi-stage Docker builds, ensure the correct source files are being bundled
