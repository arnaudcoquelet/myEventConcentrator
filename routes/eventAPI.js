var uuid = require('node-uuid');
var dateFormat = require('dateformat');

//-----------------------------------------------------------------------------------------------
// EJDB
//-----------------------------------------------------------------------------------------------
var mongojs = require('mongojs');
var _db = mongojs('mydb', ['events']);

var _dbEventSave = function(data){
  if(_db){
    _db.events.save(data, function(err, saved) {
      if( err || !saved ) {
        console.error(err);
        return;
      }
    });
  }
};

var _dbEventGet = function(filter, next){
  if(_db){
    if(filter === null) {filter = {};}

    _db.events.find(filter).sort(
      {"creation_date" : 1},
      function(err, docs) {
        //if (err) {
        //    console.error(err);
        //    return;
        //}

        var listEvent = [];
        if( err || !docs) {
        }
        else{
          docs.forEach( function(eventData) {
            //console.log(eventData);
            listEvent.push(eventData);
          });
        }

        //console.log("Found " + listEvent.length + " event(s):");
        //console.log(listEvent);
        if(next){
          next(listEvent);
        }
      }
    );
  }
};

var _dbEventGetAll = function(next){ _dbEventGet({}, next); };
var _dbEventGetByType = function(type, next){ _dbEventGet({'type' : type}, next); };
var _dbEventGetById = function(id, next){ _dbEventGet({'id' : id}, next); };
var _dbEventGetByTo = function(id, next){ _dbEventGet({'to' : id}, next); };
var _dbEventGetByFrom = function(id, next){ _dbEventGet({'from' : id}, next); };


var _dbEventDelete = function(filter, next){
  if(_db){
    if(filter === null) {filter = {};}

    //console.log(filter);

    _db.events.remove(filter,
            function(err, doc) {
              if(next){
                  next(err);
                }
            });
  }
};

var _dbEventDeleteAll = function(next){
  if(_db){
    _db.events.remove(
            function(err, doc) {
              if(next){
                  next(err);
                }
            });
  }
};

//var _dbEventDeleteAll = function(id, next){ _dbEventDelete({}, next); };
var _dbEventDeleteById = function(id, next){ _dbEventDelete({'id' : id}, next); };
var _dbEventDeleteByType = function(type, next){ _dbEventDelete({'type' : type}, next); };
var _dbEventDeleteByFrom = function(from, next){ _dbEventDelete({'from' : from}, next); };
var _dbEventDeleteByTo = function(to, next){ _dbEventDelete({'to' : to}, next); };
var _dbEventDeleteByIds = function(ids, next){ _dbEventDelete({'id' :  {$in : ids} }, next); };


var _dbEventAdd = function(eventData, next){
  if(_db){
    _db.events.save(eventData,
            function(err, doc) {
              if(next){
                  next(err);
                }
            });
  }
};

//-----------------------------------------------------------------------------------------------
// ZMQ
//-----------------------------------------------------------------------------------------------

var _zmq = require('zmq');
var _zmqDealerPort = null;

var _zmqDealerSocket = _zmq.socket('dealer');
exports.zmqDealerSocket = _zmqDealerSocket;

var _zmpDealerSetPort = function(port) { _zmqDealerPort = port; };
exports.zmqDealerPort = _zmqDealerPort;

var _zmqDealerStart = function() {
  if(_zmqDealerPort !== null){
    _zmqDealerSocket.identity = 'eventAPI-ZMQDealer-' + process.pid;
    _zmqDealerSocket.bind(_zmqDealerPort, function(err) {
      if (err) throw err;
      //console.log( _zmqDealerSocket.identity + ' connected');
    });
  }
};
exports.zmqDealerStart = _zmqDealerStart;

var _zmqDealerSend = function(eventData) {
  if(_zmqDealerPort !== null){
    var EventDataTxt = JSON.stringify(eventData) ;
    //console.log(_zmqDealerSocket.identity + ' sending: ');
    //console.log(EventDataTxt );
    _zmqDealerSocket.send(EventDataTxt );
  }
};
exports.zmqDealerSend = _zmqDealerSend;


//-----------------------------------------------------------------------------------------------
// Event API
//-----------------------------------------------------------------------------------------------

