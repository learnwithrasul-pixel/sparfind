@echo off
chcp 65001 >nul
cd /d "%~dp0"
title SPARFIND yayinla

echo.
echo   ============================================
echo     SPARFIND - urunleri siteye yukluyorum
echo   ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   HATA: node bulunamadi. Node.js kurulu olmali.
  echo.
  pause
  exit /b 1
)

node tools\build-deals.js
if errorlevel 1 (
  echo   Hicbir sey degismedi. Yukaridaki hatalari duzelt.
  echo.
  pause
  exit /b 1
)

git diff --quiet && git diff --cached --quiet
if not errorlevel 1 (
  echo   Degisiklik yok - yayina gonderilecek bir sey bulunmadi.
  echo.
  pause
  exit /b 0
)

set "GIT_SSH_COMMAND=ssh -i %USERPROFILE%/.ssh/sparfind_github -o IdentitiesOnly=yes"

git add -A
git -c user.name="Rasul Ahmadov" -c user.email="learnwithrasul@gmail.com" commit -q -m "Produkte aktualisiert"
if errorlevel 1 (
  echo   HATA: commit basarisiz.
  echo.
  pause
  exit /b 1
)

echo   Gonderiliyor...
git push -q origin main
if errorlevel 1 (
  echo.
  echo   HATA: push basarisiz. Internet var mi? Anahtar yerinde mi?
  echo.
  pause
  exit /b 1
)

echo.
echo   TAMAM. Site guncellendi:  https://sparfind.de
echo   ^(GitHub'in yayina almasi 1-2 dakika surer^)
echo.
pause
