# Deployment Guide - Investment Dashboard

This application is built with **Next.js** and can be deployed to **Vercel** with zero configuration.

## Prerequisites
- A [GitHub](https://github.com/) account.
- A [Vercel](https://vercel.com/) account.

## Step 1: Push to GitHub
1.  Initialize a repository (if you haven't already):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/investment-dashboard.git
    git branch -M main
    git push -u origin main
    ```

## Step 2: Deploy to Vercel
1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `investment-dashboard` repository from GitHub.
4.  **Framework Preset**: Ensure "Next.js" is selected.
5.  **Build Settings**: Default settings are fine (`npm run build`).
6.  Click **Deploy**.

## Environment Variables (Optional)
This app uses `yahoo-finance2` which fetches public data. No API keys are required for the basic functionality.

## Verification
Once deployed, Vercel will provide a URL (e.g., `https://investment-dashboard.vercel.app`).
- Visit the URL.
- Verify that the "Real-Time Data" loads.
- Check that the "Market Prediction" widget works.
