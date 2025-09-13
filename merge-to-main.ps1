# Merge script to merge current branch into main
$ErrorActionPreference = "Stop"

Write-Host "Checking current branch..."
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch"

Write-Host "Checking git status..."
$status = git status --porcelain
if ($status) {
    Write-Host "Uncommitted changes found. Committing them..."
    git add .
    git commit -m "Update package-lock.json and other changes before merge"
} else {
    Write-Host "No uncommitted changes found."
}

Write-Host "Switching to main branch..."
git checkout main

Write-Host "Pulling latest changes from main..."
git pull origin main

Write-Host "Merging $currentBranch into main..."
git merge $currentBranch --no-ff -m "Merge $currentBranch into main"

Write-Host "Pushing changes to remote main..."
git push origin main

Write-Host "Merge completed successfully!"
Write-Host "You can now delete the feature branch if needed:"
Write-Host "git branch -d $currentBranch"
