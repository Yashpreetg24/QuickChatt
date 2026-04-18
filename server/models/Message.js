import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    text: { type: String, },
    image: { type: String, },
    voice: { type: String, },
    duration: { type: Number, },
    waveform: { type: [Number], },
    reactions: [
        {
            emoji: { type: String, required: true },
            users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
        }
    ],
    seen: {type: Boolean, default: false}
}, {timestamps: true});

const Message = mongoose.model("Message", messageSchema);

export default Message;