/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');


var cfg = require('./config');

var app = express();


// all environments
app.set('port', process.env.PORT || cfg.port);
app.use(express.bodyParser());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//-----------------------------------------------------------------//
// WEB GUI
//-----------------------------------------------------------------//
//var _events = require('./routes/event');
//app.get('/events', _medias.findAll);
//app.post('/events', _medias.addMedia);
//app.get('/events/random', _medias.findRandom);
//app.get('/events/:id', _medias.findById);
//app.delete('/events/:id', _medias.deleteMedia);
//app.put('/events/:id', _medias.updateMedia);
//app.post('/events/:id/uploadFile', _medias.uploadFile);


//-----------------------------------------------------------------//
// API
//-----------------------------------------------------------------//
var _eventsAPI = require('./routes/eventAPI');
//_eventsAPI.zmpDealerSetPort(cfg.dealerPort);
//_eventsAPI.zmqDealerStart();


app.get('/API/events', _eventsAPI.findAllEvents);
app.post('/API/events', _eventsAPI.addEvent);
app.post('/API/events/random', _eventsAPI.addEventRandom);

app.get('/API/events/types/:type', _eventsAPI.findEventsByType);
app.get('/API/events/to/:to', _eventsAPI.findEventsByTo);
app.get('/API/events/from/:from', _eventsAPI.findEventsByFrom);
app.get('/API/events/:id', _eventsAPI.findEventsById);
app.delete('/API/events', _eventsAPI.deleteAllEvents);
app.delete('/API/events/types/:type', _eventsAPI.deleteEventsByType);
app.delete('/API/events/to/:to', _eventsAPI.deleteEventsByTo);
app.delete('/API/events/from/:from', _eventsAPI.deleteEventsByFrom);
app.post('/API/events/ids/delete', _eventsAPI.deleteEventsByIds);   // POST with ids = ["43ff5033-0229-4aae-bd2e-4df45c93230a","c9c9862b-74ea-4e86-b395-ba6e7ada06bd"]
app.delete('/API/events/:id', _eventsAPI.deleteEventsById);


//PING
app.get('/API/ping', function (req, res) {
    var value = {};
    res.json(value);
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('myeventConcentrator server listening on port ' + app.get('port'));
});
