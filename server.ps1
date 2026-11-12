param([int]$Port = 4174)

$ErrorActionPreference = "Stop"
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "DirectGas demo running at http://localhost:$Port"

$mimeTypes = @{
  ".css" = "text/css; charset=utf-8"
  ".html" = "text/html; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".jpg" = "image/jpeg"
  ".json" = "application/json; charset=utf-8"
  ".svg" = "image/svg+xml"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $response = $context.Response
    try {
      $relativePath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart("/")
      if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = "index.html"
      }
      $candidate = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))
      $rootPrefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
      $insideRoot = $candidate.Equals($root, [System.StringComparison]::OrdinalIgnoreCase) -or $candidate.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)
      if (-not $insideRoot -or -not [System.IO.File]::Exists($candidate)) {
        $candidate = Join-Path $root "index.html"
      }

      $bytes = [System.IO.File]::ReadAllBytes($candidate)
      $extension = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
      $contentType = $mimeTypes[$extension]
      if (-not $contentType) {
        $contentType = "application/octet-stream"
      }
      $response.StatusCode = 200
      $response.ContentType = $contentType
      $response.Headers.Add("Cache-Control", "no-store")
      $response.Headers.Add("X-Content-Type-Options", "nosniff")
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    catch {
      Write-Warning "Request failed: $($_.Exception.Message)"
      $body = [System.Text.Encoding]::UTF8.GetBytes("Unable to load the DirectGas demo.")
      $response.StatusCode = 500
      $response.ContentType = "text/plain; charset=utf-8"
      $response.ContentLength64 = $body.Length
      $response.OutputStream.Write($body, 0, $body.Length)
    }
    finally {
      $response.Close()
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
