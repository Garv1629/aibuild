import os
import re
import subprocess
import sys

cwd = r"E:\jack----3d-creator"
os.chdir(cwd)

print("--- Step 1: Cleaning stale build assets in docs/assets ---")
res_build = subprocess.run(["npm", "run", "build"], shell=True, text=True)
if res_build.returncode != 0:
    print("Build failed!")
    sys.exit(1)

# Find active assets referenced in docs/index.html
with open("docs/index.html", "r", encoding="utf-8") as f:
    docs_html = f.read()

active_assets = set(re.findall(r"assets/[a-zA-Z0-9_\-\.]+", docs_html))
active_filenames = {os.path.basename(a) for a in active_assets}
print(f"Active assets in docs/index.html: {active_filenames}")

docs_assets_dir = os.path.join(cwd, "docs", "assets")
if os.path.exists(docs_assets_dir):
    for fname in os.listdir(docs_assets_dir):
        if fname not in active_filenames and (fname.endswith(".js") or fname.endswith(".css")):
            print(f"Removing obsolete asset: {fname}")
            try:
                os.remove(os.path.join(docs_assets_dir, fname))
            except Exception as e:
                print(f"Could not remove {fname}: {e}")

# Remove scratch files that shouldn't be committed
scratch_files = [
    "check_online.js",
    "check_online.py",
    "commit_msg.txt",
    "deploy.bat",
    "get_diff.js",
    "open_browser.js",
    "push_changes.cjs",
    "push_changes.py",
    "test_fetch.js",
]
for sf in scratch_files:
    if os.path.exists(sf):
        try:
            os.remove(sf)
            print(f"Removed scratch file: {sf}")
        except Exception as e:
            pass

print("\n--- Step 2: Git status ---")
subprocess.run(["git", "status", "--short"], shell=True)

print("\n--- Step 3: Git add all ---")
subprocess.run(["git", "add", "."], shell=True)

print("\n--- Step 4: Git commit ---")
commit_msg = "feat: add continuous zero-cut multi-media playback with video & image interchanging in projects"
subprocess.run(["git", "commit", "-m", commit_msg], shell=True)

print("\n--- Step 5: Git push origin main ---")
push_res = subprocess.run(["git", "push", "origin", "main"], shell=True, capture_output=True, text=True)
print("STDOUT:", push_res.stdout)
print("STDERR:", push_res.stderr)

print("\n--- Step 6: Deploy to GitHub Pages (gh-pages branch) ---")
deploy_res = subprocess.run(["npx", "gh-pages", "-d", "dist"], shell=True, capture_output=True, text=True)
print("DEPLOY STDOUT:", deploy_res.stdout)
print("DEPLOY STDERR:", deploy_res.stderr)

print("\n--- Step 7: Git log ---")
subprocess.run(["git", "log", "-n", "3", "--oneline"], shell=True)
