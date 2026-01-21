@echo off
echo ========================================
echo Probando Login del SUPERUSER
echo ========================================
echo.
echo Credenciales:
echo Email: superadmin@sistema.com
echo Password: SuperAdmin@2026
echo.
echo Enviando peticion...
echo.

curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"superadmin@sistema.com\",\"password\":\"SuperAdmin@2026\"}"

echo.
echo.
echo ========================================
echo Prueba completada
echo ========================================
pause
