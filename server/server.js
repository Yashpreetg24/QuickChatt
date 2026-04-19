import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app)

// CORS origin function — allows specific origin in prod, all in dev
const corsOrigin = (origin, callback) => {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
        // Dev mode: allow all origins
        return callback(null, true);
    }
    if (!origin || origin === frontendUrl) {
        return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
};

// Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: corsOrigin,
        credentials: true,
    }
})

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;
    
    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

// Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cors({
    origin: corsOrigin,
    credentials: true,
}));


// Routes setup
app.use("/api/status", (req, res)=> res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)


// Connect to MongoDB
await connectDB();

// Always listen on port (Render requires this)
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));

export default server;
