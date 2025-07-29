# create-server-startup

[![npm](https://img.shields.io/npm/v/create-server-startup)](https://www.npmjs.com/package/create-server-startup)  
[![License](https://img.shields.io/github/license/stakbase/create-server-startup)](https://github.com/stakbase/create-server-startup/blob/main/LICENSE)  
[![Node.js CI](https://img.shields.io/github/actions/workflow/status/stakbase/create-server-startup/nodejs.yml)](https://github.com/stakbase/create-server-startup/actions)

A powerful CLI tool by **Stakbase** to **scaffold production‑ready Node.js backend projects** in seconds — with support for JavaScript or TypeScript, popular databases, and JWT‑based security options.

---

## 🌟 Features

- Choose between **JavaScript** or **TypeScript**  
- Select popular **databases** (MongoDB, PostgreSQL, MySQL, SQLite)  
- Optionally enable **security** (Helmet, CORS, Rate Limiting, JWT Auth)  
- Auto‑generates:
  - Project folder structure
  - `.env.example` file
  - `README.md`, `.gitignore`, `package.json`
  - Health‑check endpoint
  - Logger & error middleware  
- Pre‑configured with `nodemon`, `winston`, `dotenv`, and more

---

## 📦 Installation

### ▶️ From NPM (Global)

```bash
npm install -g create-server-startup
````

Then simply run:

```bash
create-server-startup
```

and follow the interactive prompts!

---

## 🛠️ Setup Locally (Development/Contributing)

1. **Fork** the repo on GitHub:
   [https://github.com/stakbase/create-server-startup](https://github.com/stakbase/create-server-startup)

2. **Clone** your fork:

   ```bash
   git clone https://github.com/<your‑username>/create-server-startup.git
   cd create-server-startup
   ```

3. **Install** dependencies:

   ```bash
   npm install
   ```

4. **Link** it locally to test as a CLI:

   ```bash
   npm link
   ```

Now you can run the CLI:

```bash
create-server-startup
```

---

## 💡 Why use `create-server-startup`?

Setting up a new backend often means repeating boilerplate:

* Folder structure
* Health checks, loggers, error handlers
* Env & Git configuration
* Security middleware & DB connections

**`create-server-startup` automates all of that**, so you can dive straight into building features.

---

## 🧪 Example Usage

```bash
? ➤ Project name: my-server
? ➤ JavaScript or TypeScript? TypeScript
? ➤ Database: PostgreSQL
? ➤ Security level: JWT Authentication
```

### Generated Structure

```
my-server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── routes/v1/
│   ├── services/
│   ├── utils/
│   └── app.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── server.ts
```

---

## 🚀 Running the Generated Project

1. **Install dependencies**

   ```bash
   cd my-server
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # then update .env with your DATABASE_URL, JWT_SECRET, etc.
   ```

3. **Start the server**

   * **TypeScript**:

     ```bash
     npm run dev
     ```
   * **JavaScript**:

     ```bash
     npm start
     ```

4. **Verify health endpoint**

   ```bash
   curl http://localhost:3000/api/v1/health
   ```

---

## 🐛 Issues & 💡 Features

Got a bug or idea? Please [open an issue](https://github.com/stakbase/create-server-startup/issues).

---

## 🤝 Contributing

We love contributions! To get started:

1. Fork the repo
2. Create a feature branch:

   ```bash
   git checkout -b feature/awesome-feature
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add awesome feature"
   ```
4. Push and open a PR

---

## 📄 License

MIT © [Stakbase](https://stakbase.com)

```
