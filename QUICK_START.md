# Quick Start: Deploy VodTV to GitHub & Vercel

## Prerequisites
- GitHub account: https://github.com (username: `anttonioagst`)
- Vercel account (sign up at https://vercel.com)
- Git installed and configured locally

## Fast Track: 5 Minutes to Deployment

### Step 1: Create GitHub Repository (2 min)
```
1. Go to https://github.com/new
2. Repository name: vod-tv
3. Visibility: Public
4. Click "Create repository" (don't init with README)
```

### Step 2: Push Code to GitHub (2 min)
Run these commands in your project directory:
```bash
cd "D:\.ANTDEV\02 - PROJECTS\Websites\vod-tv"
git branch -M main
git remote add origin https://github.com/anttonioagst/vod-tv.git
git push -u origin main
```

When prompted for password, use a GitHub Personal Access Token:
- Create at: https://github.com/settings/tokens/new
- Select scopes: `repo`, `workflow`
- Use the token as password

### Step 3: Deploy to Vercel (1 min)
```
1. Go to https://vercel.com/new
2. Click "Continue with GitHub"
3. Select "vod-tv" repository
4. Keep all settings default
5. Click "Deploy"
```

Done! Your app will deploy automatically and get a URL like:
`https://vod-tv-{random}.vercel.app`

## After Deployment

### Configure Auto-Deploy
Future pushes to `main` branch will automatically deploy to Vercel.

### View Logs
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: https://github.com/anttonioagst/vod-tv/actions

### Add Custom Domain (Optional)
In Vercel project settings, add your custom domain under "Domains"

## Troubleshooting

**"Repository not found" on git push?**
- Verify repo exists at https://github.com/anttonioagst/vod-tv
- Check remote: `git remote -v`
- Token might have expired - create new one at https://github.com/settings/tokens

**"Build failed" on Vercel?**
- Check build logs in Vercel dashboard
- Run locally: `npm install && npm run build`
- Common issues: TypeScript errors, missing dependencies

**Images not loading?**
- Vercel Image Optimization should be automatic
- Check browser console for 404 errors
- Verify `next.config.ts` has correct remote patterns

## Git Commands Cheat Sheet

```bash
# Status
git status                          # See uncommitted changes
git log --oneline                   # View commit history

# Commit
git add .                           # Stage all changes
git commit -m "Your message"        # Create commit

# Push
git push origin main                # Push to GitHub
git push -u origin feature-branch   # New branch

# Pull
git pull origin main                # Get latest changes

# Branches
git branch -a                       # List all branches
git checkout -b new-feature         # Create & switch branch
```

## Project Info

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Data**: Mock data (no database needed)
- **Deploy**: Vercel (serverless)

## Important Files

- `DEPLOYMENT.md` - Detailed deployment guide
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind customization
- `.gitignore` - Files to exclude from git

## Next Steps

1. Push to GitHub
2. Deploy to Vercel
3. Test the live app
4. Share the URL!

See `DEPLOYMENT.md` for detailed instructions and troubleshooting.
