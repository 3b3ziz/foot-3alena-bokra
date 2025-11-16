# Cloudflare Pages Deployment Guide

## Prerequisites
- A Cloudflare account
- Git repository connected to Cloudflare Pages

## Deployment Steps

### Option 1: Automatic Deployment via Git (Recommended)

1. **Push your code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Setup for Cloudflare Pages"
   git push origin main
   ```

2. **Create a new Cloudflare Pages project**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** → **Pages**
   - Click **"Create a project"**
   - Select **"Connect to Git"**
   - Choose your repository (`foot-3alena-bokra`)

3. **Configure Build Settings**
   - **Project name**: `career-ladder` (or your preferred name)
   - **Production branch**: `main` (or your default branch)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty or set to root)
   - **Node version**: 22 (or 18+)

4. **Deploy**
   - Click **"Save and Deploy"**
   - Cloudflare will automatically build and deploy your app
   - You'll get a URL like: `career-ladder-xxx.pages.dev`
   - Future pushes to your main branch will auto-deploy

### Option 2: Direct Upload via Wrangler CLI (One-time deploy)

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   wrangler pages deploy dist --project-name=career-ladder
   ```

## Environment Variables

### Adding Environment Variables in Cloudflare Pages

For PostHog analytics, you need to add these environment variables:

1. **Go to your Cloudflare Pages project**
   - Navigate to your project in [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to **Workers & Pages** → **Pages** → Your project

2. **Add Environment Variables**
   - Click on **Settings** → **Environment variables**
   - Click **"Add variable"** for each variable:

   **Production environment:**
   - Variable name: `VITE_PUBLIC_POSTHOG_KEY`
   - Variable type: **Secret** (recommended for API keys)
   - Value: Your PostHog project API key
   - Click **"Save"**

   - Variable name: `VITE_PUBLIC_POSTHOG_HOST`
   - Variable type: **Text** (URL, not sensitive)
   - Value: Your PostHog host URL (e.g., `https://us.i.posthog.com` or `https://eu.i.posthog.com`)
   - Click **"Save"**

3. **Add to Preview/Branch environments (optional)**
   - You can add the same variables to preview environments
   - Or use different values for testing

4. **Redeploy**
   - After adding variables, trigger a new deployment
   - Go to **Deployments** → Click **"Retry deployment"** on the latest build
   - Or push a new commit to trigger auto-deploy

### Important Notes

- **Variable Types** (per [Cloudflare documentation](https://developers.cloudflare.com/workers/configuration/environment-variables/)):
  - Use **Secret** for `VITE_PUBLIC_POSTHOG_KEY` (API key - sensitive)
    - Secrets hide the value in the dashboard UI (shows asterisks)
    - Prevents accidental exposure in logs or screenshots
    - Even though `VITE_PUBLIC_*` variables are exposed in client code, storing as Secret follows security best practices
  - Use **Text** for `VITE_PUBLIC_POSTHOG_HOST` (URL - not sensitive)
- Environment variables are available at build time for Vite
- Variables prefixed with `VITE_PUBLIC_` are exposed to the client-side code
- Never commit sensitive keys to your repository
- Use Cloudflare's environment variables for all secrets

## Custom Domain (Optional)

1. Go to your Pages project settings
2. Navigate to "Custom domains"
3. Add your domain (e.g., `career-ladder.com`)
4. Follow DNS configuration instructions

## Future: Adding Cloudflare Workers Functions

When ready to add backend API:

1. Create `functions` directory in project root
2. Add API routes (e.g., `functions/api/daily-puzzle.js`)
3. Deploy - Cloudflare Pages will automatically detect and deploy functions

Example API route structure:
```
/functions
  /api
    daily-puzzle.js    // GET /api/daily-puzzle
    validate.js        // POST /api/validate
```

## Build Configuration

The app is configured with:
- **Framework**: Vite + React
- **Output**: Static files in `dist/`
- **SPA routing**: Handled by `public/_redirects`

## Troubleshooting

### Build fails
- Ensure Node.js version is 18+
- Check `package.json` dependencies are installed
- Review build logs in Cloudflare dashboard

### 404 errors on routes
- Verify `public/_redirects` file exists
- Check build output directory is set to `dist`

### Performance
- Cloudflare Pages automatically handles:
  - Global CDN distribution
  - HTTP/3 & QUIC
  - Automatic minification
  - Brotli compression
