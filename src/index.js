'use strict'

const express = require('express')
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const PORT = 4000

const events = require('events')
const net = require('net')
const tls = require('tls')

class Bot extends events.EventEmitter {
  constructor () {
    super()

    this.settings = require('../settings.json')
    this.buffer = new Buffer('')
    this.setStatus('initialised')
  }

  setStatus (update) {
    this.status = update

    console.log(`Status: ${update}`)
  }

  connect () {
    this.setStatus('connecting...')

    const options = {
      host: this.settings.host,
      port: this.settings.port
    }

    const connect = this.settings.SSL
      ? tls.connect
      : net.connect

    this.socket = connect(options, () => {
      this.setStatus('authenticating...')

      this.socket.addListener('data', this.data.bind(this))

      if (this.settings.SASL) {
        this.send('CAP REQ :sasl')
      } else if (this.settings.password) {
        this.send('PASS', this.settings.password)
      }

      this.send('NICK', this.settings.nick)
      this.send('USER', this.settings.ident, 8, '*', this.settings.realname)

      this.setStatus('authenticated')
    })
  }

  send () {
    let parts = Array.prototype.slice.call(arguments)

    this.socket && this.socket.write(parts.join(' ') + '\r\n')
  }

  data (chunk) {
    if (typeof chunk === 'string') {
      this.buffer += chunk
    } else {
      this.buffer = Buffer.concat([this.buffer, chunk])
    }

    let lines = this.buffer.toString().split(/\r\n|\r|\n/)

    if (lines.pop()) return

    this.buffer = new Buffer('')

    for (let i in lines) {
      const [
        sender,
        nick,
        ident,
        host,
        command,
        dest,
        message
      ] = /^(?::(([^@! ]+)!?([^@ ]+)?@?([^ ]+)?))? ?([^ ]+) ?([^: ]*) :?(.*)?$/.exec(lines[i])

      console.log(lines[i])
    }
  }
}

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

/* -- */

const bot = new Bot()

bot.connect()
