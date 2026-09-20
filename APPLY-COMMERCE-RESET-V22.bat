@echo off
setlocal
cd /d "%~dp0"
if exist "COMMERCE-STOREFRONT-V21.md" del /q "COMMERCE-STOREFRONT-V21.md"
if exist "scripts\check-commerce-storefront-v21.mjs" del /q "scripts\check-commerce-storefront-v21.mjs"
echo Removed V21 presentation-only files.
echo Now run: node scripts\check-commerce-reset-v22.mjs
endlocal
