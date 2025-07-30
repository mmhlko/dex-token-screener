# Build stage
FROM node:20-alpine AS builder

# Создаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json (или yarn.lock)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Собираем приложение (если нужно)
RUN npm run build

# Открываем порт, на котором работает приложение
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "run", "start:prod"]