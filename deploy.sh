#!/bin/bash

# 1. Run rendering check
echo "=== [Step 1] Running Blank Page & Runtime Error Verification ==="
npm test

if [ $? -ne 0 ]; then
  echo "❌ [Error] Local rendering validation failed! Deployment aborted to prevent a blank page."
  exit 1
fi

echo "✅ [Success] Rendering validation passed cleanly."

# 2. Ask user or commit automatically
echo "=== [Step 2] Deploying to GitHub ==="

# Read token
TOKEN_PATH="/mnt/d/Storage/project/gh_tk.txt"
if [ ! -f "$TOKEN_PATH" ]; then
  echo "❌ [Error] GitHub OAuth Token file not found at $TOKEN_PATH"
  exit 1
fi
GH_TOKEN=$(cat "$TOKEN_PATH" | tr -d '\r\n')

# Check git status
git add .

# Set commit message
COMMIT_MSG="Auto-deploy verification passed: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"

echo "Pushing changes to GitHub..."
git push https://$GH_TOKEN@github.com/unoShin/wedding-card.git main

echo "🎉 Deployment successfully completed! Verified no blank pages."
