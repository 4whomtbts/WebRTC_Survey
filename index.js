const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

const http = require('http');
const server = http.Server(app);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
const port = 9000

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({ port: 8000 });
//const caller = new RTCPeerConnection();
//caller.createOffer().then((sdp) => console.log("SDP = ", sdp));
// 연결이 수립되면 클라이언트에 메시지를 전송하고 클라이언트로부터의 메시지를 수신한다

const hosts = [];
const clients = new Map();

wss.on("connection", (ws, req) => {

    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.toString().replace('::ffff:', '');
    clients.set(ip, ws);
    hosts.push(ip);
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        console.log(ip + "에서 전송한 메세지 =>", JSON.stringify(message));
        switch (parsedMessage.type) {
            case 'video-call':
                console.log('video-call 요청 수신');
                console.log('현재 연결된 호스트들 = ', hosts);
                if (hosts.includes(parsedMessage.callee)) {
                    console.log('상대방이 존재 =>', parsedMessage.callee);
                    const elem = clients.get(parsedMessage.callee);
                    elem.send('peer에 메세지 전송!');
                }
        }


    });

    ws.on('error', (error) => {
        console.log(ip + "와 연결 중 오류 발생 ["+err+"]");
    });

    ws.on('close', () => {
        console.log(ip + "와 접속이 끊어졌습니다.");
    });
});
