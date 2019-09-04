import React from 'react';
import io from 'socket.io-client';
import logo from './logo.svg';
import ableton_logo from './ableton_logo.png';


// Audio related components
import AudioPad from './components/AudioPad'

import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';

import './App.css';


// for later
import WebMidi from 'webmidi';
WebMidi.enable(function (err) {
 
  if (err) {
    console.log("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled!");
  }
});


const socket = io('http://192.168.1.5:5000/test')


export function sendMidiEvent(note_on, pitch, velocity, channel=0) {
  socket.emit('midi_event', { 
    raw: [note_on, pitch, velocity],
    channel: channel
  });
}

class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {

    switch (this.state.isToggleOn) {
      case true: {
        socket.emit('midi_event', { midi: [144, 60, 100]});
        break
      }
      default: {
        socket.emit('midi_event', { midi: [128, 60, 100]});
      }
    }
    
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'MIDI ON' : 'MIDI OFF'}
      </button>
    );
  }
}

class Clock extends React.Component {

  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}



class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      socketId: 'none'
    };
  }

  componentDidMount() {
    socket.on('connect', function() {
      console.log('connected')
    });

    socket.on('on_connect', () => {
      console.log(socket.id)
      console.log(socket.connected)


      this.setState({
        socketId: socket.id
      })
      
      socket.emit('my_event', {data: 'I\'m connected!'});
    })
  }

  render() {

    const firstNote = MidiNumbers.fromNote('c3');
    const lastNote = MidiNumbers.fromNote('c5');
    const keyboardShortcuts = KeyboardShortcuts.create({
      firstNote: firstNote,
      lastNote: lastNote,
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });

    return (
    <div className="App">
      <header className="App-header">
        <img src={ableton_logo} className="App-logo" alt="logo" />
        {/* <p>
          SocketID: <code>{this.state.socketId}</code>
        </p> */}
         <div>
          <AudioPad keyCode={36} keyUp={false} color={"#d127d1"} volume={0.3}>Kick</AudioPad>
          <AudioPad keyCode={38} keyUp={false} color={"#d127d1"} volume={0.3}>Snare</AudioPad>
          <AudioPad keyCode={42} keyUp={false} color={"#d127d1"} volume={0.3}>Hihat</AudioPad>
        </div>

        <div>
          <Piano
            noteRange={{ first: firstNote, last: lastNote }}
            playNote={(midiNumber) => {
              sendMidiEvent(144, midiNumber, 127);
              console.log(midiNumber);
              // Play a given note - see notes below
            }}
            stopNote={(midiNumber) => {
              // Stop playing a given note - see notes below
              sendMidiEvent(128, midiNumber, 127);
            }}
            width={1000}
            keyboardShortcuts={keyboardShortcuts}
          />
        </div>
        
        {/* <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
      </header>
    </div>
    )
  }
}

export default App;
