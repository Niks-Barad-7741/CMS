# Run-Backend.ps1 — Bypasses Windows Smart App Control by bundling into a single exe
Write-Host "Building and running backend (single-file mode)..." -ForegroundColor Cyan

$projectDir = "Dynamic_CMS.API\Dynamic_CMS.API"
$publishDir = "$projectDir\bin\publish"

dotnet publish "$projectDir\Dynamic_CMS.API.csproj" `
    -c Debug `
    -r win-x64 `
    --self-contained false `
    /p:PublishSingleFile=true `
    /p:IncludeNativeLibrariesForSelfExtract=true `
    -o $publishDir

if ($LASTEXITCODE -eq 0) {
    # Copy Keys folder to publish dir (not included by default)
    if (Test-Path "$projectDir\Keys") {
        New-Item -ItemType Directory -Force "$publishDir\Keys" | Out-Null
        Copy-Item "$projectDir\Keys\*" "$publishDir\Keys\" -Force
    }

    Write-Host "`nStarting backend server..." -ForegroundColor Green
    Push-Location $publishDir
    try {
        .\Dynamic_CMS.API.exe
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
}
