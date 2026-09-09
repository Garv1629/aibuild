@echo off
echo Starting GitHub Commit and Deployment...
git add .
git commit -m "Update site showcase and config"
git push origin main
npm run deploy
echo Finished Deployment!
