#!/bin/bash
# Deploy script for Shiv Security website

echo "🚀 Deploying Shiv Security website..."

# Add all changes
git add .

# Commit with timestamp
git commit -m "Update website - $(date)"

# Push to GitHub
git push origin main

echo "✅ Deployment complete!"
echo "🌐 Website will be live at: https://shivservices.com"
echo "⏰ GitHub Pages typically takes 2-5 minutes to update"