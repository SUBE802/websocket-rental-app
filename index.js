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
        origin: "https://apex.oracle.com",  
        methods: ["GET", "POST"],
        credentials: true
      },
      allowEIO3: true 
});
const activeUsers = new Set();

// app.get('/', (req, res) => {
//     res.send('Hello World');
// })


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('req-refresh-chat', (data) => {
        console.log('asked to refresh user chat', data);
        socket.emit('refresh-chat');
    })

    socket.on('user-connected', (data) => {
        // users[socket.id] = name;
        socket.userId = data;
        activeUsers.add(data);
    });

    socket.on('message', (data) => {
        console.log(`Received message: ${data}`);
        io.emit('message', data);
    });
    socket.on('disconnect', () => {
        activeUsers.delete(socket.userId);
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});