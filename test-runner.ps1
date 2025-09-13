# PowerShell script to run tests
Set-Location "D:\Проекты\unit_calc"

# Check if npm exists
Write-Host "Checking npm availability..."
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "npm found, running tests..."
    npm run test:coverage
} else {
    Write-Host "npm not found, trying direct vitest..."
    if (Test-Path "node_modules\.bin\vitest.cmd") {
        .\node_modules\.bin\vitest.cmd run --coverage
    } else {
        Write-Host "vitest not found in node_modules"
    }
}
