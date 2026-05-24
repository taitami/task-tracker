#!/bin/bash

set -e

echo "=== 1. Оновлення системи та встановлення базових пакетів ==="
sudo apt-get update
sudo apt-get install -y curl jq tar libicu-dev build-essential

echo "=== 2. Створення директорії для GitHub Runner ==="

mkdir -p ~/actions-runner
cd ~/actions-runner

echo "=== 3. Завантаження GitHub Actions Runner ==="

RUNNER_VERSION="2.316.1"
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

echo "=== 4. Розпакування архіву ==="
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

echo "=== 5. Встановлення внутрішніх залежностей ранера ==="
sudo ./bin/installdependencies.sh

echo "=========================================================="
echo "✅ Підготовка Runner-машини успішно завершена!"
echo "=========================================================="
echo "ЩО РОБИТИ ДАЛІ:"
echo "1. Зайдіть на GitHub у ваш репозиторій."
echo "2. Перейдіть у Settings -> Actions -> Runners -> New self-hosted runner."
echo "3. Скопіюйте звідти команду конфігурації, яка виглядає приблизно так:"
echo "   ./config.sh --url https://github.com/<ваш_логін>/mywebapp --token <ВАШ_СЕКРЕТНИЙ_ТОКЕН>"
echo "4. Виконайте цю команду тут, знаходячись у папці ~/actions-runner"
echo "5. Запустіть ранер у фоновому режимі командами:"
echo "   sudo ./svc.sh install"
echo "   sudo ./svc.sh start"
echo "=========================================================="