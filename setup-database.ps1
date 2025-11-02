# Database Setup Script for Windows
Write-Host "=== Database Setup for Unified Inbox ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envContent = @"
# Database Connection
# Replace with your actual PostgreSQL connection string
# Format: postgresql://username:password@host:port/database?schema=public
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unify?schema=public"

# Better Auth Configuration
BETTER_AUTH_SECRET="KM6E5I32MuWP9d4oSQ9Mkd1J7ixndWUb2SJsX/YW+IQ="
BETTER_AUTH_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Google OAuth (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
"@
    Set-Content -Path ".env" -Value $envContent
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file and update DATABASE_URL with your PostgreSQL credentials!" -ForegroundColor Yellow
    Write-Host ""
}

# Check if DATABASE_URL is set
$envContent = Get-Content ".env" -Raw
if ($envContent -match 'DATABASE_URL="postgresql://') {
    Write-Host "✓ DATABASE_URL found in .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  DATABASE_URL not properly configured in .env" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure PostgreSQL is running"
Write-Host "2. Update DATABASE_URL in .env with your actual database connection"
Write-Host "3. Create the database (if it doesn't exist):"
Write-Host "   CREATE DATABASE unify;"
Write-Host "4. Run: npm run db:push"
Write-Host ""

