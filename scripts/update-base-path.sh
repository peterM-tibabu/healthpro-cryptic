#!/bin/bash

# Script to update the base path in vite.config.ts for GitHub Pages deployment

echo "🔧 Update GitHub Pages Base Path"
echo ""
echo "Current base path: /cryption/"
echo ""
read -p "Enter your repository name (e.g., 'my-app'): " repo_name

if [ -z "$repo_name" ]; then
    echo "❌ Repository name cannot be empty"
    exit 1
fi

# Update vite.config.ts
sed -i "s|base: '/cryption/'|base: '/$repo_name/'|g" vite.config.ts

echo "✅ Updated base path to: /$repo_name/"
echo ""
echo "Your app will be available at: https://username.github.io/$repo_name/"

