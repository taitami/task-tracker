#!/bin/bash

TARGET_IP="${1:-$TARGET_IP}"
TARGET_IP="${TARGET_IP:-127.0.0.1}"

echo "=== Запуск верифікації розгортання на сервері $TARGET_IP ==="

sleep 3

STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$TARGET_IP:5200/health/alive)

echo "Отримано HTTP-код відповіді: $STATUS"

if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 304 ] || [ "$STATUS" -eq 404 ]; then
    echo "✅ Верифікація успішна! Сервіс відповідає."
    exit 0
else
    echo "❌ Помилка: Сервіс недоступний (Отримано код: $STATUS)"
    exit 1
fi