import React from 'react'
import ReactDOM from 'react-dom'

import io from 'socket.io-client'

class App extends React.Component {
  constructor () {
    super()

    this.state = {
      stats: []
    }

    this.socket = io()

    this.socket.on('stats', (stats) => {
      this.setState({
        stats
      })
    })
  }

  getChildContext () {
    return {
      socket: this.socket
    }
  }

  render () {
    return (
      <ul>
        {this.state.stats.map((stat) => {
          return (
            <li key={stat.name}>
              {stat.name}: {stat.value}
            </li>
          )
        })}
      </ul>
    )
  }
}

App.childContextTypes = {
  socket: React.PropTypes.object
}

ReactDOM.render(<App />, document.getElementById('app'))
