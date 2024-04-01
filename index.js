const express = require('express');
const https = require('https');
// const http = require('http');
const cors = require('cors');
const socketIO = require('socket.io');
const fs = require("fs"); 
const app = express();

const keys = {
    key: fs.readFileSync('./cert/localhost.key'),
    cert: fs.readFileSync('./cert/localhost.crt')
};

app.use(cors());
const server = https.createServer(keys, app);
// const server = http.createServer(app);

const io = new socketIO.Server(server,{
    cors: {
        origin: ["https://apex.oracle.com"],  
        methods: ["GET", "POST"],
        credentials: true
      },
      allowEIO3: true 
});

const activeUsers = [];

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('user-connected', (data) => {
        console.log('New User Connected', data);
        activeUsers.push({
            name: data.name,
            socketId : socket.id,
            userId: data.userId
        });
    })

    socket.on('send-message', (data) => {
        console.log('new message received', data);

        const receiverSocket = activeUsers.find((user) => user.userId === data.receiver);
        if (receiverSocket !== undefined) {
            socket.to(receiverSocket.socketId).emit('recieve-message', {
                senderId : data.senderId,
                message : data.message,
                date: data.date
            });
        }
    })

    socket.on('req-refresh-chat', (data) => {
        console.log('asked to refresh user chat', data);
        socket.emit('refresh-chat');
    })

    socket.on('disconnect', () => {
        const disconnectedUserID = activeUsers.findIndex((user) => user.socketId === socket.id);
        activeUsers.splice(disconnectedUserID,1);
        console.log('A user disconnected');
    });
});


app.get('/', (req, res) => {
    res.send('Hello World');
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});