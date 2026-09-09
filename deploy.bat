@echo off
echo ========================================================
echo Pushing changes to GitHub repository (origin main)...
echo ========================================================

git add .
git commit -m "feat: enable continuous zero-cut multiple videos and images with media replacement in projects"
git push origin main

echo ========================================================
echo Deploying to GitHub Pages...
echo ========================================================
npm run deploy

echo ========================================================
echo Deployment completed successfully!
echo ========================================================
