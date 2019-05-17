import React from 'react';
import './App.css';
import Canvas from './components/canvas';
import { setModeToView, setModeToDraw } from './Events';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <h1>SKETCH</h1>
        <div>
          <button onClick={beginDrawing}>
            draw
          </button>
          <button>see random sketch</button>
        </div>
        <Canvas startDraw={beginDrawing}/>
      </header>
    </div>
  );
}

function beginDrawing() {

  console.log('hi ur drawing arent you');
  setModeToDraw.invoke();

}

export default App;
