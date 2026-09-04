@echo off
echo Starting GitHub Commit and Deployment...
git add .
git commit -m "Update What We Do section and site config"
git push origin main
npm run deploy
echo Finished Deployment!
