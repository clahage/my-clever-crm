# Script to remove all sample/fake data from source files
# Run with: powershell -ExecutionPolicy Bypass -File fix-sample-data.ps1

$ErrorActionPreference = "Stop"
$filesModified = 0
$replacements = 0

# Define patterns to replace (exact match regex patterns)
$patterns = @{
    # Fake Names
    "'John Smith'" = "'[Real Data Loaded]'"
    '"John Smith"' = '"[Real Data Loaded]"'
    "'Jane Smith'" = "'[Real Data Loaded]'"
    '"Jane Smith"' = '"[Real Data Loaded]"'
    "'John Doe'" = "'[Real Data Loaded]'"
    '"John Doe"' = '"[Real Data Loaded]"'
    "'Jane Doe'" = "'[Real Data Loaded]'"
    '"Jane Doe"' = '"[Real Data Loaded]"'
    "'Sarah Johnson'" = "'[Real Data Loaded]'"
    '"Sarah Johnson"' = '"[Real Data Loaded]"'
    "'Michael Brown'" = "'[Real Data Loaded]'"
    '"Michael Brown"' = '"[Real Data Loaded]"'
    "'Emily Davis'" = "'[Real Data Loaded]'"
    '"Emily Davis"' = '"[Real Data Loaded]"'
    
    # Fake phones
    "'555-" = "'[Phone]"
    '"555-' = '"[Phone]'
    "555-0" = "[Phone]"
    
    # Fake emails
    "test@test.com" = "[email protected]"
    "@example.com" = "@company.com"
    "john@example" = "user@company"
    "jane@example" = "user@company"
}

Write-Host "🔧 Starting sample data cleanup..." -ForegroundColor Cyan
Write-Host ""

# Get all JSX and JS files in src/
$files = Get-ChildItem -Path "src" -Include "*.jsx","*.js" -Recurse -ErrorAction SilentlyContinue

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    
    foreach ($pattern in $patterns.Keys) {
        $replacement = $patterns[$pattern]
        if ($content -match [regex]::Escape($pattern)) {
            $content = $content -replace [regex]::Escape($pattern), $replacement
            $fileChanged = $true
            $replacements++
        }
    }
    
    if ($fileChanged) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesModified++
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        Write-Host "  ✓ Fixed: $relativePath" -ForegroundColor Green
    }
}

Write-Host ""

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "   Files modified: $filesModified" -ForegroundColor Yellow
Write-Host "   Replacements made: $replacements" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  NOTE: Some fake data may require manual review" -ForegroundColor Yellow
Write-Host "   Check generated data in mock functions and sample arrays" -ForegroundColor Gray
