# Local PowerShell Web Server for Crude Oil Dashboard
$port = 8080
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " REAL-TIME PREDICTIVE CRUDE OIL PRICE ANALYTICS DASHBOARD" -ForegroundColor Yellow
Write-Host " Server active at: $prefix" -ForegroundColor Green
Write-Host " Press Ctrl+C in terminal to stop server." -ForegroundColor Gray
Write-Host "=====================================================================" -ForegroundColor Cyan

# Open default browser
Start-Process $prefix

$mimeMap = @{
    ".html" = "text/html";
    ".css"  = "text/css";
    ".js"   = "application/javascript";
    ".json" = "application/json";
    ".png"  = "image/png";
    ".svg"  = "image/svg+xml"
}

$root = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }

        $filePath = Join-Path $root $path

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath)
            $contentType = $mimeMap[$ext]
            if (-not $contentType) { $contentType = "application/octet-stream" }

            $response.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    } catch {
        # Listener stopped or interrupted
        break
    }
}
