#!/bin/bash
set -e

echo "=== Оновлення Docker-сервісу на Target Node ==="

cp /tmp/mywebapp-docker.service /etc/systemd/system/

systemctl daemon-reload
systemctl enable mywebapp-docker
systemctl restart mywebapp-docker
systemctl restart nginx

echo "=== Розгортання завершено ==="