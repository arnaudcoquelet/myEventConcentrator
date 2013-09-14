  var zmq = require('zmq');
  var socketRouter = zmq.socket('router');
  var portRouter = 'tcp://127.0.0.1:12345';
  var portPublisher = 'tcp://127.0.0.1:12346';

  var EJDB = require("ejdb");
  var jb = EJDB.open("events", EJDB.DEFAULT_OPEN_MODE | EJDB.JBOTRUNC | EJDB.JBOCREAT);

  var databaseUrl = "mydb"; // "username:password@example.com/mydb"
  var collections = ["events"];
  var db = require("mongojs").connect(databaseUrl, collections);

  var uuid = require('node-uuid');

	var socketPublisher = zmq.socket('pub');
	socketPublisher.identity = 'publisher' + process.pid;

	socketPublisher.bind(portPublisher, function(err) {
    		if (err) throw err;
		console.log('bound!');
	});



  socketRouter.identity = 'server' + process.pid;
  socketRouter.connect(portRouter);
  console.log('connected!');


  socketRouter.on('message', function(envelope, data) {
        var jsonData = JSON.parse(data);
        //var jsonData = data;

        var eventData = {
          id : uuid.v4(),
          from: (typeof jsonData.from === 'undefined') ? socketRouter.identity : jsonData.from,
          to: (typeof jsonData.to === 'undefined') ? '' : jsonData.to,
          type: (typeof jsonData.type === 'undefined') ? '' : jsonData.type,
          action: (typeof jsonData.action === 'undefined') ? '' : jsonData.action,
          creation_date : new Date(),
          deletion_date : null,
          msg : (typeof jsonData.msg === 'undefined') ? data : jsonData.msg,
        }

        console.log(socketRouter.identity + ': received ' + data.toString());
        console.log(eventData);

        socketPublisher.send(eventData);

        db.events.save(eventData, function(err, saved) {
          if( err || !saved ) {
            console.error(err);
            return;
          }
        });
	});
