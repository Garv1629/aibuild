$ErrorActionPreference = "Continue"

Write-Host "=== Step 1: Cleaning scratch files ==="
$scratch = @(
    "check_online.js",
    "check_online.py",
    "commit_msg.txt",
    "deploy.bat",
    "get_diff.js",
    "open_browser.js",
    "push_changes.cjs",
    "push_changes.py",
    "test_fetch.js",
    "head_projects.txt",
    "projects_git_history.txt",
    "sync_github.py"
)
foreach ($f in $scratch) {
    if (Test-Path $f) {
        Remove-Item $f -Force
        Write-Host "Removed $f"
    }
}

Write-Host "`n=== Step 2: Staging git files ==="
git add -A

Write-Host "`n=== Step 3: Committing changes ==="
git commit -m "feat: add continuous zero-cut multiple videos and images with media replacement in projects"

Write-Host "`n=== Step 4: Pushing to origin main ==="
git push origin main

Write-Host "`n=== Step 5: Deploying to gh-pages ==="
npx gh-pages -d dist

Write-Host "`n=== DONE ==="
