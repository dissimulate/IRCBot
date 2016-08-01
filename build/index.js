'use strict'

const express = require('express')
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const PORT = 4000

const events = require('events')

class Bot extends events.EventEmitter {
  constructor () {
    super()

    this.settings = require('../settings.json')
  }
}

const bot = new Bot()

/* -- */

io.on('connection', (socket) => {
  console.log('User connected.')

  socket.on('stats', (data) => {
    socket.emit('stats', [{name: 'test', value: bot.settings.test}])
  })

  socket.on('disconnect', () => {
    console.log('User disconnected.')
  })
})

/* -- */

app.use(express.static('web'))

app.get('/', (req, res) => {
  res.sendfile('index.html')
})

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`)
})
