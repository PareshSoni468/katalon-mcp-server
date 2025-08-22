# Katalon MCP Server - Setup Script
# Project moved to: D:\Python Projects\Katalon_MCP_Server

Write-Host "Setting up Katalon MCP Server..." -ForegroundColor Green

# Navigate to project directory
Set-Location "D:\Python Projects\Katalon_MCP_Server"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the project
Write-Host "Building TypeScript project..." -ForegroundColor Yellow
npm run build

# Test the server
Write-Host "Testing server startup..." -ForegroundColor Yellow
Start-Job -ScriptBlock { 
    Set-Location "D:\Python Projects\Katalon_MCP_Server"
    npm start 
} -Name "KatalonMCPTest"

Start-Sleep -Seconds 3
Stop-Job -Name "KatalonMCPTest"
Remove-Job -Name "KatalonMCPTest"

Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open VS Code in the new directory: code 'D:\Python Projects\Katalon_MCP_Server'" -ForegroundColor White
Write-Host "2. Update your Claude Desktop config with the new path:" -ForegroundColor White
Write-Host "   'args': ['D:\\Python Projects\\Katalon_MCP_Server\\dist\\index.js']" -ForegroundColor Gray
Write-Host "3. Start the server with: npm start" -ForegroundColor White
