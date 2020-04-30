const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
// const wordFilter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname , '../public');

app.use(express.static(publicDirectoryPath));


// let count = 0;
io.on('connection', (socket) => {
    socket.on('join', ({ username, room }, callback) => {
        const user = addUser({id: socket.id, username, room});
        if (user.error) {
            return callback(user.error);
        }
        socket.join(user.room);

        socket.emit('toMessageClientEvent', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('toMessageClientEvent', generateMessage('Admin', `${user.username} joined this room!`));

        io.to(user.room).emit('toRoomDataClientEvent', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('toMessageServerEvent', (message, callback) => {
        const user = getUser(socket.id);
        // const Filter = new wordFilter();
        //
        // if(Filter.isProfane(message)) {
        //     return callback('Bad words in the sentence. Not sent!');
        // }
        io.to(user.room).emit('toMessageClientEvent', generateMessage(user.username, message));
        callback();
    });

    socket.on('toLocationShareServerEvent', ({lat, long}, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('toLocationShareClientEvent', generateLocationMessage(user.username, lat, long));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('toMessageClientEvent', generateMessage('Admin', `${user.username} left!`));
            io.to(user.room).emit('toRoomDataClientEvent', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });

});


server.listen(port, ()=> {
    console.log(`Running server at ${port}!`)
});