const dotenv = require('dotenv')
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error',err));

app.use(express.static('public'));

io.on('connection', socket => {
    console.log('A user connected');
    
    Message.find().sort({timestamp: 1}).limit(50).exec().
    then(messages => {
        socket.emit('load messages', messages);
    }).catch(err => {
        console.error('Error retrieving messages', err);
    });

    socket.on('chat message', async(data)=> {
         const {username, message} = data;

         const newMessage = new Message({username, message});
         await newMessage.save();

         io.emit('chat message', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});


server.listen(process.env.PORT, () => console.log(`Server running on port ${3000}`));


