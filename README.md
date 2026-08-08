# 📖 Storyveil — Manga & Webtoon Reading Platform

**Storyveil** is a high-performance, modern, dark-themed manga and webtoon reading application built with **React Native (Expo)** on the frontend and **Node.js, Express, and MongoDB Atlas** on the backend.

---

## 🌟 Key Features

- **🎨 Modern Dark Mode & Glassmorphic UI**: Responsive design built with Flexbox adapting seamlessly across iOS, Android, and Web viewports.
- **📚 Manga & Webtoon Reader**: Dual reading modes — continuous vertical webtoon scroll and horizontal page-by-page manga reader.
- **🔥 Catalog & Hero Slider**: Featured trending stories carousel, genre filter pills, search bar, and rating star overlays.
- **🔖 User Library & Progress Tracker**: Chapter progress bars, reading history, favorites tab, and resume reading shortcuts.
- **👤 Profile & Activity Stats**: Reader streaks, total chapters read, time spent reading stats, and offline cache clearing.
- **⚡ MongoDB Atlas Database**: Cloud database with Mongoose schemas for Users, Stories, Chapters, and Bookmarks.
- **🔒 Secure Architecture**: Zero hardcoded credentials; sensitive connection URIs stored safely in `.env` files.

---

## 📁 Repository Structure

```text
Storyveil/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # MongoDB Atlas connection setup
│   │   ├── models/
│   │   │   ├── User.js          # User schema & password hashing
│   │   │   ├── Story.js         # Manga/Webtoon metadata schema
│   │   │   ├── Chapter.js       # Chapter pages & image URLs schema
│   │   │   └── Bookmark.js      # User library & progress tracking schema
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── storyController.js
│   │   │   ├── chapterController.js
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── storyRoutes.js
│   │   │   ├── chapterRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js # JWT authentication middleware
│   │   ├── seed/
│   │   │   └── seedData.js      # Populates database with sample catalog
│   │   └── server.js            # Express REST API entry point
│   ├── .env.example             # Template env file for Git
│   ├── .env                     # Private environment configuration (ignored by git)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Header.js
│   │   │   ├── StoryCard.js
│   │   │   ├── FeaturedCarousel.js
│   │   │   └── ReaderControls.js
│   │   ├── screens/
│   │   │   ├── HomeScreen.js    # Browse & search catalog
│   │   │   ├── ReaderScreen.js  # Interactive reader view
│   │   │   ├── LibraryScreen.js # Bookmarks & reading history
│   │   │   └── ProfileScreen.js # User profile & activity stats
│   │   ├── navigation/
│   │   │   └── AppNavigator.js  # Bottom tab & stack navigator
│   │   ├── services/
│   │   │   └── api.js           # Axios API client & offline fallback layer
│   │   ├── context/
│   │   │   └── AuthContext.js   # Global user state & reading history
│   │   └── styles/
│   │       └── theme.js         # Color tokens, glassmorphic metrics, shadows
│   ├── App.js                   # Root React Native component
│   ├── app.json                 # Expo project configuration
│   └── package.json
├── .gitignore                   # Excludes node_modules, .env, build output
└── README.md                    # Project documentation
```

---

## 🛠️ Tech Stack & Prerequisites

- **Frontend**: React Native, Expo SDK 51, React Navigation 6, Axios, Expo Vector Icons
- **Backend**: Node.js, Express.js, Mongoose 8, JWT, bcryptjs, Morgan, CORS
- **Database**: MongoDB Atlas (Cloud Cluster)
- **Node Version**: v18.0.0 or higher recommended

---

## 🚀 Step-by-Step Setup Guide

### 1. Configure Backend & Database

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Verify .env file settings (created securely with your MongoDB Atlas URI)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/storyveil?retryWrites=true&w=majority

# Seed sample manga & chapter data into MongoDB Atlas
npm run seed

# Start the Express API server (runs on http://localhost:5000)
npm run dev
```

### 2. Configure Frontend (React Native / Expo)

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Expo developer server
npx expo start
```

Press `w` in the Expo CLI terminal to launch in **Expo Web Browser**, or scan the QR code with **Expo Go** on iOS/Android.

---

## 🔗 REST API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | API server status check | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login user & issue JWT token | No |
| `GET` | `/api/auth/me` | Fetch current user profile | Yes (Bearer) |
| `GET` | `/api/stories` | Get manga catalog (supports `?genre=`, `?search=`) | No |
| `GET` | `/api/stories/featured` | Get hero slider featured webtoons | No |
| `GET` | `/api/stories/:id` | Get story details & chapter list | No |
| `GET` | `/api/chapters/:id` | Get chapter pages & image URLs | No |
| `GET` | `/api/user/bookmarks` | Get user reading history & bookmarks | Yes (Bearer) |
| `POST` | `/api/user/bookmarks` | Save reading progress & bookmark status | Yes (Bearer) |

---

## 🐙 Git & GitHub Integration Commands

To push this complete codebase to your GitHub repository (`https://github.com/melrowgallardo/Storyveil.git`), run the following terminal commands:

```bash
# 1. Ensure you are in the project root directory
cd c:/Users/Acer/Storyveil

# 2. Initialize local Git repository
git init

# 3. Check git status to ensure node_modules and .env are excluded
git status

# 4. Stage all project files
git add .

# 5. Commit initial version with a professional message
git commit -m "feat: initial commit for Storyveil full-stack manga reading application"

# 6. Set main branch name
git branch -M main

# 7. Add your remote GitHub repository URL
git remote add origin https://github.com/melrowgallardo/Storyveil.git

# 8. Push initial commit to GitHub
git push -u origin main
```

---

## 🛡️ License

This project is licensed under the **MIT License**.
