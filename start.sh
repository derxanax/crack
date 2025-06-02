#!/bin/bash

# 🎨 ЦВЕТОВАЯ ПАЛИТРА
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'
RAINBOW=('\033[31m' '\033[33m' '\033[32m' '\033[36m' '\033[34m' '\033[35m')

# 🌈 ФУНКЦИЯ РАДУЖНОГО ТЕКСТА
rainbow_text() {
    local text="$1"
    local i=0
    for (( j=0; j<${#text}; j++ )); do
        printf "${RAINBOW[$((i % 6))]}${text:$j:1}"
        ((i++))
    done
    printf "${RESET}"
}

# ⚡ АНИМИРОВАННЫЙ СПИННЕР
spinner() {
    local pid=$1
    local msg="$2"
    local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    
    while kill -0 $pid 2>/dev/null; do
        printf "\r${CYAN}${spin:$i:1} ${msg}${RESET}"
        i=$(( (i+1) % ${#spin} ))
        sleep 0.1
    done
    printf "\r${GREEN}✅ ${msg} - готово!${RESET}\n"
}

# 📊 ПРОГРЕСС-БАР
progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "\r${CYAN}["
    printf "${GREEN}$( printf '%*s' "$filled" | tr ' ' '█')"
    printf "${DIM}$( printf '%*s' "$empty" | tr ' ' '░')"
    printf "${CYAN}] ${YELLOW}${percentage}%%${RESET}"
}

# 🎭 АНИМИРОВАННЫЙ ЗАГОЛОВОК
animated_header() {
    clear
    echo -e "\n"
    
    # Анимация появления букв
    local crack_text="  ██████╗██████╗  █████╗  ██████╗██╗  ██╗"
    local crack_text2=" ██╔════╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝"
    local crack_text3=" ██║     ██████╔╝███████║██║     █████╔╝ "
    local crack_text4=" ██║     ██╔══██╗██╔══██║██║     ██╔═██╗ "
    local crack_text5=" ╚██████╗██║  ██║██║  ██║╚██████╗██║  ██╗"
    local crack_text6="  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝"
    
    echo -e "${PURPLE}${crack_text}${RESET}"
    sleep 0.2
    echo -e "${BLUE}${crack_text2}${RESET}"
    sleep 0.2
    echo -e "${CYAN}${crack_text3}${RESET}"
    sleep 0.2
    echo -e "${GREEN}${crack_text4}${RESET}"
    sleep 0.2
    echo -e "${YELLOW}${crack_text5}${RESET}"
    sleep 0.2
    echo -e "${RED}${crack_text6}${RESET}"
    
    echo -e "\n${BOLD}${CYAN}╔══════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${CYAN}║${RESET}    🚀 ${YELLOW}ИННОВАЦИОННАЯ УСТАНОВКА${RESET} 🚀    ${BOLD}${CYAN}║${RESET}"
    echo -e "${BOLD}${CYAN}║${RESET}     ${GREEN}Programming Language for Kids${RESET}     ${BOLD}${CYAN}║${RESET}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════╝${RESET}\n"
    
    sleep 1
}

# 🔧 ПРОВЕРКА СИСТЕМЫ
system_check() {
    echo -e "${BOLD}${BLUE}🔍 ДИАГНОСТИКА СИСТЕМЫ${RESET}\n"
    
    # Проверка Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        echo -e "${GREEN}✅ Node.js найден: ${node_version}${RESET}"
    else
        echo -e "${RED}❌ Node.js не найден! Установите Node.js 16+${RESET}"
        exit 1
    fi
    
    # Проверка npm
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        echo -e "${GREEN}✅ npm найден: v${npm_version}${RESET}"
    else
        echo -e "${RED}❌ npm не найден!${RESET}"
        exit 1
    fi
    
    # Проверка TypeScript
    if command -v tsc &> /dev/null; then
        echo -e "${GREEN}✅ TypeScript найден${RESET}"
    else
        echo -e "${YELLOW}⚠️  TypeScript не найден глобально, но это OK${RESET}"
    fi
    
    echo -e "\n${GREEN}✨ Система готова к установке!${RESET}\n"
    sleep 1
}

# 📦 УМНАЯ ПЕРЕУСТАНОВКА
smart_reinstall() {
    echo -e "${BOLD}${YELLOW}🔧 ПРОВЕРКА СУЩЕСТВУЮЩИХ ФАЙЛОВ${RESET}\n"
    
    # Проверяем существующие symlinks/файлы
    local files_to_check=("/usr/local/bin/crack" "/usr/local/bin/crapm")
    local need_removal=false
    
    for file in "${files_to_check[@]}"; do
        if [ -e "$file" ]; then
            echo -e "${YELLOW}⚠️  Найден существующий файл: $file${RESET}"
            need_removal=true
        fi
    done
    
    if [ "$need_removal" = true ]; then
        echo -e "\n${CYAN}🗑️  Удаляю старые файлы для чистой установки...${RESET}"
        sudo rm -f /usr/local/bin/crack /usr/local/bin/crapm
        echo -e "${GREEN}✅ Старые файлы удалены${RESET}\n"
    else
        echo -e "${GREEN}✅ Конфликтов не найдено${RESET}\n"
    fi
}

# 🚀 ГЛАВНАЯ УСТАНОВКА
main_install() {
    animated_header
    system_check
    smart_reinstall
    
    echo -e "${BOLD}${PURPLE}📋 ЭТАПЫ УСТАНОВКИ:${RESET}"
    echo -e "${DIM}1. Установка зависимостей npm${RESET}"
    echo -e "${DIM}2. Компиляция TypeScript → JavaScript${RESET}"
    echo -e "${DIM}3. Глобальная установка команд${RESET}"
    echo -e "${DIM}4. Настройка прав доступа${RESET}\n"
    
    # ЭТАП 1: Зависимости
    echo -e "${BOLD}${CYAN}📦 ЭТАП 1/4: Установка зависимостей${RESET}"
    npm install &> /tmp/npm_install.log &
    spinner $! "Скачиваю пакеты из npm registry"
    
    # Прогресс-бар для этапа 1
    for i in {1..25}; do
        progress_bar $i 25
        sleep 0.05
    done
    echo -e "\n"
    
    # ЭТАП 2: Компиляция
    echo -e "${BOLD}${CYAN}⚡ ЭТАП 2/4: Компиляция TypeScript${RESET}"
    echo -e "${PURPLE}╔════════════════════════════════╗${RESET}"
    echo -e "${PURPLE}║  ${YELLOW}TypeScript ${CYAN}━━━━━━➤ ${GREEN}JavaScript ${PURPLE}║${RESET}"
    echo -e "${PURPLE}╚════════════════════════════════╝${RESET}"
    
    npm run build &> /tmp/tsc_build.log &
    spinner $! "Компилирую код для производительности"

if [ $? -eq 0 ]; then
        echo -e "${GREEN}✨ Компиляция успешна!${RESET}\n"
    else
        echo -e "${RED}💥 Ошибка компиляции!${RESET}"
        cat /tmp/tsc_build.log
    exit 1
fi

    # ЭТАП 3: Глобальная установка
    echo -e "${BOLD}${CYAN}🌍 ЭТАП 3/4: Глобальная установка${RESET}"
    sudo npm install -g . --force &> /tmp/global_install.log &
    spinner $! "Устанавливаю команды crack и crapm"
    
    # ЭТАП 4: Права доступа
    echo -e "${BOLD}${CYAN}🔐 ЭТАП 4/4: Настройка прав${RESET}"
sudo chmod +x /usr/local/lib/node_modules/crack/dist/main.js
sudo chmod +x /usr/local/lib/node_modules/crack/dist/crapm.js

    # Финальный прогресс-бар
    echo -e "\n${BOLD}${GREEN}🎯 ФИНАЛИЗАЦИЯ:${RESET}"
    for i in {1..30}; do
        progress_bar $i 30
        sleep 0.03
    done
    echo -e "\n"
}

# 🎉 ФИНАЛЬНАЯ АНИМАЦИЯ
success_animation() {
    clear
    echo -e "\n"
    
    # Анимированная SUCCESS надпись
    local success_frames=(
        "${GREEN}💫 УСТАНОВКА ЗАВЕРШЕНА! 💫${RESET}"
        "${YELLOW}✨ УСТАНОВКА ЗАВЕРШЕНА! ✨${RESET}"
        "${CYAN}🌟 УСТАНОВКА ЗАВЕРШЕНА! 🌟${RESET}"
        "${PURPLE}🚀 УСТАНОВКА ЗАВЕРШЕНА! 🚀${RESET}"
        "${GREEN}💫 УСТАНОВКА ЗАВЕРШЕНА! 💫${RESET}"
    )
    
    for frame in "${success_frames[@]}"; do
        echo -e "\r        $frame"
        sleep 0.3
    done
    
    echo -e "\n${BOLD}${CYAN}╔══════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${CYAN}║${RESET}           🎊 ${GREEN}CRACK ГОТОВ!${RESET} 🎊            ${BOLD}${CYAN}║${RESET}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════╝${RESET}\n"
    
    # Тестирование команд
    echo -e "${BOLD}${PURPLE}🧪 ТЕСТИРОВАНИЕ КОМАНД:${RESET}\n"
    
    if command -v crack &> /dev/null; then
        echo -e "${GREEN}✅ crack команда установлена${RESET}"
    else
        echo -e "${RED}❌ Ошибка установки crack${RESET}"
    fi
    
    if command -v crapm &> /dev/null; then
        echo -e "${GREEN}✅ crapm команда установлена${RESET}"
    else
        echo -e "${RED}❌ Ошибка установки crapm${RESET}"
    fi
    
    # Примеры использования
    echo -e "\n${BOLD}${YELLOW}🎯 ПОПРОБУЙТЕ СЕЙЧАС:${RESET}"
    echo -e "${CYAN}┌─────────────────────────────────────────┐${RESET}"
    echo -e "${CYAN}│${RESET} ${GREEN}crack hello.crack${RESET}                     ${CYAN}│${RESET}"
    echo -e "${CYAN}│${RESET} ${GREEN}crapm install math${RESET}                    ${CYAN}│${RESET}"
    echo -e "${CYAN}│${RESET} ${GREEN}crapm install input${RESET}                   ${CYAN}│${RESET}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${RESET}"
    
    # ASCII арт финал
    echo -e "\n${PURPLE}"
    rainbow_text "    🌈 ДОБРО ПОЖАЛОВАТЬ В МИР CRACK! 🌈    "
    echo -e "${RESET}\n"
    
    # Отображение drel2.txt если есть
    if [ -f "drel2.txt" ]; then
        echo -e "${DIM}"
cat drel2.txt 
        echo -e "${RESET}"
    fi
}

# 🎬 ЗАПУСК УСТАНОВКИ
main_install
success_animation

echo -e "\n${BOLD}${GREEN}🎉 Установка завершена успешно! Начинайте программировать!${RESET}\n" 