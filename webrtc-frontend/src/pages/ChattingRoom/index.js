import React, { useEffect, useState } from "react";
// import { socketIo } from '../../utils/socketIO'

import socketClient from "socket.io-client";
const SERVER = "http://localhost:3000/sockettesting";
const roomId = "ee34iniasnnn5o2";
const user = Math.floor(Math.random() * 10000);
const socketIOInstance = socketClient(SERVER, { transports: ["websocket"] });

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const constrains = {
  audio: false,
  video: true,
};
let rtcPeerConnection;
let localVideoEmelemt;
let remoteVideoEmelemt;
let inboundStream = null;

function ChattingRoom(props) {
  useEffect(() => {
    localVideoEmelemt = document.getElementById("local_video");
    joinRoom();
    newUserJoin();
    // messageListner();

    socketIOInstance.emit("signal", {
      type: "user",
      room: roomId,
    });

    socketIOInstance.on("signaling_message", (data) => {
      console.log("rtcPeerConnection", rtcPeerConnection);
      if (!rtcPeerConnection) startSingling();
      console.log("data.type=>", data.type);
      if (data.type != "user") {
        let message = JSON.parse(data.message);
        console.log("message=>", message);
        if (message.sdp) {
          rtcPeerConnection.setRemoteDescription(
            new RTCSessionDescription(message.sdp),
            function () {
              console.log(
                "rtcPeerConnection.remoteDescription=>",
                rtcPeerConnection.remoteDescription
              );
              if (rtcPeerConnection.remoteDescription.type == "offer") {
                rtcPeerConnection.createAnswer(sendLocalDesc, logError);
              }
            },
            logError
          );
        } else {
          rtcPeerConnection.addIceCandidate(
            new RTCIceCandidate(message.candidate)
          );
        }
      }
    });
  }, []);

  function newUserJoin(params) {
    socketIOInstance.on("new-user-join", (data) => {
      console.log(data);
    });
  }

  function joinRoom(params) {
    socketIOInstance.emit("join-room", {
      name: user,
      room: roomId,
    });
  }

  // peer to peer connection functions
  function startSingling(params) {
    rtcPeerConnection = new window.RTCPeerConnection(configuration);

    //send any ice candidate to other peer
    rtcPeerConnection.onicecandidate = function (evt) {
      console.log("onicecandidate");
      if (evt.candidate) {
        console.log("evt.candidate=>", evt.candidate);
        socketIOInstance.emit("signal", {
          type: "ice candidate",
          message: JSON.stringify({
            candidate: evt.candidate,
          }),
          room: roomId,
        });
      }
    };

    // let negotiationneeded event  trigger offer generation
    rtcPeerConnection.onnegotiationneeded = function () {
      console.log("onnegotiationneeded");
      rtcPeerConnection.createOffer(sendLocalDesc, logError);
    };

    //once remote stream arrive show the stream in remote video
    // rtcPeerConnection.ontrack = function (evt) {
    //   console.log("ontrack");
    //   console.log("evt", evt);
    //   console.log("evt.stream", evt.streams);
    //   console.log("evt.track", evt.track);
    //   console.log("remoteVideoEmelemt=>", remoteVideoEmelemt);
    //   remoteVideoEmelemt.srcObject = evt.track;
    //   remoteVideoEmelemt.play();
    // };

    rtcPeerConnection.ontrack = ({ track, streams }) => {
      remoteVideoEmelemt = document.getElementById("remote_video");
      console.log("streams", streams);
      console.log("remoteVideoEmelemt.srcObject", remoteVideoEmelemt.srcObject);
      if (remoteVideoEmelemt.srcObject) return;
      remoteVideoEmelemt.srcObject = streams[0];
      console.log("remoteVideoEmelemt.srcObject", remoteVideoEmelemt.srcObject);
      remoteVideoEmelemt.play();
      //   console.log("ev=>", ev);
      //   if (ev.streams && ev.streams[0]) {
      //     remoteVideoEmelemt.srcObject = ev.streams[0];
      //     remoteVideoEmelemt.play();
      //   } else {
      //     if (!inboundStream) {
      //       console.log("ev=>if");
      //       inboundStream = new MediaStream();
      //       console.log("remoteVideoEmelemt", remoteVideoEmelemt);
      //       console.log("inboundStream", inboundStream);
      //       remoteVideoEmelemt.srcObject = inboundStream;
      //       remoteVideoEmelemt.play();
      //     } else {
      //       remoteVideoEmelemt.srcObject = inboundStream;
      //       remoteVideoEmelemt.play();
      //     }
      //     inboundStream.addTrack(ev.track);
      //   }
    };

    navigator.mediaDevices.getUserMedia(constrains).then((stream) => {
      console.log("getUserMedia");
      console.log("getUserMedia stream", stream);
      localVideoEmelemt.srcObject = stream;
      localVideoEmelemt.play();
      //   console.log(stream.getTracks()[0]);
      //   console.log("stream", stream);
      for (const track of stream.getTracks()) {
        rtcPeerConnection.addTrack(track, stream);
      }
      //   for (const track of stream.getTracks()) {
      //     console.log(track);
      //   rtcPeerConnection.addTrack(stream);
      //   rtcPeerConnection.addTrack(stream);
      //   }
      // rtcPeerConnection.addTrack(stream.getTracks())
    }, logError);
  }

  function sendLocalDesc(desc) {
    console.log("sendLocalDesc");
    console.log("desc", desc);
    rtcPeerConnection.setLocalDescription(
      desc,
      function () {
        console.log("sendLocalDesc fun");
        socketIOInstance.emit(
          "signal",
          {
            type: "SDP",
            message: JSON.stringify({
              sdp: rtcPeerConnection.localDescription,
            }),
            room: roomId,
          },
          logError
        );
      },
      logError
    );
  }

  function logError(error) {
    console.log(error);
  }

  //   const [message, setMessage] = useState("");

  //   function handleSendMessage() {
  //     socketIOInstance.emit("send-new-message", {
  //       name: user,
  //       message,
  //       room: roomId,
  //     });
  //   }

  //   function messageListner() {
  //     socketIOInstance.on("recive-new-message", (data) => {
  //       console.log(data);
  //     });
  //   }

  return (
    <div>
      <div>
        {/* <input value={message} onChange={(e) => setMessage(e.target.value)} /> */}
        {/* <button onClick={handleSendMessage}>Send message</button> */}
        <video id="local_video"></video>
        <video id="remote_video"></video>
      </div>
    </div>
  );
}

export default ChattingRoom;
