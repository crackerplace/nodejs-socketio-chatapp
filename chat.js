var http = require('http');
var url = require('url');
var fs = require('fs');
var server;
var people = {};


server = http.createServer(function(req, res){
    // your normal server code
    var path = url.parse(req.url).pathname;
    switch (path){
        case '/':
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<h1>Hello! Try the <a href="/chat.html">Test page</a></h1>');
            res.end();
            break;
        case '/chat.html':
            fs.readFile(__dirname + path, function(err, data){
                if (err){ 
                    return send404(res);
                }
                res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'});
                res.write(data, 'utf8');
                res.end();
            });
        break;
        default: send404(res);
    }
}),

send404 = function(res){
    res.writeHead(404);
    res.write('404');
    res.end();
};

server.listen(8001);

// use socket.io
var io = require('socket.io').listen(server);

//turn off debug
io.set('log level', 1);

// define interactions with client
io.sockets.on('connection', function(socket){
    socket.on("join", function(name){
		people[socket.id] = name;
		socket.emit("update", "You have connected to the server.");
		io.sockets.emit("update", name + " has joined the server.")
		io.sockets.emit("update-people", people);
	});

	socket.on("send", function(msg){
		io.sockets.emit("chat", people[socket.id], msg);
	});

	socket.on("disconnect", function(){
		io.sockets.emit("update", people[socket.id] + " has left the server.");
		delete people[socket.id];
		io.sockets.emit("update-people", people);
	});
});