import React from 'react';
import './App.css';
import Canvas from './components/canvas';
import { setModeToDraw, viewRandom, viewAll } from './Events';
import SketchList from './components/SketchList/SketchList';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <h1>SKETCH</h1>
      </header>
      <div>

        <button 
          onClick={() => setModeToDraw.invoke()}>
          draw
        </button>

      </div>
      <div className="app-body">
        <SketchList />
        <Canvas />
      </div>
    </div>
  );
}

export default App;