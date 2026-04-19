# Vital Log — Setup & Usage Guide

Vital Log is your private general health tracker. All data is stored **only on your device** — nothing is sent to any server, ever. It works fully offline after the first load and installs on your phone's home screen like a native app.

---

## Part 1: Uploading to GitHub (~10 minutes)

### Step 1 — Create a GitHub account
Go to **github.com** and sign up for a free account if you don't have one.

### Step 2 — Create a new repository
1. Click the **+** icon (top right) → **New repository**
2. Name it: `vital-log`
3. Set to **Public**
4. Leave everything else as default
5. Click **Create repository**

### Step 3 — Upload the app files
1. On your new repository page, click **"uploading an existing file"**
2. Unzip the `vital-log.zip` file you downloaded
3. **Show hidden files** before dragging:
   - **Mac**: Press `Cmd + Shift + .` in Finder
   - **Windows**: In File Explorer → View → tick "Hidden items"
4. Drag the **entire contents** of the unzipped folder into the GitHub upload area (including the `.github` folder)
5. Add a commit message: `Initial upload`
6. Click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Go to **Settings** tab in your repository
2. Click **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions** from the dropdown
4. Click **Save**

### Step 5 — Wait for deployment (~2 minutes)
1. Click the **Actions** tab
2. Watch for the **Deploy to GitHub Pages** workflow
3. Wait for the green ✅ tick
4. Your app is live at: `https://YOUR-USERNAME.github.io/vital-log`

---

## Part 2: Installing on Your Phone

### iPhone (Safari only)
1. Open **Safari** and go to your app URL
2. Tap the **Share** button (box with upward arrow) at the bottom
3. Scroll down → tap **Add to Home Screen**
4. Tap **Add**
5. The Vital Log icon appears on your home screen

> ⚠️ Must use Safari — Chrome on iPhone cannot install PWAs

### Android (Chrome)
1. Open **Chrome** and go to your app URL
2. Tap the **three-dot menu** (top right)
3. Tap **Add to Home screen** → **Add**
4. The icon appears on your home screen

> After installing, the app works **completely offline**. You only need internet to do a Google Fit sync.

---

## Part 3: Using the App

### Today (Dashboard)
The home screen shows:
- **Daily check-in** — tap it each morning for a 4-tap mood/energy/sleep/stress snapshot
- **Quick stats** — today's events, this week, total
- **Log an event** — five event type tiles to tap
- **Upcoming appointments**
- **Recent entries**

### Logging an Event
Tap any event tile (Panic Attack, Headache, Toothache, Illness, Pain/Other):

1. A step-by-step form slides up
2. Work through the questions — most are a single tap
3. **Auto-advance**: single-select questions move to the next step automatically after you tap
4. **Quick save**: once you've set severity, a "Quick save ⚡" button appears — tap it to save immediately and skip remaining steps
5. Every field except the timestamp is optional

**Minimum to log an event: 1 tap** (severity → quick save = 2 taps total)

### Daily Check-In
- Tap the check-in card on the dashboard each day
- Mood, Energy, Sleep quality, Stress — 4 taps, done
- If you've already checked in, tap the completed card to update it

### Appointments
- Tap **Add appointment** on the dashboard
- Choose type (Dentist, Chiropractor, GP, Specialist, Physio, Other)
- Pick date & time
- Optionally add provider name and notes
- Upcoming appointments appear on the dashboard and calendar

### Calendar
- Browse month by month
- Darker red days = more events that day
- Green dots = appointments that day
- Tap any day to see all entries and appointments for that date

### Analysis
- Switch between 7, 30, 90 days or all time
- Charts: frequency, time of day, severity, triggers, coping strategies, sleep vs severity, mood & energy over time
- **Insights panel** — plain language patterns detected in your data

### Journal
- Full searchable history of all entries
- Filter by event type using the emoji buttons
- Tap the ✏️ icon on any entry to edit it
- Tap 🗑️ and confirm to delete an entry

### Settings

**Medications** — log your ongoing prescriptions. These appear as context when reviewing entries.

**Contacts** — store your GP, dentist, emergency contacts. Phone numbers are tap-to-call.

**Google Fit** — tap-to-sync. Pulls sleep, steps, and heart rate from the last 30 days and stores them locally. Requires a free Google OAuth Client ID (see below).

**Data** — export a full JSON backup or a CSV of your entries.

---

## Part 4: Google Fit Sync Setup

Google Fit sync requires a one-time setup of a free Google Cloud project. This sounds technical but takes about 5 minutes.

1. Go to **console.cloud.google.com** and sign in
2. Click **Select a project** → **New project** → name it "Vital Log" → **Create**
3. In the left menu go to **APIs & Services** → **Library**
4. Search for "Fitness API" → click it → click **Enable**
5. Go to **APIs & Services** → **Credentials**
6. Click **Create Credentials** → **OAuth client ID**
7. Choose **Web application**
8. Under **Authorised JavaScript origins**, add your app URL: `https://YOUR-USERNAME.github.io`
9. Click **Create** — copy the **Client ID** shown
10. In Vital Log → Settings → Google Fit → paste your Client ID → tap **Sync**

After the first sync, your data is stored locally. Tap Sync again any time you want fresh data.

---

## Part 5: Keeping Your Data Safe

- **Export regularly** — Settings → Data → Export full backup (JSON). Save to iCloud, Google Drive, or email to yourself
- **Do not clear browser data** — this will erase all entries
- **Switching phones** — export JSON backup first, install app on new phone, import the backup file

---

## Troubleshooting

### The `.github` folder didn't upload
Create the workflow manually:
1. In your repo → **Add file** → **Create new file**
2. Type the filename: `.github/workflows/deploy.yml`
3. Paste the content from the `deploy.yml` file in the zip
4. Click **Commit changes**

### GitHub Actions workflow failed
Go to the **Actions** tab → click the failed run → read the error. Most common cause is the Source not being set to GitHub Actions in Pages settings.

### "Add to Home Screen" missing on iPhone
You must use **Safari** — not Chrome, Firefox, or any other browser on iOS.

### My data is gone
Check you haven't cleared Safari/Chrome data. If you have a JSON backup, go to the dashboard → upload icon → select your backup file to restore.

### Google Fit sync says "Sync failed"
- Make sure your Client ID is correct
- Make sure your app URL is in the Authorised JavaScript origins in Google Cloud
- Make sure the Fitness API is enabled in your Google Cloud project

---

## Privacy

- No account required
- No internet connection needed (except for Google Fit sync, which is optional)
- No analytics, no tracking, no ads, no servers
- All data stays on your device in browser local storage
- Your Google Fit token is never stored — a new one is requested each time you sync

---

*Built with React + Vite · Hosted on GitHub Pages*
