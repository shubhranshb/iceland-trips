# 🇮🇸 Iceland Trip App — Vercel Deployment Guide

## What you need before starting
- A **GitHub account** (free) — github.com
- A **Vercel account** (free) — vercel.com
- The **iceland-trip-app.zip** file downloaded to your computer

---

## Step 1 — Unzip the project

Unzip `iceland-trip-app.zip` on your computer.

You should see a folder called `iceland-trip` containing:
```
iceland-trip/
  pages/
    index.js
    _app.js
    _document.js
  lib/
    tripData.js
  package.json
  next.config.js
  vercel.json
  .gitignore
  DEPLOY.md  ← this file
```

---

## Step 2 — Create a GitHub repository

1. Go to **github.com** and sign in
2. Click the **+** icon (top right) → **New repository**
3. Name it: `iceland-trip` (or anything you like)
4. Set it to **Private** (recommended — your trip details are in here)
5. **Do NOT** tick "Add a README file"
6. Click **Create repository**

---

## Step 3 — Upload files to GitHub

### Option A — Drag and drop (easiest, no terminal needed)

1. On your new empty GitHub repo page, click **uploading an existing file**
2. Open your `iceland-trip` folder on your computer
3. Select ALL files and folders inside it (`pages/`, `lib/`, `package.json`, `next.config.js`, `vercel.json`, `.gitignore`)
4. Drag them all into the GitHub upload window
5. Scroll down, click **Commit changes**

### Option B — Using Terminal (Mac/Linux)

```bash
# Navigate into the unzipped folder
cd iceland-trip

# Initialise git
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repo as remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option B — Using Terminal (Windows)

Same as above but open **Command Prompt** or **PowerShell** and run the same commands.

---

## Step 4 — Deploy on Vercel

1. Go to **vercel.com** and sign in (use "Continue with GitHub" — easiest)
2. Click **Add New Project**
3. Find your `iceland-trip` repository in the list and click **Import**
4. Vercel will auto-detect it as a **Next.js** project
5. Leave all settings as default — no changes needed
6. Click **Deploy**
7. Wait ~60 seconds for the build to complete
8. Vercel gives you a URL like: `https://iceland-trip-abc123.vercel.app`

**That's it — your app is live!** 🎉

---

## Step 5 — Open on your phone

1. Copy the Vercel URL (e.g. `https://iceland-trip-abc123.vercel.app`)
2. Open it in your phone's browser
3. **Add to home screen** for app-like experience:
   - **iPhone:** Tap Share → Add to Home Screen
   - **Android:** Tap ⋮ menu → Add to Home Screen
4. The app icon will appear on your home screen like a real app

---

## Step 6 — Saving your data before future updates

> ⚠️ The app saves data (confirmations, packing checks) to your browser's localStorage.
> If you redeploy the app, this data will be lost.

**Before redeploying, back up your data:**

1. Open the app on your phone
2. Go to **ℹ️ Info** tab → scroll to the bottom
3. Tap **Export data** → copy the JSON text that appears
4. Paste it somewhere safe (Notes app, email to yourself)

**After redeploying:**

1. Open the new app URL
2. Go to **ℹ️ Info** tab → tap **Import data**
3. Paste your saved JSON → tap Import
4. All your confirmations, packing ticks and notes are restored ✓

---

## Updating the app with new content

Whenever trip details change:

1. Edit `lib/tripData.js` on your computer with the new information
2. Go to your GitHub repo → navigate to `lib/tripData.js`
3. Click the **pencil icon** (Edit) → paste in the updated file → click **Commit changes**
4. Vercel automatically redeploys within ~60 seconds
5. Your app URL stays the same — no need to reshare it

---

## Custom domain (optional)

If you want a nicer URL like `iceland.yourdomain.com`:

1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Add your domain and follow the DNS instructions
3. Free SSL certificate is added automatically

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Build fails on Vercel | Check that `package.json` and `next.config.js` are in the root folder, not inside a subfolder |
| App loads but shows blank page | Make sure `pages/index.js` exists |
| Data lost after redeployment | Use Export/Import data feature in Info tab |
| App slow to load first time | Normal — Vercel's free tier has a cold start. Subsequent loads are fast |
| Want to share with family | Share the Vercel URL — it works on any phone, any browser |

---

## File structure reference

```
iceland-trip/           ← root folder (upload this content to GitHub)
├── pages/
│   ├── index.js        ← main app (all UI + tabs)
│   ├── _app.js         ← Next.js app wrapper
│   └── _document.js    ← HTML head config
├── lib/
│   └── tripData.js     ← all trip data (edit this to update content)
├── package.json        ← dependencies
├── next.config.js      ← Next.js config
├── vercel.json         ← Vercel deployment config
├── .gitignore          ← files to exclude from GitHub
└── DEPLOY.md           ← this guide
```

---

## Support

- **Vercel docs:** vercel.com/docs
- **Next.js docs:** nextjs.org/docs
- **GitHub upload guide:** docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

---

*Built with Next.js · Deployed on Vercel · Dec 2026 Iceland Trip*
