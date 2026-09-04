import subprocess
import os

cwd = r"E:\jack----3d-creator"
print(f"Working in {cwd}")
os.chdir(cwd)

print("1. Adding all changes...")
subprocess.run(["git", "add", "."], check=False)

print("2. Committing changes...")
res = subprocess.run(["git", "commit", "-m", "Enhance What We Do manager and fix base config"], capture_output=True, text=True)
print(res.stdout or res.stderr)

print("3. Pushing main branch to GitHub...")
push_res = subprocess.run(["git", "push", "origin", "main"], capture_output=True, text=True)
print(push_res.stdout or push_res.stderr)

print("4. Building & Deploying to GitHub Pages...")
deploy_res = subprocess.run(["npx", "gh-pages", "-d", "dist"], capture_output=True, text=True)
print(deploy_res.stdout or deploy_res.stderr)

print("--- DEPLOYMENT FINISHED ---")
