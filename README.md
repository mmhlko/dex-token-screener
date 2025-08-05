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
- Comprehensive test coverage (Unit + E2E tests)
- Input validation and error handling

---

## 🧪 Testing

The project includes comprehensive test coverage:

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mmhlko/dex-token-screener.git
cd token-search-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```
# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=   # (optional)
```

### 4. Run the application in Docker

```bash
docker-compose up --build -d
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