$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 24 LTS, lalu buka ulang PowerShell.' }
$nodeMajor = [int]((& node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 24) { throw 'Proyek membutuhkan Node.js 24 atau lebih baru.' }
if (-not (Test-Path 'apps/web/.env.local')) {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    $adminKey = [Convert]::ToBase64String($bytes)
    [System.IO.File]::WriteAllText((Join-Path $PWD 'apps/web/.env.local'), "ADMIN_KEY=$adminKey`n", (New-Object System.Text.UTF8Encoding($false)))
    Write-Host 'Kunci administrator dibuat di apps/web/.env.local. Jangan bagikan file ini.'
}
$env:WORLD_DATA_DIR = Join-Path $PWD 'data'
Write-Host 'Mengunduh dependency. Jika jaringan gagal, skrip akan berhenti.'
& npm.cmd install --fetch-retries=0 --fetch-timeout=30000
if ($LASTEXITCODE -ne 0) { throw 'Instalasi gagal. Simpan pesan error untuk diperiksa; aplikasi belum dijalankan.' }
& npm.cmd test
if ($LASTEXITCODE -ne 0) { throw 'Pengujian gagal.' }
& npm.cmd run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Typecheck gagal. Perlu diperbaiki sebelum melanjutkan.' }
& npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Build gagal. Perlu diperbaiki sebelum melanjutkan.' }
Write-Host 'Buka http://localhost:3000. Kunci admin tersedia di apps/web/.env.local.'
& npm.cmd start
