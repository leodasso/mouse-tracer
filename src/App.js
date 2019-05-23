import React from 'react';
import './App.css';
import Canvas from './components/canvas';
import { setModeToDraw, viewRandom, viewAll } from './Events';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <h1>SKETCH</h1>
        <div>

          <button 
            onClick={() => setModeToDraw.invoke()}>
            draw
          </button>

          <button
            onClick={() => viewRandom.invoke()}>
            see random sketch
          </button>

          <button
            onClick={() => viewAll.invoke()}>
            see all sketches
          </button>

        </div>
        <Canvas />
      </header>
    </div>
  );
}

export default App;