import React, { useState, useEffect } from 'react';

function Canvas() {

    const [canvasNode, setCanvasNode] = useState(null);

    useEffect(() => {
        console.log("canvas node is now ", canvasNode);

        if (canvasNode != null) {
            console.log('setting interval on canvas');
            setInterval(updateCanvas(), 60);
        }

    }, [canvasNode])

  return (
    <div>
        <canvas ref={node => setCanvasNode(node)} className="canvas"/>
    </div>
  );
}

const updateCanvas = (canvas) => () => {

    console.log('updating canvas...');

}

export default Canvas;
