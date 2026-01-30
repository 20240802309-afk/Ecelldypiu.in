# Deployment Guide for E-Cell DYPIUI Website

## Quick Deployment Steps

### 1. Prepare Your Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: E-Cell DYPIUI website"

# Create main branch
git branch -M main
```

### 2. Push to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/dypiui-ecell.git

# Push to GitHub
git push -u origin main
```

### 3. Deploy on Vercel

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com)
2. **Sign Up/Login**: Use your GitHub account
3. **New Project**: Click "New Project" button
4. **Import Repository**: Select your `dypiui-ecell` repository
5. **Configure Project**:
   - Framework Preset: Vite
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
6. **Deploy**: Click "Deploy" button

### 4. Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables

If you need environment variables:

1. In Vercel dashboard, go to Settings → Environment Variables
2. Add your variables (e.g., API keys, contact emails)
3. Redeploy the project

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- No manual intervention needed

## Build Optimization

The website is already optimized for production:
- ✅ Code splitting
- ✅ Asset optimization
- ✅ CSS minification
- ✅ Tree shaking
- ✅ Gzip compression

## Performance Tips

1. **Images**: Add actual images to `/public` folder
2. **SEO**: Update meta tags in `index.html`
3. **Analytics**: Add Google Analytics if needed
4. **Monitoring**: Set up Vercel Analytics

## Troubleshooting

### Build Fails
- Check console for errors
- Ensure all dependencies are installed
- Verify import paths are correct

### Routing Issues
- `vercel.json` is configured for SPA routing
- All routes redirect to `index.html`

### Performance Issues
- Use WebP images
- Implement lazy loading for images
- Consider code splitting for large components

## Support

For deployment issues:
- Check Vercel documentation
- Review build logs in Vercel dashboard
- Contact Vercel support if needed

---

**Your E-Cell DYPIUI website will be live in minutes! 🚀**