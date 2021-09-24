const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utills/messages');
const {
   userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require('./utills/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set foler saticc
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Rock bot';

// Run when client connects
io.on('connection', socket => {
   socket.on('joinRoom', ({username, room}) => {
   const user = userJoin(socket.id, username, room);


 socket.join(user.room);

    // run when someoe conencst
    socket.emit('message', formatMessage(botName, 'Welcome to Rock'));
    
    // broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', 
    formatMessage(botName, `${user.username} joined the chat`));
 
 
  //  send users room infio
  io.to(user.room).emit('roomUsers',{
    room: user.room,
    users: getRoomUsers(user.room)
  });

 
  });


  // Listen for chatMessage
  socket.on('chatMessage', msg => {
const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message',  formatMessage(user.username ,msg));
  });

  // runs when client disconnet
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
    if(user) {
        io.to(user.room).emit('message', 
         formatMessage(botName, `${user.username} 
        left the room `)
        );


  //  send users room infio
  io.to(user.room).emit('roomUsers',{
    room: user.room,
    users: getRoomUsers(user.room)
  });


      }

    
});
});


    
const PORT = 8008 || process.env.PORT;

server.listen(PORT, () => console.log(`server running on port ${PORT}`)); 