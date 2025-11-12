# PowerShell script to zip the project, excluding node_modules, dist, .git, and .env files, but including empty folders.

$excludeDirs = @('node_modules', 'dist', '.git')
$excludeFiles = @('.env')

$source = Get-Location
$temp = Join-Path $env:TEMP "my-clever-crm-zip"
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }

# Copy all files/folders except excluded ones to temp
Get-ChildItem -Path $source -Recurse -Force | ForEach-Object {
    $relative = $_.FullName.Substring($source.Path.Length).TrimStart('\')
    $skip = $false

    foreach ($dir in $excludeDirs) {
        if ($relative -match "^(?:$dir\\|$dir$)") { $skip = $true }
    }
    if ($excludeFiles -contains $_.Name) { $skip = $true }

    if (-not $skip) {
        $dest = Join-Path $temp $relative
        if ($_.PSIsContainer) {
            if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }
        } else {
            $parent = Split-Path $dest
            if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent | Out-Null }
            Copy-Item $_.FullName $dest
        }
    }
}

Compress-Archive -Path "$temp\*" -DestinationPath "$source\my-clever-crm-upload.zip" -Force

Remove-Item $temp -Recurse -Force