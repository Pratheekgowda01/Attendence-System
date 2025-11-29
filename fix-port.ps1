# Fix Port 5000 or 3000 - Kill processes using these ports

param(
    [int]$Port = 5000
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  🔧 Port $Port Fixer" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Finding process using port $Port..." -ForegroundColor Yellow

try {
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
    $processId = $connection.OwningProcess | Select-Object -First 1 -Unique
    
    if ($processId) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "`n✓ Found process:" -ForegroundColor Green
            Write-Host "  PID: $($process.Id)" -ForegroundColor White
            Write-Host "  Name: $($process.ProcessName)" -ForegroundColor White
            Write-Host "  Path: $($process.Path)" -ForegroundColor Gray
            
            Write-Host "`nKilling process..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction Stop
            Write-Host "✓ Process killed successfully!`n" -ForegroundColor Green
            Write-Host "Port $Port is now free. You can start the server.`n" -ForegroundColor Green
        } else {
            Write-Host "⚠ Process found but couldn't get details. Trying to kill anyway..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction Stop
            Write-Host "✓ Process killed!`n" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ Could not determine process ID." -ForegroundColor Yellow
    }
} catch {
    $errorMsg = $_.Exception.Message
    if ($errorMsg -like "*Cannot find a process*" -or $errorMsg -like "*No matching*") {
        Write-Host "✓ Port $Port is already free! No process using it.`n" -ForegroundColor Green
    } else {
        Write-Host "⚠ Error: $errorMsg" -ForegroundColor Red
        Write-Host "`nTrying alternative method..." -ForegroundColor Yellow
        
        # Alternative method using netstat
        $netstatOutput = netstat -ano | findstr ":$Port"
        if ($netstatOutput) {
            Write-Host "Found connections:" -ForegroundColor Cyan
            Write-Host $netstatOutput -ForegroundColor Gray
            
            $pids = $netstatOutput | ForEach-Object {
                if ($_ -match "\s+(\d+)$") {
                    $matches[1]
                }
            } | Select-Object -Unique
            
            foreach ($pid in $pids) {
                Write-Host "`nKilling process $pid..." -ForegroundColor Yellow
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "✓ Process $pid killed!" -ForegroundColor Green
                } catch {
                    Write-Host "⚠ Could not kill process $pid: $_" -ForegroundColor Yellow
                }
            }
            Write-Host "`nPort $Port should now be free.`n" -ForegroundColor Green
        } else {
            Write-Host "✓ Port $Port appears to be free.`n" -ForegroundColor Green
        }
    }
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

