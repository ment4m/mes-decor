# Send bookings to a Google Sheet

1. Create a new Google Sheet (any name, e.g. "Mes Decor Bookings").
2. In the sheet: **Extensions → Apps Script**. Delete the sample code and paste in `Code.gs` from this folder.
3. Change `CHANGE-ME` to a long random password of your choice.
4. Click **Deploy → New deployment → type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click Deploy, approve the permissions, and copy the **Web app URL**.
5. In Netlify → Site configuration → Environment variables, add:
   - `GOOGLE_SHEET_URL` = the Web app URL
   - `GOOGLE_SHEET_SECRET` = the same password from step 3
6. Redeploy the site. Each new Stripe payment now adds a row to the sheet.

If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
