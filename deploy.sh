#!/bin/bash

set -e

REPO_DIR=$(pwd)

echo "=== 1. Оновлення та встановлення пакетів ==="
apt-get update
apt-get install -y mariadb-server nginx nodejs npm curl git

echo "=== 2. Створення користувачів ==="

useradd -r -m -d /var/www/mywebapp -s /bin/false app || true
useradd -m -s /bin/bash student || true
useradd -m -s /bin/bash teacher || true
useradd -m -s /bin/bash operator || true

echo "teacher:12345678" | chpasswd
echo "operator:12345678" | chpasswd
chage -d 0 teacher
chage -d 0 operator

usermod -aG sudo student
usermod -aG sudo teacher

echo "=== 3. Налаштування sudo для operator ==="
cat << 'EOF' > /etc/sudoers.d/operator
operator ALL=(ALL) NOPASSWD: /usr/bin/systemctl start mywebapp, /usr/bin/systemctl stop mywebapp, /usr/bin/systemctl restart mywebapp, /usr/bin/systemctl status mywebapp, /usr/bin/systemctl reload nginx
EOF
chmod 440 /etc/sudoers.d/operator

echo "=== 4. Налаштування MariaDB ==="
systemctl start mariadb
systemctl enable mariadb

mysql -e "CREATE DATABASE IF NOT EXISTS mywebapp_db;"
mysql -e "CREATE USER IF NOT EXISTS 'app'@'localhost' IDENTIFIED BY 'app_password';"
mysql -e "GRANT ALL PRIVILEGES ON mywebapp_db.* TO 'app'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "=== 5. Створення файлу gradebook ==="
echo "16" > /home/student/gradebook
chown student:student /home/student/gradebook
chmod 644 /home/student/gradebook

echo "=== 6. Блокування дефолтного користувача ubuntu ==="
usermod -L ubuntu || true

echo "=== 7. Збірка та підготовка веб-застосунку ==="

cd $REPO_DIR/mywebapp
npm ci
npm run build

cp -r dist package.json package-lock.json node_modules /var/www/mywebapp/

chown -r app:app /var/www/mywebapp

echo "=== 8. Копіювання конфігів Systemd та Nginx ==="
cd $REPO_DIR
cp configs/mywebapp.socket /etc/systemd/system/
cp configs/mywebapp.service /etc/systemd/system/

if [ -f "docker/nginx/default.conf" ]; then
    cp docker/nginx/default.conf /etc/nginx/sites-available/mywebapp.conf
elif [ -f "configs/mywebapp.conf" ]; then
    cp configs/mywebapp.conf /etc/nginx/sites-available/mywebapp.conf
fi

ln -sf /etc/nginx/sites-available/mywebapp.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "=== 9. Запуск сервісів ==="
systemctl daemon-reload
systemctl enable mywebapp.socket
systemctl start mywebapp.socket

systemctl enable mywebapp.service
systemctl restart mywebapp.service

systemctl restart nginx

echo "=== Автоматизація успішно завершена! ==="