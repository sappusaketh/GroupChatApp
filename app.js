var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require("fs");
// var firebase = require('firebase');
// firebase.initializeApp({
//     databaseURL: 'https://*****.firebaseio.com',
//     serviceAccount: 'myapp-13ad200fc320.json', //this is file that I downloaded from Firebase Console
// });

var io = require('socket.io')(http);
// var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database('chat.db');
var insertData;
var dataMain = {}
// dataMain= JSON.parse(dataMain);
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/',function(req,res){
    res.sendfile('index.html');
});

app.get('/usageForAdmin',function(req,res){
    res.json(dataMain);
});
io.on('connection',function(socket){
  var user="";
  var channel="";
  var msgObj={};
  socket.on('connectUser',function(data){
    user=data.name;
    channel=data.channel;
    var msgArray=[];
    socket.join(data.channel);
    if(dataMain[data.channel] != undefined){
      msgArray = dataMain[data.channel];
    }else {
      console.log(data.channel);
      msgArray = undefined;
    }
      console.log(dataMain);
    // db.serialize(function() {
    //   var createStr="CREATE TABLE if not exists "+channel+" (name TEXT,message TEXT)";
    //   db.run(createStr);
    // });
    // db.all("SELECT * FROM "+channel, function(err, row) {
    //     console.log(row);
    //
    //     var initialData={
    //       'name':data.name,
    //       'msgArray':row,
    //       'notification':"Welcome "+data.name+" !!"
    //     }
    //     socket.emit('notification',initialData);
    //     socket.broadcast.to(data.channel).emit('notification',data.name+' connected');
    // });
    var initialData={
      'name':data.name,
      'msgArray':msgArray,
      'notification':"Welcome "+data.name+" !!",
        "ArrayUpdate":true
    }
    socket.emit('notification',initialData);
      socket.broadcast.to(data.channel).emit('notification',{'notification':data.name+' connected'});

  });
  socket.on('msg',function(data){
    if(dataMain[channel] == undefined){
     dataMain[channel] = [];
    }
    console.log(dataMain);
   msgObj={
      'name':data.name,
      'message':data.message
    }

    dataMain[channel].push(msgObj);
    console.log(dataMain);
  // db.serialize(function() {
  //       var insertStr="INSERT INTO  "+channel+" (name,message) VALUES ('"+msgObj.name+"','"+msgObj.message+"')";
  //       console.log(insertStr);
  //       db.run(insertStr);
  //   });
    socket.broadcast.to(channel).emit('msg', msgObj);
    msgObj={};
  })
  socket.on('disconnect',function(){
    var userDetails={
      'name':user,
      'msgArray':undefined,
      'notification':""+user+" has left !!",
      "ArrayUpdate":false
    }
    socket.broadcast.to(channel).emit('notification',userDetails)
  })
})
http.listen(process.env.PORT || 3000, function(){
  console.log('listening on', http.address().port);
});
