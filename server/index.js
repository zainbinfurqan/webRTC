const express = require('express');
const app = express();
const http = require('http');
const socket = require("socket.io");
const PORT = 3000

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});


const server = app.listen(PORT, () => {
    console.log(`app listening at http://localhost:${PORT}`)
})

const connections = socket(server);
const nsp = connections.of('/sockettesting');

nsp.on("connection", function (_) {

    _.on('join-room', (payload) => {
        // console.log("User" + payload.name + 'join')
        _.join(payload.room);
        // console.log('new-user-join emit')
        _.to(payload.room).emit('new-user-join', payload)
    })

    _.on('send-new-message', payload => {
        // console.log('new-message', payload)
        // console.log(payload.room.roomId)
        _.to(payload.room).emit('recive-new-message', payload)
    })

    _.on('signal', payload => {
        console.log(payload)
        _.to(payload.room).emit('signaling_message', payload)
    })

})