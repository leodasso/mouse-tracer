import React, { Component } from 'react';
import './Sketch.css';

class Sketch extends Component {

  render() {

    const sketch = this.props.sketchData;

    return (
      
      <div className="sketch-element">
        <p>{sketch.path.length} points</p>
        <p>{sketch.timestamp}</p>
        <p>IP: {sketch.ip}</p>
        <button>Add</button>
      </div>
    );
  }
}

export default Sketch;