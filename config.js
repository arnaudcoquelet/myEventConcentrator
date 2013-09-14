var web_configuration = {
    public_url: 'http://10.118.204.93',
    port: '8084'
};


//ZMQ
var zmq_configuration = {
    dealerPort : 'tcp://127.0.0.1:12345',
};
exports.dealerPort = zmq_configuration.dealerPort;



//Web server
exports.public_url = web_configuration.public_url;
exports.port = web_configuration.port;

exports.locals = {
        title        : 'myEventConcentrator',
        description  : 'A Event Concentrator/Distributor for MyIC Phone',
        author       : 'A. Coquelet',
        _layoutFile: true
};


