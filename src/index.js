const express = require('express')
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

/* -- */

function sendStats (socket) {
  socket.emit('stats', [{name: 'test', value: 123}])
}

io.on('connection', (socket) => {
  console.log('User connected.')

  sendStats(socket)

  socket.on('disconnect', () => {
    console.log('User disconnected.')
  })
})

/* -- */

app.use(express.static('web'))

app.get('/', (req, res) => {
  res.sendfile('index.html')
})

http.listen(3000, () => {
  console.log('listening on *:3000')
})
