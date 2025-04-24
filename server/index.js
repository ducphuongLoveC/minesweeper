const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://127.0.0.1:5500", 
        methods: ["GET", "POST"]
    }
})

const rooms = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('create-room', () => {
        const roomId = generateRoomId();
        rooms[roomId] = {
            playerA: socket.id,
            playerB: null,
            gameStarted: false
        };
        socket.join(roomId);
        socket.emit('room-created', roomId);
    });

    socket.on('join-room', (roomId) => {
        if (!rooms[roomId]) {
            socket.emit('room-error', 'Room does not exist');
            return;
        }

        if (rooms[roomId].playerB) {
            socket.emit('room-error', 'Room is full');
            return;
        }

        rooms[roomId].playerB = socket.id;
        socket.join(roomId);
        socket.emit('room-joined', roomId);

        // Notify player A that player B has joined
        io.to(rooms[roomId].playerA).emit('opponent-joined');
    });

    socket.on('game-setup', (data) => {
        socket.to(data.roomId).emit('game-setup', data);
    });

    socket.on('cell-opened', (data) => {
        socket.to(data.roomId).emit('cell-opened', data);
    });

    socket.on('flag-toggled', (data) => {
        socket.to(data.roomId).emit('flag-toggled', data);
    });

    socket.on('game-over', (data) => {
        socket.to(data.roomId).emit('game-over', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Clean up rooms if a player disconnects
        for (const roomId in rooms) {
            if (rooms[roomId].playerA === socket.id || rooms[roomId].playerB === socket.id) {
                if (rooms[roomId].playerA === socket.id) {
                    if (rooms[roomId].playerB) {
                        io.to(rooms[roomId].playerB).emit('opponent-disconnected');
                    }
                } else {
                    io.to(rooms[roomId].playerA).emit('opponent-disconnected');
                }
                delete rooms[roomId];
            }
        }
    });
});

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});