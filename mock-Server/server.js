const http = require('http')
const socketio = require('socket.io')


const server = http.createServer((req, res) => {
    res.end("I am connected to the server");
})

const io = socketio(server);

io.on('connection', (socket, req) => {
    socket.emit('welcome', 'welcome this is from socket.io')
    socket.on('message', (msg) => {
        console.log(msg);
    })
    setTimeout(()=>{
        socket.emit('setTimeout',JSON.stringify({
            "created": [{
                "@id": "http://localhost:8080/...",
                "parent": {
                    "@id": "http://localhost:8080/..."
                }
            }]
        },
        {
            "modified": [{
                "@id": "http://localhost:8080/...",
                "parent": {
                    "@id": "http://localhost:8080/..."
                }
            }]
        },
        {
            "removed": [{
                "@id": "http://localhost:8080/...",
                "parent": {
                    "@id": "http://localhost:8080/..."
                }
            }]
        }))
    }, 5000)
})


server.listen(9000, () => {
    console.log("server is listening on port 9000");
})