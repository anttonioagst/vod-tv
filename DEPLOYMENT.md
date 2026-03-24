# VodTV Deployment Guide

## Project Setup Status

Git repository has been initialized locally with the initial commit.

**Git Status:**
- Repository initialized at: `D:\.ANTDEV\02 - PROJECTS\Websites\vod-tv`
- Initial commit: `00061f2` - VodTV Next.js 16 project
- All project files staged and committed
- Remote: Not yet configured

## Next Steps: GitHub & Vercel Deployment

### Option 1: Deploy via GitHub Web Interface (Recommended for beginners)

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `vod-tv`
   - Description: `VodTV - Next.js 16 streaming platform`
   - Visibility: Public (or Private if you prefer)
   - Do NOT initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push Local Repository to GitHub**
   Open Git Bash or terminal in your project directory and run:
   ```bash
   cd "D:\.ANTDEV\02 - PROJECTS\Websites\vod-tv"
   git branch -M main
   git remote add origin https://github.com/anttonioagst/vod-tv.git
   git push -u origin main
   ```

   When prompted for credentials:
   - Username: `anttonioagst`
   - Password: Use a GitHub Personal Access Token (not your password)
     - Create one at: https://github.com/settings/tokens
     - Select scopes: `repo`, `workflow`
     - Save the token somewhere safe

3. **Deploy to Vercel via GitHub Integration**
   - Go to https://vercel.com/new
   - Click "Continue with GitHub"
   - Authorize Vercel to access your GitHub repositories
   - Select the `vod-tv` repository
   - Framework: Next.js (should auto-detect)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - No environment variables needed (uses mock data)
   - Click "Deploy"

### Option 2: Deploy via Command Line (Advanced)

1. **Push to GitHub using Git**
   ```bash
   cd "D:\.ANTDEV\02 - PROJECTS\Websites\vod-tv"
   git branch -M main
   git remote add origin https://github.com/anttonioagst/vod-tv.git
   git push -u origin main
   ```

2. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**
   ```bash
   cd "D:\.ANTDEV\02 - PROJECTS\Websites\vod-tv"
   vercel --prod
   ```

   Follow the interactive prompts:
   - Link to existing project or create new? → Create new
   - Name: `vod-tv`
   - Directory: ./
   - Framework: Next.js
   - Build settings: Default

### Option 3: Vercel Git Integration (Recommended for CI/CD)

1. Create the GitHub repo first (steps 1-2 from Option 1)

2. In Vercel Dashboard:
   - https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Select the GitHub repo `vod-tv`
   - Configure build settings (defaults are fine)
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

## Project Configuration

### Next.js Config
- Framework: Next.js 16 (App Router)
- TypeScript enabled
- Tailwind CSS configured
- Remote image support enabled (picsum.photos)

### Build & Deployment Requirements
- Node.js: 18+ (Vercel default)
- npm or yarn (npm used in this project)
- No environment variables required (uses mock data)
- No database required

### Post-Deployment Checklist

After deployment, verify:
- Homepage loads at `/`
- Navigation works (sidebar, header)
- Images load correctly
- No console errors in browser dev tools
- Responsive design works on mobile

## Key Files

- **`package.json`** - Dependencies and scripts
- **`next.config.ts`** - Next.js configuration with image optimization
- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration with custom design tokens
- **`app/`** - App Router pages and routes
- **`components/`** - Reusable React components
- **`styles/`** - Global styles and design tokens

## Troubleshooting

### Build fails on Vercel

Common issues:
1. **TypeScript errors** - Check `tsconfig.json` and build locally: `npm run build`
2. **Missing dependencies** - Verify all packages in `package.json` are correct
3. **Node version mismatch** - Vercel uses Node 18+ by default

### Deployment won't start

- Ensure GitHub repo push was successful: `git push -u origin main`
- Verify repository is public or Vercel has access
- Check Vercel project settings in dashboard

### Images not loading

- Vercel Image Optimization should work automatically
- Check network tab in browser dev tools
- Verify `next.config.ts` remote patterns are correct

## Environment Variables (if needed in future)

To add environment variables in Vercel:
1. Go to Vercel Project Settings → Environment Variables
2. Add variables in format: `KEY=VALUE`
3. Redeploy after adding variables

Currently, this project uses mock data and doesn't require any environment variables.

## Contact & Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- GitHub Documentation: https://docs.github.com
