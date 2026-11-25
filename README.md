# 🎬 CineMind AI

### Your Personal AI-Powered Movie & TV Show Assistant

CineMind AI is an intelligent movie and TV show recommendation platform that helps users discover content based on their interests, preferences, and moods.

Instead of scrolling endlessly, users can describe what they want to watch and get personalized recommendations.

## ✨ Features

- **AI Movie Recommendations** – Get movie and TV show recommendations based on natural-language prompts.
- **Discover Movies & TV Shows** – Explore trending content and browse movies.
- **Smart Search & Genre Filters** – Find content based on your interests.
- **Movie Details** – Explore movie information, ratings, and related details.
- **User Authentication** – Register, log in, and manage your account.
- **Forgot & Reset Password** – Recover your account through email verification links.
- **Favorites** – Save and manage your favorite movies and shows.
- **Chat History** – Access previous recommendation conversations.
- **Responsive UI** – Enjoy the application on desktop and mobile devices.
- **Dark & Light Mode** – Switch between themes.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- JavaScript
- React Router
- Lucide React

**Backend**
- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- bcryptjs

**APIs & Integrations**
- Google Gemini API
- TMDB API
- Tavily API
- Nodemailer

## 📁 Project Structure

```text
CineMind-AI/
│
├── Client/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   ├── Context/
│   │   ├── Pages/
│   │   ├── assets/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/aaftab404/CineMind-AI.git
```

```bash
cd CineMind-AI
```

### 2. Install frontend dependencies

```bash
cd Client
npm install
```

### 3. Install backend dependencies

Open another terminal from the project root:

```bash
cd server
npm install
```

### 4. Configure environment variables

Create `.env` files inside both `Client` and `server` directories.

Add your required API credentials, database configuration, JWT secrets, email credentials, and frontend/backend URLs.

Use the variable names expected by the application. Never commit actual API keys, passwords, or secrets.

### 5. Configure PostgreSQL

Create a PostgreSQL database and configure its connection details in the backend environment variables.

Run the required database table setup or migrations before starting the application.

### 6. Start the application

Start the backend using its development script:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd Client
npm run dev
```

Open the local frontend URL displayed by Vite in your browser.

## 🔐 Security

- Environment variables are used for sensitive credentials.
- Passwords are hashed before database storage.
- JWT-based authentication is implemented.
- Password reset links use expiring, single-use tokens.
- Environment files are excluded from Git.

## 🚀 Future Improvements

- Enhance AI-powered movie and TV show recommendations.
- Improve conversational memory and contextual understanding.
- Introduce more personalized recommendations based on user preferences.
- Expand movie and TV show discovery capabilities.

## 👨‍💻 Author

**Aftab Khan**

GitHub: [@aaftab404](https://github.com/aaftab404)

---

⭐ If you find CineMind AI interesting, consider giving the repository a star!