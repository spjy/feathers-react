import React, { Component } from 'react';
import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import auth from '@feathersjs/authentication-client';
import socketio from '@feathersjs/socketio-client';
import io from 'socket.io-client';
//import localStorage from 'feathers-localstorage';

import logo from './logo.svg';
import './App.css';

const app = feathers();
app.configure(auth({
  storageKey: 'authKey',
  storage: window.localStorage
}));

const socket = io('http://localhost:3030');

app.configure(socketio(socket))

const restClient = rest('http://localhost:3030');

class App extends Component {

  state = {
    messages: [],
    email: '',
    password: '',
  }

  componentDidMount() {
    //app.configure(restClient.fetch(window.fetch));

    const { authKey } = window.localStorage;

    console.log(authKey)

    app.authenticate({
      strategy: 'jwt',
      accessToken: authKey
    }).then(response => {
      const messages = app.service('messages');

      messages.find().then(res => {
        console.log(res)
        this.setState({ messages: res.data })
      });

      socket.on('messages created', message => {
        console.log(message);
      })
    }).catch(err => {
      console.log(err)
    });
  }

  login(e) {
    e.preventDefault()
    app.authenticate({
      strategy: 'local',
      email: this.state.email,
      password: this.state.password
    }).then(res => {
      console.log('logged in breh', res)
      const messages = app.service('messages');

      messages.find().then(res => {
        console.log(res)
        this.setState({ messages: res.data })
      });
      app.service('authentication').create({ Authorization: res.accessToken })

      return app.passport.verifyJWT(res.accessToken);
    }).catch(err => {
      console.error('Authentication error', err);
    });
  }

  emailChange(e) {
    this.setState({ email: e.target.value });
  }

  passwordChange(e) {
    this.setState({ password: e.target.value });
  }

  newMessage(e) {
    e.preventDefault();
    console.log(e.target.msg.value)
    app.service('messages').create({ text: e.target.msg.value });
  }

  logout(e) {
    app.logout();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Feathers</h1>
          <button onClick={this.logout.bind(this)}>Logout</button>
        </header>
        <br />
        <form action="" onSubmit={this.newMessage.bind(this)}>
          <input id="msg" type="text" />
          <button type="submit">Enter</button>
        </form>
        {this.state.messages.length !== 0 ? this.state.messages.map((message, i) => {
          return (
            <div key={i}>{message.text}</div>
          );
        }) : <div></div>}
        <form onSubmit={this.login.bind(this)}>
          Email: <input type="text" onChange={this.emailChange.bind(this)} value={this.state.email} />
          <br /><br />
          Password: <input type="text" onChange={this.passwordChange.bind(this)} value={this.state.password} />
          <br /><br />
          <button>Submit</button>
        </form>
      </div>
    );
  }
}

export default App;
