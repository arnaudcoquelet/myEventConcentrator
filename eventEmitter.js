var zmq = require("zmq");
port = 'tcp://127.0.0.1:12345';

var eventType = ['type1','type2',,'type3'];
var eventAction = ['action1','action2','action3'];

var socket = zmq.socket('dealer');
var count = 1;
  socket.identity = 'client' + process.pid;

  socket.bind(port, function(err) {
    if (err) throw err;
    console.log('bound!');

    setInterval(function() {
      var eventData = {
          from: '1901' + (100 + Math.floor(Math.random()*900)).toString(),
          to: '1902' + (100 + Math.floor(Math.random()*900)).toString(),
          type: eventType[Math.floor(Math.random()*2)],
          action: eventAction[Math.floor(Math.random()*2)],
          msg : 'This is a test event #'  + count++,
        }

        var EventDataTxt = JSON.stringify(eventData) ;
      console.log(socket.identity + ' sending: ');
      console.log(EventDataTxt );
      socket.send(EventDataTxt );
    }, 5000);
  });
