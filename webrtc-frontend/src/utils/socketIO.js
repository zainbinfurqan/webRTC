import socketClient from 'socket.io-client';
const SERVER = "http://localhost:3000/sockettesting";
const roomId = 'ee34iniasnnn5o2'
export const socketIo = {}
let socketIOInstance = null

socketIo.connection = () => {
    socketIOInstance = socketClient(SERVER, { transports: ['websocket'] })
}

socketIo.emit = (name, data) => {
    socketIOInstance.emit(name, data)
}

socketIo.on = (name,) => {
    console.log(name)
    return socketIOInstance.on(name, (data) => {
        return data
    })
}

socketIo.configKeys = () => {
    return {
        roomId,
        socketIOInstance,
        SERVER
    }
}