var uuid = require('node-uuid');
var dateFormat = require('dateformat');

//-----------------------------------------------------------------------------------------------
// EJDB
//-----------------------------------------------------------------------------------------------
var EJDB = require("ejdb");
var _jb = EJDB.open("events", EJDB.DEFAULT_OPEN_MODE);

var _jbEventSave = function(data){
  if(_jb){
    _jb.save("event", [data], function(err, oids) {
          if (err) {
            console.error('EJBD Save Events: ' + err);
            return;
          }
        });
  }
};

var _jbEventGet = function(filter, next){
  if(_jb){
    if(filter === null) {filter = {};}

    _jb.find("event", filter, {"$orderby" : {"creation_date" : 1}},
            function(err, cursor, count) {
                if (err) {
                    console.error(err);
                    return;
                }

                var listEvent = [];

                console.log("Found " + count + " events");
                while (cursor.next()) {
                  var eventData = {
                    id : cursor.field("id"),
                    from: cursor.field("from"),
                    to: cursor.field("to"),
                    type: cursor.field("type"),
                    creation_date : cursor.field("creation_date"),
                    deletion_date : cursor.field("deletion_date"),
                    msg : cursor.field("msg"),
                  };

                  listEvent.push(eventdata);
                }
                cursor.close(); //It's not mandatory to close cursor explicitly
                //_jb.close(); //Close database

                console.log("Found " + listEvent.count + " event(s):");
                console.log(listEvent);

                if(next){
                  next(listEvent);
                }
            });
  }
};

var _jbEventGetAll = function(next){ _jbEventGet({}, next); };


//-----------------------------------------------------------------------------------------------
// ZMQ
//-----------------------------------------------------------------------------------------------
var _zmq = require('zmq');

//ZMQ Router
var _zmqRouterPort = null;
var _zmqRouterSocket = _zmq.socket('router');
exports.zmqRouterSocket = _zmqRouterSocket;

var _zmqRouterSetPort = function(port) {_zmqRouterPort = port;};
exports.zmqRouterSetPort = _zmqRouterSetPort;

var _zmqRouterStart = function() {
  if(_zmqRouterPort !== null){
    _zmqRouterSocket.identity = 'eventAPI-ZMQRouter-' + process.pid;
    _zmqRouterSocket.connect(_zmqRouterPort);
    console.log( _zmqRouterSocket.identity + ' connected');
  }
};
exports.zmqRouterStart = _zmqRouterStart;

var _zmqRouterStop = function() {
  if(_zmqRouterPort !== null && _zmqRouterSocket !== null ){
    //_zmqRouterSocket.
    console.log( _zmqRouterSocket.identity + ' closed');
  }
};
exports.zmqRouterStop = _zmqRouterStop;

var _zmqRouterNewEvent = function(envelope, data) {

        console.log('new event');
        console.log(_zmqRouterSocket.identity + ' received: ' + data.toString());
        console.log(eventData);

        var jsonData = JSON.parse(data);

        var eventData = {
          id : uuid.v4(),
          from: (typeof jsonData.from === 'undefined') ? _zmqRouterSocket.identity : jsonData.from,
          to: (typeof jsonData.to === 'undefined') ? '' : jsonData.to,
          type: (typeof jsonData.type === 'undefined') ? '' : jsonData.type,
          creation_date : new Date(),
          deletion_date : null,
          msg : (typeof jsonData.msg === 'undefined') ? data : jsonData.msg,
        };

        console.log(_zmqRouterSocket.identity + ' received: ' + data.toString());
        console.log(eventData);

        _zmqPublisherPublish(eventData);

        _jbEventSave(eventData);
};
exports.zmqRouterNewEvent = _zmqRouterNewEvent;


//ZMQ Publisher
var _zmqPublisherPort = null;
var _zmqPublisherSocket = _zmq.socket('pub');

var _zmqPublisherSetPort = function(port) {_zmqPublisherPort = port; };
exports.zmqPublisherSetPort = _zmqPublisherSetPort;


var _zmqPublisherStart = function() {
  if(_zmqPublisherPort !== null){
    _zmqPublisherSocket.identity = 'eventAPI-ZMQPublisher-' + process.pid;
    _zmqPublisherSocket.bind(_zmqPublisherPort, function(err) {
      if (err) throw err;
      console.log(_zmqPublisherSocket.identity + ' bound');
    });
  }
};
exports.zmqPublisherStart = _zmqPublisherStart;

var _zmqPublisherStop = function() {
  if(_zmqPublisherPort !== null && _zmqPublisherSocket !== null ){
    //_zmqPublisherSocket.
    console.log( _zmqPublisherSocket.identity + ' closed');
  }
};
exports.zmqPublisherStop = _zmqPublisherStop;

var _zmqPublisherPublish = function(data) {
  if(_zmqPublisherPort !== null && _zmqPublisherSocket !== null ){
    _zmqPublisherSocket.send(data);
  }
};
exports.zmqPublisherPublish = _zmqPublisherPublish;


//-----------------------------------------------------------------------------------------------
// Event API
//-----------------------------------------------------------------------------------------------
var _findAllEvents = function (req, res) {
  _jbEventGetAll(function (events) {
        if (events && events.length > 0) {
            res.send(events);
        }
        else {
          res.statusCode = 404;
          return res.send('Error 404: No event found');
        }
    });
};
exports.findAllEvents = _findAllEvents;


var _findEventsByType = function (req, res) {
  var type = '';
  var filter = {'type': type};
  _jbEventGet(filter, function (events){ 
        if (events && events.length > 0) {
            res.send(events);
        }
        else {
          res.statusCode = 404;
          return res.send('Error 404: No event found');
        }
  });
};
exports.findEventsByType = _findEventsByType;


var _findEventById = function (req, res) {
  var id = '';
  var filter = {'id': id};
  _jbEventGet(filter, function (events){ 
        if (events && events.length > 0) {
            res.send(events);
        }
        else {
          res.statusCode = 404;
          return res.send('Error 404: No event found');
        }
  });
};
exports.findEventById = _findEventById;


exports.findRandom = function(req, res) {
    var id = Math.floor(Math.random() * medias.length);
    res.send(medias[id]);
};

exports.addEvent = function(req, res) {

};

exports.deleteEvent = function(req,res){

};

exports.updateEvent = function(req, res) {

};