//FIND
var _findAllEvents = function (req, res) {
  _dbEventGetAll(function (events) {
        if (events && events.length >= 0) {
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
  var type = req.params.type;
  _dbEventGetByType(type, function (events) {
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


var _findEventsById = function (req, res) {
  var id = req.params.id;
  _dbEventGetById(id, function (events){ 
        if (events && events.length > 0) {
            res.send(events);
        }
        else {
          res.statusCode = 404;
          return res.send('Error 404: No event found');
        }
  });
};
exports.findEventsById = _findEventsById;


var _findEventsByTo = function (req, res) {
  var to = req.params.to;
  _dbEventGetByTo(to, function (events){ 
        if (events && events.length > 0) {
            res.send(events);
        }
        else {
          res.statusCode = 404;
          return res.send('Error 404: No event found');
        }
  });
};
exports.findEventsByTo = _findEventsByTo;

var _findEventsByFrom = function (req, res) {
  var from = req.params.from;
  _dbEventGetByFrom(from, function (events){ 
        if (events && events.length > 0) {
            res.send(events);
        }
        else {
          res.statusCode = 404;
          return res.send('Error 404: No event found');
        }
  });
};
exports.findEventsByFrom = _findEventsByFrom;


//DELETE
exports.deleteAllEvents = function(req,res){
  _dbEventDeleteAll( function (err){ 
        if (err) {
          res.statusCode = 404;
          return res.send(err);
        }

        return res.send(200);
  });
};

exports.deleteEventsById = function(req,res){
  var id = req.params.id;
  _dbEventDeleteById(id, function (err){ 
        if (err) {
          res.statusCode = 404;
          return res.send(err);
        }

        return res.send(200);
  });
};

exports.deleteEventsByType = function(req,res){
  var type = req.params.type;
  _dbEventDeleteByType(type, function (err){ 
        if (err) {
          res.statusCode = 404;
          return res.send(err);
        }

        return res.send(200);
  });
};

exports.deleteEventsByFrom = function(req,res){
  var from = req.params.from;
  _dbEventDeleteByFrom(from, function (err){ 
        if (err) {
          res.statusCode = 404;
          return res.send(err);
        }

        return res.send(200);
  });
};

exports.deleteEventsByTo= function(req,res){
  var to = req.params.to;
  _dbEventDeleteByTo(to, function (err){ 
        if (err) {
          res.statusCode = 404;
          return res.send(err);
        }

        return res.send(200);
  });
};

//Delete multiple Events in one request
exports.deleteEventsByIds= function(req,res){
  console.log(req.body);
  console.log(req.body.ids);


  if(!req.body.hasOwnProperty('ids') ) {
      res.statusCode = 400;
      return res.send('Error 400: Post syntax incorrect.');
  }
  
  var ids = req.body.ids;
  //console.log(ids);
  //console.log(ids.length);

  _dbEventDeleteByIds(ids, function (err){ 
        if (err) {
          res.statusCode = 404;
          return res.send(err);
        }

        return res.send(200);
  });
};


//ADD
exports.addEvent = function(req, res) {
//console.log(req.body);

    if(!req.body.hasOwnProperty('from') ||
       !req.body.hasOwnProperty('to')   ||
       !req.body.hasOwnProperty('type') ||
       !req.body.hasOwnProperty('action') ||
       !req.body.hasOwnProperty('msg')    )
    {
      res.statusCode = 400;
      return res.send('Error 400: Post syntax incorrect.');
    }

    var eventData = {
          id : uuid.v4(),
          from: req.body.from,
          to: req.body.to,
          type: req.body.type,
          ation: req.body.action,
          creation_date : new Date(),
          deletion_date : null,
          msg : req.body.msg,
    };

  _dbEventAdd(eventData, function (err){ 
        if (err) {
          res.statusCode = 404;
          return res.send(err);
        }

        return res.send(200);
  });
};

exports.addEventRandom = function(req, res) {
  var eventData = {
          id : uuid.v4(),
          from: '1901' + (100 + Math.floor(Math.random()*900)).toString(),
          to: '1902' + (100 + Math.floor(Math.random()*900)).toString(),
          type: 'Random',
          action: 'RandomAction',
          creation_date : new Date(),
          deletion_date : null,
          msg : 'This is a test event #Random',
        };

  _dbEventAdd(eventData, function (err){ 
        if (err) {
          res.statusCode = 404;
          return res.send(err);
        }

        return res.send(200);
  });
};

exports.updateEvent = function(req, res) {

};

