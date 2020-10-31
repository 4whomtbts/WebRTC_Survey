const wsModule = require("ws");

module.exports = function (_server) {
    const wss = new wsModule.Server({ server: _server });

    wss.on('connection', (ws ,wq) => {
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(ip + "로 부터 접속 요청 수신");

        ws.on('message', (message) => {
            console.log(ip + "에서 전송한 메세지 =>", message);
            ws.send('ack');
        })

        ws.on('error', (error) => {
            console.log(ip + "와 연결 중 오류 발생 ["+err+"]");
        })

        ws.on('close', () => {
            console.log(ip + "와 접속이 끊어졌습니다.");
        });
    })
}

