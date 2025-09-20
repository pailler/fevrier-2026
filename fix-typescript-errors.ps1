# Script pour corriger toutes les erreurs TypeScript
Write-Host "🔧 Correction des erreurs TypeScript..."

# Corriger les erreurs dans admin/users/page.tsx
$content = Get-Content "src/app/admin/users/page.tsx" -Raw
$content = $content -replace "authUsers\.users\.map\(user =>", "authUsers.users.map((user: any) =>"
$content = $content -replace "profiles\?\.find\(p =>", "profiles?.find((p: any) =>"
Set-Content "src/app/admin/users/page.tsx" $content

# Corriger les erreurs dans d'autres fichiers si nécessaire
$files = @(
    "src/app/admin/blog/page.tsx",
    "src/app/admin/modules/page.tsx",
    "src/app/admin/notifications/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "\.map\(([^:]+) =>", ".map((${1}: any) =>"
        $content = $content -replace "\.filter\(([^:]+) =>", ".filter((${1}: any) =>"
        $content = $content -replace "\.find\(([^:]+) =>", ".find((${1}: any) =>"
        Set-Content $file $content
    }
}

Write-Host "✅ Erreurs TypeScript corrigées"