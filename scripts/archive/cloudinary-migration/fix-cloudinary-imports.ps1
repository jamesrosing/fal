# PowerShell script to fix import syntax errors in all TypeScript/JavaScript files

# Search for files with the nested import syntax error in the components directory
Get-ChildItem -Path "components" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content -Path $filePath -Raw
    
    # Pattern 1: Fix nested imports for CldImage and CldVideo
    if ($content -match "import\s*\{\s*\r?\n\s*import\s+\{\s*CldImage\s*\}\s*from\s*[`'`"][^`'`"]*[`'`"];\s*\r?\n\s*import\s+\{\s*CldVideo\s*\}\s*from") {
        Write-Host "Fixing nested imports in $filePath"
        
        # Replace the nested import pattern with just the opening of the import statement
        $content = $content -replace "import\s*\{\s*\r?\n\s*import\s+\{\s*CldImage\s*\}\s*from\s*[`'`"][^`'`"]*[`'`"];\s*\r?\n\s*import\s+\{\s*CldVideo\s*\}\s*from\s*[`'`"][^`'`"]*[`'`"];\s*\r?\n", "import {"
        
        # Write the fixed content back to the file
        Set-Content -Path $filePath -Value $content
        
        Write-Host "Fixed nested imports in $filePath"
    }
    
    # Pattern 2: Fix other nested imports with just nested import
    if ($content -match "import\s*\{\s*\r?\n\s*import\s+") {
        Write-Host "Fixing general nested imports in $filePath"
        
        # Replace any nested import pattern with just the opening of the import statement
        $content = $content -replace "import\s*\{\s*\r?\n\s*import\s+[^}]*\}\s*from\s*[`'`"][^`'`"]*[`'`"];\s*\r?\n", "import {"
        
        # Write the fixed content back to the file
        Set-Content -Path $filePath -Value $content
        
        Write-Host "Fixed general nested imports in $filePath"
    }
    
    # Pattern 3: Fix imported but unused CldImage and CldVideo
    if ($content -match "import\s+\{\s*CldImage\s*\}\s*from\s*[`'`"]@/components/media/CldImage[`'`"];\s*\r?\n\s*import\s+\{\s*CldVideo\s*\}\s*from\s*[`'`"]@/components/media/CldVideo[`'`"];" -and $content -notmatch "<CldImage") {
        Write-Host "Removing unused CldImage and CldVideo imports in $filePath"
        
        # Remove the unused imports completely
        $content = $content -replace "import\s+\{\s*CldImage\s*\}\s*from\s*[`'`"]@/components/media/CldImage[`'`"];\s*\r?\n\s*import\s+\{\s*CldVideo\s*\}\s*from\s*[`'`"]@/components/media/CldVideo[`'`"];", ""
        
        # Write the fixed content back to the file
        Set-Content -Path $filePath -Value $content
        
        Write-Host "Removed unused imports in $filePath"
    }
}

Write-Host "Import error fixes complete!" 