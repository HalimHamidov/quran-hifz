# 🚀 Quick Deployment Guide

## Option 1: GitHub Pages (Recommended) ⭐

### Step 1: Create a new repository on GitHub
1. Go to https://github.com/new
2. Repository name: `surat-almulk` (or any name you prefer)
3. Description: "Surah Al-Mulk Memorization System"
4. Choose **Public**
5. Do NOT initialize with README
6. Click **Create repository**

### Step 2: Upload files
1. Click **"Add file"** → **"Upload files"**
2. Drag and drop or select:
   - `index.html`
   - `README.md`
3. Add commit message: "Add Surah Al-Mulk memorization system"
4. Click **"Commit changes"**

### Step 3: Enable GitHub Pages
1. Go to **Settings** → **Pages**
2. Under "Source", select **Deploy from a branch**
3. Select **main** branch and **/ (root)** folder
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Your site will be live at: `https://yourusername.github.io/surat-almulk`

---

## Option 2: Netlify (Free, Easiest) 🎉

1. Go to https://netlify.com
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag and drop the `index.html` file
4. Your site is live instantly!
5. Optional: Connect your GitHub for auto-updates

---

## Option 3: Vercel (Free, Fast) ⚡

1. Go to https://vercel.com
2. Click **"New Project"**
3. Upload your files or connect GitHub
4. Deploy with one click
5. Your site is live at a Vercel URL

---

## Option 4: Local Development

### Open locally:
```bash
# Simply double-click index.html in your file explorer
# Or open in terminal:
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

### Run a local server (optional):
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if installed)
npx http-server
```

Then open: http://localhost:8000

---

## File Structure

```
surat-almulk/
├── index.html          # Main website (all-in-one)
├── README.md           # Documentation
└── DEPLOYMENT.md       # This file
```

---

## Features Included

✅ **10 Prayer-based Blocks** - Fajr, Dhuhr, Asr, Maghrib, Isha
✅ **30 Ayahs** - Complete Surah Al-Mulk
✅ **Interactive Learning** - Click to reveal translations
✅ **Progress Tracking** - Saved to browser localStorage
✅ **Multiple View Modes** - Arabic only, with translation, memorization mode
✅ **Mini Recall Tests** - 2-3 questions per block
✅ **Mnemonics & Memory Anchors** - Emoji-based memory aids
✅ **Search & Filter** - By prayer or ayah number
✅ **Print-Friendly** - Beautiful print layout
✅ **Mobile Responsive** - Works on all devices
✅ **No Dependencies** - Pure HTML/CSS/JavaScript
✅ **Offline Ready** - Works without internet (after first load)

---

## Troubleshooting

### Progress not saving?
- Check if localStorage is enabled in your browser
- Try a different browser
- Clear browser cache and try again

### Site not loading?
- Make sure `index.html` is in the repository root
- Check that the repository is public
- Wait 2-3 minutes for GitHub Pages to deploy

### Want to edit content?
- Open `index.html` in a text editor
- Find the `blocks` array in the JavaScript section
- Edit Arabic text, translations, mnemonics, etc.
- Save and re-upload to GitHub

---

## Support

For issues or questions:
1. Check the README.md file
2. Review the code comments in index.html
3. Test in a different browser
4. Clear browser cache

---

**Barakallahu feekum!** 🤲

May Allah accept from us all and make this beneficial for the Muslim community.

*Created with ❤️ for Islamic learning*
