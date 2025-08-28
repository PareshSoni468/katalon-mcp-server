# Katalon MCP Server - Setup Script
# Dynamic setup script that works from any location

Write-Host "🚀 Setting up Katalon MCP Server..." -ForegroundColor Green

# Get the current script directory (where the project is located)
$ProjectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "📁 Project location: $ProjectPath" -ForegroundColor Blue

# Navigate to project directory
Set-Location $ProjectPath

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the project
Write-Host "Building TypeScript project..." -ForegroundColor Yellow
npm run build

# Test the server
Write-Host "🧪 Testing server startup..." -ForegroundColor Yellow
Start-Job -ScriptBlock { 
    Set-Location $using:ProjectPath
    npm start 
} -Name "KatalonMCPTest"

Start-Sleep -Seconds 3
Stop-Job -Name "KatalonMCPTest"
Remove-Job -Name "KatalonMCPTest"

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add this configuration to your Claude Desktop config file:" -ForegroundColor Gray
Write-Host ""
Write-Host "Claude Desktop Config Location:" -ForegroundColor Yellow
Write-Host "   Windows: %APPDATA%\Claude\claude_desktop_config.json" -ForegroundColor Gray
Write-Host ""
Write-Host "Configuration to add:" -ForegroundColor Cyan
Write-Host @"
{
  "mcpServers": {
    "katalon-mcp-server": {
      "command": "node",
      "args": ["$ProjectPath\dist\index.js"],
      "cwd": "$ProjectPath"
    }
  }
}
"@ -ForegroundColor White
Write-Host "1. Open VS Code in the new directory: code 'D:\Python Projects\Katalon_MCP_Server'" -ForegroundColor White
Write-Host "2. Update your Claude Desktop config with the new path:" -ForegroundColor White
Write-Host "   'args': ['D:\\Python Projects\\Katalon_MCP_Server\\dist\\index.js']" -ForegroundColor Gray
Write-Host "3. Start the server with: npm start" -ForegroundColor White
