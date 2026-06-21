## That's the full scaffold done 🎉

Here's a summary of every `#backend-needed` comment across the project and what needs to happen for each:

**`ReporterPage.jsx`**
- Replace mock regions with `GET /api/v1/regions`
- Replace simulated submit with `POST /api/v1/requests`

**`AuthContext.jsx`**
- Replace the thrown error in `login()` with `api.post('/auth/login', { email, password })`

**`LoginPage.jsx`**
- Login form: call `saveSession(res.data.token, res.data.user)` after successful login

**`DashboardPage.jsx`**
- Replace mock KPI data with `GET /api/v1/metrics/summary` via React Query
- Replace mock requests with `GET /api/v1/requests` via React Query
- Replace simulated status update with `PATCH /api/v1/requests/:id/status`
- Replace simulated refresh with `queryClient.invalidateQueries()`

---

## Final commit message

```
feat: add axios instance with auth interceptor and request config
```

---

## Then merge to main

Once you've tested everything end to end on the branch:

```bash
git checkout main
git merge feat/frontend-scaffold
git push
```

Your frontend is fully built and ready for the backend to plug in. Nice work 💪