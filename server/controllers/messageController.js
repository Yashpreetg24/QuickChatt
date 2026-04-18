import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js";


// Get all users except the logged in user
export const getUsersForSidebar = async (req, res)=>{
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");

        // Count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false})
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, users: filteredUsers, unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get all messages for selected user
export const getMessages = async (req, res) =>{
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.json({success: true, messages})


    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res)=>{
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Send message to selected user
export const sendMessage = async (req, res) =>{
    try {
        const {text, image, voice, duration, waveform} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }

        let voiceUrl;
        if(voice){
            const uploadResponse = await cloudinary.uploader.upload(voice, { resource_type: "video" })
            voiceUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            voice: voiceUrl,
            duration,
            waveform
        })

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({success: true, newMessage});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Toggle a reaction on a message
export const reactToMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) return res.json({ success: false, message: "Message not found" });

        // First, check if the user already reacted with THIS EXACT emoji
        const existingReactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
        let userAlreadyReactedToThis = false;

        if (existingReactionIndex > -1) {
            const userIndex = message.reactions[existingReactionIndex].users.indexOf(userId);
            if (userIndex > -1) {
                userAlreadyReactedToThis = true;
            }
        }

        // Remove the user from ALL existing reactions to enforce single emoji per user
        message.reactions.forEach(reaction => {
            const uIndex = reaction.users.indexOf(userId);
            if (uIndex > -1) {
                reaction.users.splice(uIndex, 1);
            }
        });

        // Filter out completely empty reactions
        message.reactions = message.reactions.filter(r => r.users.length > 0);

        // If they hadn't reacted to THIS exact emoji before, add the new one (if they did, it stays toggled off)
        if (!userAlreadyReactedToThis) {
            const targetReaction = message.reactions.find(r => r.emoji === emoji);
            if (targetReaction) {
                targetReaction.users.push(userId);
            } else {
                message.reactions.push({ emoji, users: [userId] });
            }
        }

        const updatedMessage = await message.save();

        // Broadcast to receiver if they're online
        // The message has a senderId and a receiverId. 
        // We broadcast to the generic other party so they both see it!
        const otherUserId = updatedMessage.senderId.toString() === userId.toString() ? updatedMessage.receiverId : updatedMessage.senderId;
        const otherSocketId = userSocketMap[otherUserId];
        
        if (otherSocketId) {
            io.to(otherSocketId).emit("messageReacted", { messageId, reactions: updatedMessage.reactions });
        }

        res.json({ success: true, updatedMessage });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}