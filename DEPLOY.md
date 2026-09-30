# Deploying ShopNDrop to Vercel

The React app and the API run in **one** Vercel project on one domain:

```
https://<your-app>.vercel.app/            React app
https://<your-app>.vercel.app/api/...     Express API (serverless)
```

`api/index.js` hands every `/api/*` request to the Express app in `server/`,
and `vercel.json` wires it up. MongoDB has to be in the cloud, because Vercel
cannot reach the MongoDB on your laptop.

---

## 1. Create the database (MongoDB Atlas)

1. Log in at <https://cloud.mongodb.com> and create a **free M0 cluster**.
2. **Database Access** → *Add New Database User* → username and password
   (avoid `@ : / ?` in the password, they break the connection string).
3. **Network Access** → *Add IP Address* → **Allow access from anywhere**
   (`0.0.0.0/0`). Vercel has no fixed IP, so this is required.
4. **Clusters → Connect → Drivers** and copy the string. It looks like:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/shopndrop?retryWrites=true&w=majority
   ```

   Keep `/shopndrop` before the `?` — that is the database name.

## 2. Fill the database with the admin account

From the project folder on your laptop, using your Atlas string:

```bash
MONGO_URI="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/shopndrop" npm run seed:demo
```

(Windows PowerShell: `$env:MONGO_URI="..."` on one line, then `npm run seed:demo`.)

This creates the admin plus demo shops and products. Use `npm run seed` for the
admin only.

## 3. Create the Vercel project

1. <https://vercel.com/new> → import **shalinilodhi/shopdrop**.
2. Leave the build settings alone — `vercel.json` already sets them.
3. Add **Environment Variables** (Production, Preview and Development):

   | Name | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random text, e.g. 30+ characters |
   | `REACT_APP_API_URL` | `/api` |

4. **Deploy**.

`REACT_APP_API_URL=/api` makes the React app call its own domain, so there is
no CORS problem. Without it the live site would still call `localhost:5000`.

## 4. Check it works

- `https://<your-app>.vercel.app/` — the shop opens.
- `https://<your-app>.vercel.app/api/products` — a JSON list.
- Log in as the admin you seeded, approve a vendor, place an order.

## Notes

- **Changing an environment variable needs a redeploy** to take effect
  (Deployments → ⋯ → Redeploy).
- **Every push to `main` deploys automatically.**
- The free Atlas cluster sleeps only after long inactivity; the first request
  afterwards may take a few seconds.
- `server/.env` stays on your laptop and is never pushed. On Vercel the same
  values come from the environment variables above.
- Logs for API errors: Vercel dashboard → your project → **Logs**.
