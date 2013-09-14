var zmq = require("zmq");
var port = 'tcp://127.0.0.1:12346';
var socket = zmq.socket('sub');
socket.identity = 'subscriber' + process.pid;
socket.connect(port);
  
socket.subscribe('');

console.log('connected!');

socket.on('message', function(data) {
    console.log(socket.identity + ': received data ' + data.toString());
});
