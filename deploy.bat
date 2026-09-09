@echo off
echo ===================================================
echo Verifying and Pushing all updates to GitHub...
echo ===================================================
git add .
git commit -m "feat: complete project multi-media zero-cut playback and interchange"
git push origin main
echo.
echo ===================================================
echo Current Git Status:
echo ===================================================
git status
