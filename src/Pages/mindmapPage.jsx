import React, { useEffect, useRef } from 'react';
import { dia, shapes } from 'jointjs';

export default function FlowRenderer() {
  const graph = useRef(null);
  const paper = useRef(null);
  const scroller = useRef(null);
  const paperEl = useRef(null);
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodePosition, setNodePosition] = useState({ x: 100, y: 100 });

  useEffect(() => {
    graph.current = new dia.Graph();
    paper.current = new dia.Paper({
      model: graph.current,
      frozen: true,
      async: true,
      width: '100%',
      height: '100%',
      gridSize: 10,
    });
    scroller.current = new ui.PaperScroller({
      paper: paper.current,
      autoResizePaper: true,
    });

    paperEl.current.appendChild(scroller.current.el);
    scroller.current.render().center();
    paper.current.unfreeze();

    return () => {
      scroller.current.remove();
      paper.current.remove();
    };
  }, []);

  const addNode = () => {
    const rect = new shapes.standard.Rectangle();
    rect.position(nodePosition.x, nodePosition.y);
    rect.resize(100, 40);
    rect.attr({
      body: {
        fill: 'blue'
      },
      label: {
        text: nodeLabel,
        fill: 'white'
      }
    });
    graph.current.addCell(rect);
  };

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Node Label"
          value={nodeLabel}
          onChange={(e) => setNodeLabel(e.target.value)}
        />
        <input
          type="number"
          placeholder="X Position"
          value={nodePosition.x}
          onChange={(e) => setNodePosition({ ...nodePosition, x: e.target.value })}
        />
        <input
          type="number"
          placeholder="Y Position"
          value={nodePosition.y}
          onChange={(e) => setNodePosition({ ...nodePosition, y: e.target.value })}
        />
        <button onClick={addNode}>Add Node</button>
      </div>
      <div id="paper" ref={paperEl} style={{ width: '100%', height: '500px', border: '1px solid black' }} />
    </div>
  );
};