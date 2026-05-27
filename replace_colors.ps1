$dir = "c:\Users\32\Downloads\Peloille"

$replacements = @(
    @{ file = "src\components\Socials.tsx"; search = "primary-red"; replace = "primary-sage" },
    @{ file = "src\components\Projects.tsx"; search = "primary-red"; replace = "primary-sage" },
    @{ file = "src\app\project\page.tsx"; search = "primary-red"; replace = "primary-sage" },
    @{ file = "src\app\page.tsx"; search = "primary-red"; replace = "primary-sage" },
    @{ file = "src\app\page.tsx"; search = "#ff3131"; replace = "#606c38" },
    @{ file = "src\app\page.tsx"; search = "`"CAILLAT`""; replace = "`"Peloille`"" },
    @{ file = "src\app\page.tsx"; search = "`"Lucas`""; replace = "`"Galerie`"" },
    @{ file = "src\app\admin\page.tsx"; search = "primary-red"; replace = "primary-sage" },
    @{ file = "src\app\admin\page.tsx"; search = "#ff3131"; replace = "#606c38" },
    @{ file = "src\app\admin\login\page.tsx"; search = "primary-red"; replace = "primary-sage" },
    @{ file = "src\app\globals.css"; search = "primary-red"; replace = "primary-sage" },
    @{ file = "tailwind.config.ts"; search = "primary-red"; replace = "primary-sage" },
    @{ file = "tailwind.config.ts"; search = "#ff3131"; replace = "#606c38" }
)

foreach ($rep in $replacements) {
    $filePath = Join-Path -Path $dir -ChildPath $rep.file
    if (Test-Path $filePath) {
        (Get-Content $filePath -Raw) -replace $rep.search, $rep.replace | Set-Content $filePath -NoNewline
        Write-Host "Replaced in $($rep.file)"
    } else {
        Write-Host "File not found: $($rep.file)"
    }
}
