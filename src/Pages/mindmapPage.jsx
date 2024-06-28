import react from 'react';
import reactflow from 'react-flow-renderer';

const element = [
    { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
    { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
    { id: 'e1-2', source: '1', target: '2', animated: true },
];

const FlowRenderer = () => {
    return (
        <div style={{ width: '100%', height: '600px' }}>
        <ReactFlow elements={element} />
        </div>
    )
}

export default FlowRenderer;