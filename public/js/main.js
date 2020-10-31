
const callButton = document.getElementById('call_btn');
var webSocket = new WebSocket("ws://14.4.229.130:8000");
var video = document.querySelector('video');
var photo = document.getElementById('photo');
var photoContextW, photoContextH;
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');
const caller = new RTCPeerConnection();
const callee = new RTCPeerConnection();

let mySDP;
caller.createOffer().then((sdp) => {
    mySDP = sdp;
});

callButton.onclick = (e) => {
    const input = document.getElementById('callee_ip');
    const requestCallMessage = {
        type: 'video-call',
        callee: input.value,
        sdp: mySDP
    };
    webSocket.send(JSON.stringify(requestCallMessage));
};

webSocket.onmessage = (e) => {
    console.log('서버로 부터 데이터 수신' + JSON.stringify(e));
    grabWebCamVideo();
};


function grabWebCamVideo() {
    console.log('Getting user media (video) ...');
    console.log('미디어디바이스 = ', navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    })
        .then(gotStream)
        .catch(function(e) {
            alert('getUserMedia() error: ' + e.name);
        });
}
function gotStream(stream) {
    console.log('getUserMedia video stream URL:', stream);
    window.stream = stream; // stream available to console
    video.srcObject = stream;
}


navigator.getUserMedia({
    video: true,
    audio: false
}, getUserMediaSuccess, getUserMediaError);

function getUserMediaSuccess(mediaStream){
    localVideo.srcObject = mediaStream;
    caller.addStream(mediaStream); //미디어 스트림 입력
    createOffer();
}

function getUserMediaError(e){
    console.log(e);
}

function createOffer(){
    caller.createOffer()
        .then((sdp)=>createOfferSuccess)
        .catch(err=>createOfferError);
}

function createOfferError(e){
    console.log(e);
}

function createOfferSuccess(sdp){
    caller.setLocalDescription(sdp);
    sendOffer(sdp); //send sdp to callee
}

function sendOffer(sdp){
    callee.setRemoteDescription(sdp);
    createAnswer();
}

function createAnswer(){
    callee.createAnswer()
        .then(()=>createAnswerSuccess)
        .catch(err=> createAnswerError);
}

function createAnswerError(e){
    console.log(e);
}

function createAnswerSuccess(sdp){
    callee.setLocalDescription(sdp);
    sendAnswer(sdp)// send SDP to Caller
}

function sendAnswer(sdp){
    caller.setRemoteDescription(sdp);
}

caller.onicecandidat = handlerCallerOnicecandidate;
callee.onicecandidat = handlerCalleeOnicecandidate;

function handlerCallerOnicecandidate(e){
    if(e.candidate) callee.addIceCandidate(e.candidate);
}

function handlerCalleeOnicecandidate(e){
    if(e.candidate) caller.addIceCandidate(e.candidate);
}

callee.onaddstream = handleCalleeOnAddStream;

function handleCalleeOnAddStream(e){
    remoteVideo.srcObject = e.stream
}

