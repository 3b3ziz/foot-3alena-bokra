# Cloudflare Pages Deployment Guide

## Prerequisites
- A Cloudflare account
- Git repository connected to Cloudflare Pages

## Deployment Steps

### Option 1: Automatic Deployment via Git

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial Career Ladder MVP"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to Pages
   - Click "Create a project"
   - Connect your GitHub repository

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 18 or higher

4. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy your app
   - You'll get a URL like: `career-ladder-xxx.pages.dev`

### Option 2: Direct Upload via Wrangler CLI

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

Currently, the app runs entirely client-side with no environment variables needed.

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
