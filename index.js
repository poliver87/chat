var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg');

var pgPath = "postgres://poliver:p12507121@localhost/madlee";

app.get('/',function(req,res) {
    res.sendFile(__dirname+'/index.html');
});

io.on('connection',function(socket) {
    console.log(socket.id);
    pg.connect(pgPath,function(err,client,done) {
        if (err) {
            console.log('error connecting to db');
        } else {
            client.query("select * from message order by id;", function(err,result) {
                done();
                if (err) {
                    console.log("error with select query: "+ err);
                } else {
                    for (var i=0;i<result.rows.length;i++) {
                        socket.emit('chat message',result.rows[i].text);
                    }
                }
            });
        }
    });
    socket.on('disconnect',function() {
        console.log('user disconnected');
    });
    socket.on('chat message', function(msg) {
       console.log('message: '+msg);
        io.emit('chat message',msg);
        pg.connect(pgPath,function(err,client,done) {
            if (err) {
                console.log('error connecting to postgres: '+err);
            } else {
                client.query("insert into message(text) values('"+msg+"');",function(err,result) {
                    done();
                    if (err) {
                        console.log('error with query: '+err);
                    } else {

                    }
                });
            }
        });
    });
});

http.listen(3000,function() {
    console.log('listening on port 3000');
});