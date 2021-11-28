navigator.mediaDevices.getUserMedia =
    navigator.mediaDevices.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
let localStreamingVideoelement = document.getElementById("localStreaming");
let localVideoSelectionOption = document.getElementById("cameraSelect");
let localChatArea = document.getElementById("chatArea");

// socket connection
const socket = io('http://localhost:3000/');
console.log("socket", socket)
// socket.on('connection', 'chat');
// socket.on('announce', function (data) {
//     displayMessage(data.message);
// })

function displayMessage(message) {
    localChatArea.innerHTML = localChatArea.innerHTML + "<br/>" + message
}

// socket connection

//for proile pic
let localProiflePicCanvas = document.getElementById("profilePicCanvas");
let localProfilePicOutput = document.getElementById("profilePicOutput");
let localTakeProilePicBtn = document.getElementById("takeProfilePic");

const constrains = {
    audio: false,
    video: {
        mandatory: {
            maxWidth: 640,
            maxHeight: 360,
        },
    },
};
let localMediaStream = null;
const width = 240;
let height = 0;
let isStreaming = false;

//listners
localTakeProilePicBtn.addEventListener(
    "click",
    (ev) => {
        takeProfilePic();
        ev.preventDefault();
    },
    false
);

localStreamingVideoelement.addEventListener("canplay", () => {
    if (!isStreaming) {
        height =
            localStreamingVideoelement.videoHeight /
            (localStreamingVideoelement.videoWidth / width);
        if (isNaN(height)) {
            height = width / (4 / 3);
        }
        localStreamingVideoelement.setAttribute("width", width);
        localStreamingVideoelement.setAttribute("height", height);
        localProiflePicCanvas.setAttribute("width", width);
        localProiflePicCanvas.setAttribute("height", height);
        isStreaming = true;
    }
});

localVideoSelectionOption.onchange = startStream;

//startStream();
//getCamerasList();

//functions

// function to get the local user media (audio, video)
async function getLocalUserMedia() {
    return await navigator.mediaDevices.getUserMedia(constrains);
}

// function to start the stream
async function startStream() {
    console.log("startStream");
    localStreamingVideoelement.srcObject = await getLocalUserMedia();
    localStreamingVideoelement.play();
}

// function to get the all camera list available or use
async function getCamerasList() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return;
    }
    const avaliableCamerMicList = await navigator.mediaDevices.enumerateDevices();

    avaliableCamerMicList.forEach(function (device) {
        let option = document.createElement("option");
        if (device.kind === "videoinput") {
            option.text = "camera" + localVideoSelectionOption.length + 1;
            option.value = "camera" + localVideoSelectionOption.length + 1;
            localVideoSelectionOption.appendChild(option);
        }
    });
}

async function takeProfilePic() {
    let context = localProiflePicCanvas.getContext("2d");
    console.log("context", context);
    console.log(width);
    console.log(height);
    if (width && height) {
        localProiflePicCanvas.width = width;
        localProiflePicCanvas.height = height;
        context.drawImage(localStreamingVideoelement, 0, 0, width, height);
        const profilePic = localProiflePicCanvas.toDataURL("image/png");
        localProfilePicOutput.setAttribute("src", profilePic);
    }
}
