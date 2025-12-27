# 🗺️ Setting up Maps API (Google Maps)

This project uses **Google Maps** for rendering interactive maps via the `@vis.gl/react-google-maps` library. Follow this guide to get your API key and set it up.

## Step 1: Get Your Google Maps API Key

1.  **Google Cloud Console**: Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create Project**: Create a new project (e.g., "Napa Valley Wineries").
3.  **Enable APIs**: Go to **APIs & Services > Library** and enable the following:
    *   **Maps JavaScript API** (Required for the web map)
    *   **Places API** (Optional, if you add autocomplete later)
4.  **Create Credentials**:
    *   Go to **APIs & Services > Credentials**.
    *   Click **Create Credentials** > **API Key**.
    *   **Copy this key**.

## Step 2: Set Variable in Vercel

1.  **Go to Vercel Dashboard**: Log in to [vercel.com](https://vercel.com/) and navigate to your project.
2.  **Settings**: Click on the **Settings** tab.
3.  **Environment Variables**: Select **Environment Variables**.
4.  **Add New Variable**:
    *   **Key**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
    *   **Value**: Paste your Google Maps API Key here.
5.  **Save**: Click **Save**.

## Step 3: Trigger a Redeploy

For the new environment variable to take effect, you must redeploy your site.

1.  Go to the **Deployments** tab in Vercel.
2.  Click the three dots (`...`) next to your latest deployment.
3.  Select **Redeploy**.

---

### ⚠️ Important Note on Billing
Google Maps API requires a billing account to be linked, even for the free tier. Ensure you have set up billing in the Google Cloud Console.
