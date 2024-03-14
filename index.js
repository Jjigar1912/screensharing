
const screenshot = require('screenshot-desktop');
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const fs = require('fs');

const app = express();
app.set('view engine','ejs')

app.use(express.static('public'))

const server = http.createServer(app);

const io = new Server(server);
let prev = null ; 
app.get('/',(req,res)=>{
    return res.render('index')
})
io.on('connection',(Socket)=>{
    
    console.log('a user connected.');
    
    Socket.join('screenshare');
    Socket.on('prevImage',(data)=>{
        prev = data ; 
    })
    const interval = setInterval(()=>{
        screenshot({format: 'png' , filename : './public/abc.png'}).then((img) => {
           
            fs.readFile(img,(error,data)=>{
                if(error){
                    return ; 
                }
                  const base64Image = Buffer.from(data).toString('base64');
                    
                  if(prev!==base64Image){
                    Socket.broadcast.to('screenshare').emit('message',base64Image);
        
                  }
             
        
            })
        }).catch((err) => {
            console.log(err);
        });
    },100)

    Socket.on('disconnect',()=>{
        console.log('A user disconnected.');
        clearInterval(interval);
    })

    Socket.emit('message');


})

app.get('/view',(req,res)=>{
    res.render('view');
});



server.listen(3000);