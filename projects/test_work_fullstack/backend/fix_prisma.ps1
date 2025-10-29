# Скрипт для обхода проблем с Prisma генерацией
# Попробуем разные способы установки и генерации

Write-Host "=== Попытка генерации Prisma клиента ===" -ForegroundColor Cyan

$backendDir = $PSScriptRoot
$env:PRISMA_ENGINES_MIRROR = "https://binaries.prisma.sh"

# Вариант 1: Попробовать установить Prisma глобально
Write-Host "`n1. Пробую установить Prisma CLI глобально..." -ForegroundColor Yellow
try {
    npm install -g prisma@latest 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Prisma CLI установлен" -ForegroundColor Green
        $prismaCmd = "prisma"
    } else {
        throw "Ошибка установки"
    }
} catch {
    Write-Host "✗ Не удалось установить глобально, использую npx" -ForegroundColor Yellow
    $prismaCmd = "npx prisma"
}

# Вариант 2: Попробовать генерацию с разными настройками
Write-Host "`n2. Генерирую Prisma клиент..." -ForegroundColor Yellow

$attempts = 3
$success = $false

for ($i = 1; $i -le $attempts; $i++) {
    Write-Host "Попытка $i из $attempts..." -ForegroundColor Gray
    
    try {
        # Пробуем с явным указанием схемы
        $result = & cmd /c "$prismaCmd generate --schema=./prisma/schema.prisma" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Prisma клиент успешно сгенерирован!" -ForegroundColor Green
            $success = $true
            break
        } else {
            # Если ошибка сети - ждем и повторяем
            if ($result -match "ECONNRESET|aborted|network") {
                Write-Host "Ошибка сети, жду 5 секунд..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            } else {
                Write-Host "Ошибка: $result" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "Ошибка при генерации: $_" -ForegroundColor Red
    }
}

if (-not $success) {
    Write-Host "`n✗ Не удалось сгенерировать Prisma клиент автоматически" -ForegroundColor Red
    Write-Host "`nПопробуйте вручную:" -ForegroundColor Yellow
    Write-Host "1. Проверьте интернет соединение" -ForegroundColor White
    Write-Host "2. Если используете VPN/прокси - убедитесь что они работают" -ForegroundColor White
    Write-Host "3. Попробуйте запустить команду: $prismaCmd generate" -ForegroundColor White
    Write-Host "4. Или установите Prisma через другой способ" -ForegroundColor White
    exit 1
}

Write-Host "`n✓ Готово! Теперь можно применить миграции:" -ForegroundColor Green
Write-Host "  $prismaCmd migrate dev --name init" -ForegroundColor Cyan

