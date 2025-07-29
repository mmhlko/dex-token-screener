# 🔍 Token Search Backend

Backend service for searching trading tokens and pairs via **Dexscreener API**, with **Redis caching** and **Swagger documentation**.

---

## 📦 Features

- Search by:
  - Token address
  - Pair address
  - Query string (name or symbol)
- Uses [Dexscreener API](https://dexscreener.com/)
- Caches results using Redis
- API documentation with Swagger
- Error logging
- Basic unit tests

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/token-search-backend.git
cd token-search-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
PORT=3000

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=   # (optional)
```

### 4. Run the application

```bash
npm run start:dev
```

The app will start on `http://localhost:3000`.

---

## 📘 Swagger API Docs

After the app is running, access the API documentation at:

```
http://localhost:3000/swagger
```

With Swagger UI you can:
- Explore available endpoints
- Send test requests
- View response formats

---