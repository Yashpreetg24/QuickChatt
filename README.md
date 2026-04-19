# QuickChatt - Real-Time Chat App

QuickChatt is a full-stack real-time messaging application built with **React**, **TypeScript**, **Node.js**, and **Socket.io**. It features a premium glassmorphism UI, instant messaging, and live presence indicators.

## Features

- **Real-Time Messaging**: Instant delivery powered by Socket.io WebSockets.
- **Live Presence**: Real-time online/offline status for all users.
- **Emoji Reactions**: React to any message with an emoji.
- **Read Receipts**: Sent → Delivered → Seen message status tracking.
- **Profile Management**: Upload and update avatars via Cloudinary.
- **Dark / Light Mode**: Seamless theme toggle with persistent preference.
- **Typing Indicators**: See when someone is typing in real time.
- **Secure Auth**: JWT-based login/signup with bcrypt password hashing.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express v5, Socket.io
- **Database**: MongoDB + Mongoose
- **Auth**: JSON Web Tokens (JWT), bcryptjs
- **Media Storage**: Cloudinary

## Getting Started

### Prerequisites

- Node.js (v18+)
- A [MongoDB](https://www.mongodb.com/) database (Atlas or local)
- A [Cloudinary](https://cloudinary.com/) account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Yashpreetg24/QuickChatt.git
   cd QuickChatt
   ```

2. Set up environment variables:

   Create `/server/.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5001
   ```

   Create `/client/.env`:
   ```env
   VITE_BACKEND_URL=http://localhost:5001
   ```

3. Run the backend:
   ```bash
   cd server
   npm install
   npm run server
   ```

4. Run the frontend *(in a new terminal)*:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Deployment

- **Frontend** → [Vercel](https://vercel.com/) — deploy the `/client` folder. Set `VITE_BACKEND_URL` to your live backend URL in Vercel's environment settings.
- **Backend** → [Render](https://render.com/) or [Railway](https://railway.app/) — Socket.io requires a persistent server; avoid serverless platforms for the backend.

## License

Personal project.
