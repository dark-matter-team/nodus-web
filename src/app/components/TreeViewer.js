'use client'; 

import { useState } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 1. Статичні дані з вашого ТЗ
const initialNodes = [
  {
    id: '1', 
    position: { x: 250, y: 50 }, 
    data: { 
      label: 'Базовий синтаксис Python',
      title: 'Базовий синтаксис Python', 
      description: 'Вивчення змінних, циклів, умов та функцій.', 
      category: 'Theory',
      checklist: [
        'Встановити Python та VS Code',
        'Розібрати типи даних (int, str, list, dict)',
        'Написати 5 простих функцій із циклами'
      ] 
    }
  },
  {
    id: '2', 
    position: { x: 250, y: 250 }, 
    data: { 
      label: 'Робота з бібліотекою Pandas',
      title: 'Робота з бібліотекою Pandas', 
      description: 'Завантаження таблиць CSV та фільтрація даних.', 
      category: 'Practice',
      checklist: [
        'Встановити бібліотеку pandas',
        'Завантажити датасет через read_csv()',
        'Відфільтрувати порожні значення в таблиці'
      ] 
    }
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' }
];

export default function TreeViewer() {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (event, node) => {
    setSelectedNode(node.data);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        onNodeClick={handleNodeClick}
        nodesDraggable={false} 
        fitView
        colorMode="dark"
      >
        <Background />
        <Controls />
      </ReactFlow>

      
      {selectedNode && (
        <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 text-white shadow-2xl p-6 z-10 border-l border-gray-700 flex flex-col">
          
          {}
          <button 
            onClick={() => setSelectedNode(null)}
            className="self-end text-gray-400 hover:text-white mb-4 text-xl font-bold"
          >
            ✕
          </button>
          
          <h2 className="text-2xl font-bold mb-2">{selectedNode.title}</h2>
          
          <span className="inline-block bg-blue-600 text-xs px-2 py-1 rounded-full mb-4 w-max">
            {selectedNode.category}
          </span>
          
          <p className="text-gray-300 mb-6">{selectedNode.description}</p>
          
          <h3 className="text-lg font-semibold mb-3">Чек-лист:</h3>
          <ul className="space-y-2">
            {selectedNode.checklist.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <span className="text-sm text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}