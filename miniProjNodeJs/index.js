var express = require("express");
var app = express();
var multer, storage, path, crypto;
multer = require('multer')
path = require('path');
crypto = require('crypto');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Import the mongoose module
var mongoose = require('mongoose')
const { ObjectId } = require("bson");

var mongoDb = 'mongodb://localhost:27017/jobber';
mongoose.connect(mongoDb, { useNewUrlParser: true });
//Get Mongoose to use the global promise library

mongoose.Promise = global.Promise;
// Get the default connection
var db = mongoose.connection;

//bind connection to error event ( to get notification of connection errors
db.on('error', console.error.bind(console, 'mongoDb connection error:'));


app.use(express.static(path.join(__dirname, 'public')));
app.listen(3000, function () {
  console.log("Connected okkk!!")
})

var form = "<!DOCTYPE HTML><html><body>" +
"<form method='post' action='/upload' enctype='multipart/form-data'>" +
"<input type='file' name='upload'/>" +
"<input type='submit' /></form>" +
"</body></html>";

app.get('/', function (req, res){
  res.writeHead(200, {'Content-Type': 'text/html' });
  res.end(form);

});

// Include the node file module
var fs = require('fs');

storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
      return crypto.pseudoRandomBytes(16, function(err, raw) {
        if (err) {
          return cb(err);
        }
        return cb(null, "" + (raw.toString('hex')) + (path.extname(file.originalname)));
      });
    }
  });


// Post files
app.post( "/upload",
  multer({
    storage: storage
  }).single('upload'), function(req, res) {
    console.log(req.file);
    console.log(req.body);
    res.redirect("/uploads/" + req.file.filename);
    console.log(req.file.filename);
    return res.status(200).end();
  });

app.get('/uploads/:upload', function (req, res){
  file = req.params.upload;
  console.log(req.params.upload);
  var img = fs.readFileSync(__dirname + "/uploads/" + file);
  res.writeHead(200, {'Content-Type': 'image/png' });
  res.end(img, 'binary');

});


var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/a',function(req,res){
    res.sendFile(__dirname+'/index.html');
})
io.on('connection',function(socket){
    console.log('one user connected '+socket.id);
    socket.on('message',function(data){
        var sockets = io.sockets.sockets;
        /*sockets.forEach(function(sock){
            if(sock.id != socket.id)
            {
                sock.emit('message',data);
            }
        })*/
        socket.broadcast.emit('message', data);
    })
    socket.on('disconnect',function(){
        console.log('one user disconnected '+socket.id);
    })
})
app.listen(3001);
