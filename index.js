const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { join } = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, './index.html'));
});

io.on('connection', (socket) => {
    console.log('New client connected');

    // When Clinet Joined the room
    socket.on('joinRoom', ({ room, username }) => {
        socket.join(room);
        socket.room = room;
        socket.username = username;
        io.to(room).emit('message', `${username} has joined the room ${room}`);
    });

    // When client send message in the room
    socket.on('message', (message) => {
        if (socket.room && socket.username) {
            console.log(`Message from ${socket.username} to room ${socket.room}: ${message}`);
            io.to(socket.room).emit('message', `${socket.username}: ${message}`);
        }
    });

    // When client Disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        if (socket.room && socket.username) {
            io.to(socket.room).emit('message', `${socket.username} has left the room ${socket.room}`);
        }
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
