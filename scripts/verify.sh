#!/bin/bash
TARGET_IP=$1

echo "=== Запуск верифікації розгортання на $TARGET_IP ==="
sleep 5

STATUS_TASKS=$(curl -s -o /dev/null -w "%{http_code}" http://$TARGET_IP/tasks)
if [ "$STATUS_TASKS" -eq 200 ]; then
    echo "Сервіс успішно доступний (HTTP 200 на /tasks)"
else
    echo "Помилка: Сервіс недоступний (Отримано код: $STATUS_TASKS)"
    exit 1
fi

STATUS_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://$TARGET_IP/health/alive)
if [ "$STATUS_HEALTH" -eq 403 ]; then
    echo "Nginx налаштовано правильно (HTTP 403 на /health/alive)"
else
    echo "Помилка: Nginx пропускає заборонені запити (Отримано код: $STATUS_HEALTH)"
    exit 1
fi

echo "=== Верифікація успішно пройдена! ==="