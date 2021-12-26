const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3001);

io.on('connection', function (socket) {
    socket.on('join', function (data) {
        socket.join(data.roomId);
        socket.room = data.roomId;
        const sockets = io.of('/').in().adapter.rooms[data.roomId];
        console.log(sockets);
        if(sockets.length===1){
            socket.emit('init')
        }else{
            if (sockets.length===2){
                io.to(data.roomId).emit('ready')
            }else{
                socket.room = null
                socket.leave(data.roomId)
                socket.emit('full')
            }
            
        }
    });
    socket.on('signal', (data) => {
        io.to(data.room).emit('desc', data.desc)        
    })
    socket.on('disconnect', () => {
        const roomId = Object.keys(socket.adapter.rooms)[0]
        if (socket.room){
            io.to(socket.room).emit('disconnected')
        }
        
    })
});
