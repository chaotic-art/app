#!/bin/bash

# Script to force update production branch from main branch
# This will:
# 1. Bump version (npm version major)
# 2. Push the new version to main
# 3. Reset production to match main exactly
# 4. Create GitHub release notes automatically

set -e  # Exit on any error

echo "🚀 Starting production deployment..."
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  Warning: GitHub CLI (gh) is not installed."
    echo "   Release notes will not be created automatically."
    echo "   Install it with: brew install gh"
    echo ""
    CREATE_RELEASE=false
else
    CREATE_RELEASE=true
fi

# Check if we have uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "❌ Error: You have uncommitted changes."
    echo "Please commit or stash your changes before deploying to production."
    git status -s
    exit 1
fi

# Fetch latest changes
echo "📥 Fetching latest changes from remote..."
git fetch origin

# Switch to main branch
echo "🔄 Switching to main branch..."
git checkout main

# Pull latest main
echo "⬇️  Pulling latest main..."
git pull origin main

# Bump version
echo ""
echo "📦 Current version:"
current_version=$(node -p "require('./package.json').version")
echo "   v$current_version"
echo ""
echo "⬆️  Bumping version (major)..."
npm version major -m "chore: bump version to %s for production release"

new_version=$(node -p "require('./package.json').version")
echo "   New version: v$new_version"
echo ""

# Push version bump to main
echo "⬆️  Pushing version bump to main..."
git push origin main --follow-tags

# Switch to production branch (create if doesn't exist)
echo "🔄 Switching to production branch..."
if git show-ref --verify --quiet refs/heads/production; then
    git checkout production
else
    echo "📝 Production branch doesn't exist, creating it..."
    git checkout -b production
fi

# Force reset production to match main
echo "⚠️  Force updating production to match main..."
git reset --hard main

# Force push to remote production
echo "⬆️  Force pushing to remote production..."
echo "⚠️  WARNING: This will overwrite remote production branch!"
read -p "Are you sure you want to continue? (yes/no): " confirmation

if [[ $confirmation != "yes" ]]; then
    echo "❌ Deployment cancelled."
    git checkout main
    exit 0
fi

git push origin production --force

echo ""
echo "✅ Successfully deployed to production!"
echo "   Production branch is now in sync with main branch."
echo ""
echo "📌 Current commit:"
git log -1 --oneline

# Create GitHub Release
if [[ $CREATE_RELEASE == true ]]; then
    echo ""
    echo "📝 Creating GitHub Release..."
    
    # Get the tag name
    tag_name="v$new_version"
    
    # Generate release notes automatically
    if gh release create "$tag_name" \
        --title "Release $tag_name" \
        --generate-notes \
        --target production; then
        echo "✅ GitHub Release created successfully!"
        echo "   View at: $(gh browse --no-browser --repo $(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/tag/$tag_name)"
    else
        echo "⚠️  Failed to create GitHub Release automatically."
        echo "   You can create it manually at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/new?tag=$tag_name"
    fi
else
    echo ""
    echo "⏭️  Skipping GitHub Release creation (gh CLI not installed)"
fi

# Switch back to main
git checkout main

echo ""
echo "🎉 Deployment complete!"

