# Cleanup script for Windows
# Run this if you encounter lockfile or port issues

Write-Host "Cleaning up..." -ForegroundColor Yellow

# Kill processes on port 3000
Write-Host "Killing processes on port 3000..." -ForegroundColor Cyan
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess | 
    ForEach-Object { 
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue 
    }

# Kill Node processes in this directory
Write-Host "Killing Node processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | 
    Stop-Process -Force -ErrorAction SilentlyContinue

# Remove .next folder and lock files
Write-Host "Removing .next folder and lock files..." -ForegroundColor Cyan
if (Test-Path ".next") {
    # Try to remove lock files first
    Get-ChildItem -Path ".next" -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | 
        Remove-Item -Force -ErrorAction SilentlyContinue
    # Remove entire .next folder
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}
# Remove any other lock files in root
Get-ChildItem -Path . -Filter "*.lock" -ErrorAction SilentlyContinue | 
    Remove-Item -Force -ErrorAction SilentlyContinue

# Remove node_modules/.cache if it exists
Write-Host "Removing cache..." -ForegroundColor Cyan
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

# Wait for file locks to release
Write-Host "Waiting for file locks to release..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "You can now run: npm run dev" -ForegroundColor Green

