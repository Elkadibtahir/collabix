$targetDirs = @(
    "C:\Users\SURFACE\Desktop\collabix\backend\src\main\java\com\trio\backend\dto",
    "C:\Users\SURFACE\Desktop\collabix\backend\src\main\java\com\trio\backend\controller",
    "C:\Users\SURFACE\Desktop\collabix\backend\src\main\java\com\trio\backend\service",
    "C:\Users\SURFACE\Desktop\collabix\backend\src\main\java\com\trio\backend\repository"
)

$results = @()

$replacements = @(
    # == Core verb patterns (these are the most important remaining) ==
    @{ Search = 'R�cup�re toutes'; Replace = 'Retrieves all' }
    @{ Search = 'R�cup�re tous'; Replace = 'Retrieves all' }
    @{ Search = 'R�cup�re les'; Replace = 'Retrieves the' }
    @{ Search = 'R�cup�re un'; Replace = 'Retrieves a' }
    @{ Search = 'R�cup�re une'; Replace = 'Retrieves a' }
    @{ Search = 'R�cup�re le'; Replace = 'Retrieves the' }
    @{ Search = 'R�cup�re la'; Replace = 'Retrieves the' }
    @{ Search = 'R�cup�re l'; Replace = 'Retrieves the ' }
    @{ Search = 'R�cup�re des'; Replace = 'Retrieves' }
    @{ Search = 'Compte les'; Replace = 'Counts the' }
    @{ Search = 'Permet de'; Replace = 'Allows to' }
    @{ Search = '- Cr�er un'; Replace = '- Create a' }
    @{ Search = '- Cr�er'; Replace = '- Create' }
    @{ Search = '- R�cup�rer un'; Replace = '- Retrieve a' }
    @{ Search = '- R�cup�rer la'; Replace = '- Retrieve the' }
    @{ Search = '- R�cup�rer'; Replace = '- Retrieve' }
    @{ Search = '- Lister les'; Replace = '- List the' }
    @{ Search = '- Mettre � jour les'; Replace = '- Update the' }
    @{ Search = '- Mettre � jour un'; Replace = '- Update a' }
    @{ Search = '- Mettre � jour'; Replace = '- Update' }
    @{ Search = '- Supprimer'; Replace = '- Delete' }
)

Write-Host "Processing remaining French Javadoc..."

foreach ($dir in $targetDirs) {
    if (-not (Test-Path -LiteralPath $dir)) { continue }

    $files = Get-ChildItem -Path $dir -Recurse -Filter "*.java"

    foreach ($file in $files) {
        $content = Get-Content -LiteralPath $file.FullName -Raw
        $originalContent = $content
        $changeCount = 0

        foreach ($repl in $replacements) {
            $pattern = $repl.Search
            $replacement = $repl.Replace
            $escaped = [regex]::Escape($pattern)

            if ($content -match $escaped) {
                $newContent = $content -replace $escaped, $replacement
                $changes = [regex]::Matches($content, $escaped).Count
                $changeCount += $changes
                $content = $newContent
            }
        }

        if ($changeCount -gt 0) {
            Set-Content -LiteralPath $file.FullName -Value $content -NoNewline -Encoding UTF8
            $relativePath = $file.FullName.Replace("C:\Users\SURFACE\Desktop\collabix\backend\src\main\java\com\trio\backend\", "")
            $results += "$relativePath : $changeCount change(s)"
            Write-Host "  Modified: $relativePath (+$changeCount changes)"
        }
    }
}

Write-Host "`n=== SUMMARY ==="
$totalChanges = 0
foreach ($r in $results) {
    Write-Host "  $r"
    $parts = $r -split " : "
    $totalChanges += [int]($parts[1] -split " ")[0]
}
Write-Host "Total additional changes: $totalChanges"
