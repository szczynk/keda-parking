# keda-parking

## About

keda-parking merupakan sistem parkir yang menggunakan PostgreSQL, Vue.js, Node.js dimana di dalamnya terdapat 2 halaman utama, yaitu halaman pencatatan dengan url ```localhost:3000``` dan halaman tampilan tabel data dengan url ```localhost:3000/park```

## Technologies

- PostgreSQL
- Sequalize (ORM)
- Express.js
- Nuxt.js (Vue.js Framework)

## Getting Started

- Install server dan client

  ```bash
  cd server && npm install
  ```

  ```bash
  cd client && npm install
  ```

- Develop

  ```bash
  cd server && npm run dev
  ```

  ```bash
  cd client && npm run dev
  ```

- Test server

  ```bash
  cd server && npm run test
  ```

- Prod

  ```bash
  npm install pm2 -g
  ```

  ```bash
  cd client && npm run generate
  ```

  ```bash
  pm2 start ecosystem.config.json
  ```

  ```bash
  pm2 ls
  ```
