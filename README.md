# ⚡ QuickChatt

<div align="center">

![QuickChatt Banner](https://img.shields.io/badge/QuickChatt-Real--Time%20Chat-7C3AED?style=for-the-badge&logo=lightning&logoColor=white)

**A blazing-fast, full-stack real-time messaging application built with modern web technologies.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%20v5-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20v8-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation & Running Locally](#installation--running-locally)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## 🚀 About the Project

**QuickChatt** is a real-time, full-stack chat application that combines a beautifully crafted Glassmorphism UI with powerful backend features. It supports instant messaging between users, live online/offline status, emoji reactions, message delivery tracking, and profile management with image uploads — all wrapped in a premium, responsive design with smooth micro-animations.

The application uses a fully decoupled architecture:
- **`/client`** — React + Vite frontend (TypeScript)
- **`/server`** — Node.js + Express REST API with Socket.io WebSocket server

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based login/signup with bcrypt password hashing
- ⚡ **Real-Time Messaging** — Instant delivery powered by Socket.io WebSockets
- 🟢 **Live Presence** — Real-time online/offline user status indicators
- 😄 **Emoji Reactions** — React to messages with any emoji
- ✅ **Message Status** — Sent → Delivered → Seen read receipts
- 🖼️ **Profile Management** — Upload and update avatars via Cloudinary
- 🌙 **Dark / Light Mode** — Seamless theme toggle with persistent preference
- 📱 **Fully Responsive** — Works beautifully on mobile, tablet, and desktop
- 💬 **Typing Indicators** — See when someone is typing in real time
- 🎨 **Premium UI** — Glassmorphism design, gradient accents, and fluid Framer Motion animations

---

## 🛠️ Tech Stack

### Frontend (`/client`)

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite 6** | Lightning-fast dev/build tool |
| **React Router DOM v7** | Client-side routing |
| **Tailwind CSS v3** | Utility-first styling with custom design tokens |
| **Framer Motion** | Complex layout transitions & animations |
| **Radix UI** | Accessible component primitives (Avatar, Popover, ScrollArea) |
| **Lucide React** | Modern icon library |
| **Axios** | HTTP client for REST API calls |
| **Socket.io Client** | Real-time WebSocket communication |
| **emoji-picker-react** | Emoji picker UI component |
| **react-hot-toast / sonner** | Toast notifications |

### Backend (`/server`)

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express v5** | REST API framework |
| **MongoDB + Mongoose v8** | Database & ODM |
| **Socket.io v4** | Real-time, bidirectional event-based communication |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Cloudinary** | Cloud image storage (profile pictures & media) |
| **dotenv** | Environment variable management |
| **nodemon** | Development auto-restarter |

---

## 📁 Project Structure

```
QuickChatt/
├── client/                    # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── chat/          # ChatHeader, MessageBubble, Avatar, etc.
│   │   ├── context/           # React Context for global state
│   │   ├── data/              # Mock data & TypeScript types
│   │   └── assets/            # Images, icons, and static files
│   ├── public/
│   ├── index.html
│   ├── tailwind.config.js     # Custom design system (colors, animations)
│   ├── vite.config.js
│   └── vercel.json            # Vercel SPA rewrite rules
│
└── server/                    # Backend (Node.js + Express)
    ├── controllers/           # Route logic (userController, messageController)
    ├── middleware/            # Auth middleware (JWT verification)
    ├── models/                # Mongoose models (User, Message)
    ├── routes/                # API route definitions
    ├── lib/                   # DB connection, Cloudinary setup
    ├── server.js              # App entry point + Socket.io setup
    └── vercel.json            # Vercel serverless config
```

---

## 📡 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login and receive JWT |
| `PUT` | `/update-profile` | ✅ | Update name, bio, or avatar |
| `GET` | `/check` | ✅ | Verify current auth session |

### Message Routes — `/api/messages`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users` | ✅ | Get all users for the sidebar |
| `GET` | `/:id` | ✅ | Fetch message history with a user |
| `POST` | `/send/:id` | ✅ | Send a message to a user |
| `PUT` | `/mark/:id` | ✅ | Mark a message as seen |
| `PUT` | `/react/:id` | ✅ | Add/remove an emoji reaction |

### Status
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Health check — returns `"Server is live"` |

---

## 🏁 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- A [MongoDB](https://www.mongodb.com/) database (Atlas or local)
- A [Cloudinary](https://cloudinary.com/) account (free tier works fine)

### Environment Variables

#### Server (`/server/.env`)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5001
```

#### Client (`/client/.env`)
```env
VITE_BACKEND_URL=http://localhost:5001
```

### Installation & Running Locally

**1. Clone the repository**
```bash
git clone https://github.com/your-username/QuickChatt.git
cd QuickChatt
```

**2. Setup & run the backend**
```bash
cd server
npm install
npm run server
# Server starts on http://localhost:5001
```

**3. Setup & run the frontend** *(in a new terminal)*
```bash
cd client
npm install
npm run dev
# App starts on http://localhost:5173
```

---

## 🚀 Deployment

### Frontend → Vercel ✅
The `/client` folder is fully ready to deploy to Vercel. The `vercel.json` is already configured with SPA rewrites so React Router works correctly on page refresh.

```bash
# From the /client directory
vercel --prod
```
> Set `VITE_BACKEND_URL` to your deployed backend URL in Vercel's Environment Variables settings.

### Backend → Render / Railway (Recommended)
The backend uses **Socket.io**, which requires a persistent, stateful server. **Do not deploy the backend to Vercel** (serverless platforms break WebSocket connections).

Instead, deploy to:
- **[Render](https://render.com/)** — Connect your GitHub repo, set `Root Directory` to `server`, set build command to `npm install`, and start command to `npm start`.
- **[Railway](https://railway.app/)** — Similar setup with easy environment variable management.

---

## 📸 Screenshots

*Coming soon...*

---

<div align="center">

Made with ❤️ by **Yashpreet**

</div>
