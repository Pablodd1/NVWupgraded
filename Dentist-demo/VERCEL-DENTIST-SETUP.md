# 🦷 Dentist Studio - Standalone Vercel Deployment

This project is configured to be deployed as its own standalone application on Vercel, separate from the Winery project.

## 🚀 Deployment Instructions

### 1. Create a New Project on Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Import the **same repository** as the Winery project.

### 2. Configure the "Root Directory"
During the import process, expand the **"Build and Development Settings"** section:
- Change the **Root Directory** to: `Dentist-demo`
- Vercel will automatically detect the **Vite** framework from that folder.

### 3. Set Environment Variables
The Dentist app requires its own Google Gemini API key. Add the following variable in the **"Environment Variables"** section:

| Name | Value |
|------|-------|
| `VITE_GEMINI_API_KEY` | `your_google_ai_studio_api_key_here` |

### 4. Deploy
Click **"Deploy"**. Your Dentist Studio will be live at its own URL (e.g., `dentist-studio.vercel.app`).

---

## 🛠 Features Updated for Vercel
- **Standalone Config**: Added `Dentist-demo/vercel.json` for single-page app routing.
- **Environment Support**: Updated `geminiService.ts` to support the `VITE_GEMINI_API_KEY` standard used by Vercel.
- **Winery Isolation**: The Winery project (`napa-one.vercel.app`) is configured to ignore this folder so they don't interfere with each other.
