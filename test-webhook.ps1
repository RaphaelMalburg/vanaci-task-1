# Script simples para testar o webhook do n8n
param(
    [string]$WebhookUrl = "https://rcmalburg.app.n8n.cloud/webhook-test/chat-ai",
    [string]$BearerToken = "vanaci-token-super-seguro"
)

Write-Host "=== Teste do Webhook n8n ===" -ForegroundColor Cyan
Write-Host "URL: $WebhookUrl" -ForegroundColor Yellow
Write-Host "Token: $BearerToken" -ForegroundColor Yellow
Write-Host ""

$headers = @{ 
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $BearerToken"
}

$body = @{
    sessionId = "test-123"
    message = "Teste do webhook"
    timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
} | ConvertTo-Json

Write-Host "Enviando requisição..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $WebhookUrl -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCESSO! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status HTTP: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Teste da API Local ===" -ForegroundColor Cyan

$localHeaders = @{ 'Content-Type' = 'application/json' }
$localBody = @{
    id = "test-chat"
    message = @{
        id = "msg-123"
        role = "user"
        content = "Teste da API local"
    }
    sessionId = "test-session"
} | ConvertTo-Json -Depth 3

try {
    $localResponse = Invoke-WebRequest -Uri 'http://localhost:3005/api/chat' -Method POST -Headers $localHeaders -Body $localBody
    Write-Host "✅ API Local OK! Status: $($localResponse.StatusCode)" -ForegroundColor Green
    
    $localJson = $localResponse.Content | ConvertFrom-Json
    if ($localJson.fallback) {
        Write-Host "⚠️ Usando fallback (n8n indisponível)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Resposta do n8n recebida!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro na API local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Para configurar o webhook, veja: N8N_WEBHOOK_SETUP.md" -ForegroundColor Cyan