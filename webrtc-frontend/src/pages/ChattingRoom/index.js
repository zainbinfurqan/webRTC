import React, { useEffect, useState } from 'react';
// import { socketIo } from '../../utils/socketIO'

import socketClient from 'socket.io-client';
const SERVER = "http://localhost:3000/sockettesting";
const roomId = 'ee34iniasnnn5o2'
const user = Math.floor(Math.random() * 10000)
const socketIOInstance = socketClient(SERVER, { transports: ['websocket'] })

const configuration = {
    iceServers: [{
        url: ['stun:stun.l.google.com:19302']
    }]
}
const constrains = {
    audio: false,
    video: true
};
let rtcPeerConnection;
let localVideoEmelemt;
let remoteVideoEmelemt;

function ChattingRoom(props) {

    useEffect(() => {
        localVideoEmelemt = document.getElementById("local_video")
        remoteVideoEmelemt = document.getElementById("remote_video")
        // socketIo.connection()
        joinRoom()
        messageListner()
        newUserJoin()

        socketIOInstance.emit('signal', {
            room: roomId,
        })

        socketIOInstance.on('signaling_message', (data) => {
            if (!rtcPeerConnection)
                startSingling();
        })

    }, [])

    function newUserJoin(params) {
        socketIOInstance.on('new-user-join', (data) => {
            console.log(data)
        })
    }

    function joinRoom(params) {
        socketIOInstance.emit('join-room', {
            name: user,
            room: roomId
        })

    }

    function startSingling(params) {
        rtcPeerConnection = new window.RTCPeerConnection(configuration);

        rtcPeerConnection.onicecandidate = function name(evt) {
            console.log('onicecandidate')
            if (evt.candidate)
                socketIOInstance.emit('signal', {
                    type: 'ice candidate', message: JSON.stringify({
                        'candidate': evt.candidate
                    }), room: roomId
                })
        }

        rtcPeerConnection.onnegotiationneeded = function () {
            console.log('onnegotiationneeded')
            rtcPeerConnection.createOffer(sendLocalDesc, logError)
        }

        navigator.mediaDevices.getUserMedia(constrains).then(stream => {
            console.log('getUserMedia')
            localVideoEmelemt.srcObject = stream;
            localVideoEmelemt.play()
            console.log(stream.getTracks())
            for (const track of stream.getTracks()) {
                console.log(track)
                rtcPeerConnection.addTrack(track);
            }
            // rtcPeerConnection.addTrack(stream.getTracks())
        }, logError)

        rtcPeerConnection.ontrack = function (evt) {
            console.log('ontrack')
            console.log('evt.stream', evt.stream)
            remoteVideoEmelemt.srcObject = evt.stream;
            remoteVideoEmelemt.play()
        }
    }

    function sendLocalDesc(desc) {
        console.log('sendLocalDesc')
        rtcPeerConnection.setLocalDescription(desc, function (params) {
            socketIOInstance.emit('signal', {
                type: 'SDP', message: JSON.stringify({
                    'sdp': rtcPeerConnection.localDescription
                }), room: roomId
            })
        }, logError);
    }

    function logError(error) {
        console.log(error)
    }

    const [message, setMessage] = useState('')

    function handleSendMessage() {
        socketIOInstance.emit('send-new-message', {
            name: user,
            message,
            room: roomId
        })
    }

    function messageListner() {
        socketIOInstance.on('recive-new-message', (data) => {
            console.log(data)
        })
    }

    return (
        <div>
            <div>
                <input value={message} onChange={e => setMessage(e.target.value)} />
                <button onClick={handleSendMessage}>Send message</button>
                <video id="local_video"></video>
                <video id="remote_video"></video>
            </div>
        </div>
    );
}

export default ChattingRoom;