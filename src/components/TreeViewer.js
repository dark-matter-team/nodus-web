'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ReactFlow, Controls, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomStarNode from './CustomStarNode';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5033';

const nodeTypes = {
  customStar: CustomStarNode,
};

// Автоматична розкладка дерева по рівнях, якщо бекенд повернув координати (0, 0)
function calculateTreeLayout(apiNodes) {
  const nodeMap = new Map(apiNodes.map((n) => [n.id, n]));
  const childrenMap = new Map();
  const roots = [];

  for (const node of apiNodes) {
    if (node.parentNodeId && nodeMap.has(node.parentNodeId)) {
      if (!childrenMap.has(node.parentNodeId)) {
        childrenMap.set(node.parentNodeId, []);
      }
      childrenMap.get(node.parentNodeId).push(node);
    } else {
      roots.push(node);
    }
  }

  const levels = [];
  const visited = new Set();
  const queue = roots.map((node) => ({ node, depth: 0 }));

  while (queue.length > 0) {
    const { node, depth } = queue.shift();
    if (visited.has(node.id)) continue;
    visited.add(node.id);

    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);

    const children = childrenMap.get(node.id) || [];
    for (const child of children) {
      queue.push({ node: child, depth: depth + 1 });
    }
  }

  for (const node of apiNodes) {
    if (!visited.has(node.id)) {
      const depth = levels.length;
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(node);
    }
  }

  const positions = new Map();
  const horizontalGap = 240;
  const verticalGap = 180;

  levels.forEach((levelNodes, depth) => {
    const totalWidth = (levelNodes.length - 1) * horizontalGap;
    const startX = -totalWidth / 2;

    levelNodes.forEach((node, index) => {
      positions.set(node.id, {
        x: startX + index * horizontalGap,
        y: depth * verticalGap,
      });
    });
  });

  return positions;
}

export default function TreeViewer({ roadmapId }) {
  const [roadmap, setRoadmap] = useState(null);
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [loadedId, setLoadedId] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDark, setIsDark] = useState(true);

  const loading = Boolean(roadmapId) && loadedId !== roadmapId;
  const error = !roadmapId
    ? 'Не передано ID дерева в адресі сторінки.'
    : loadedId === roadmapId
      ? fetchError
      : null;

  useEffect(() => {
    if (!roadmapId) return;

    const controller = new AbortController();

    async function fetchRoadmap() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/public-roadmaps/${encodeURIComponent(roadmapId)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          let message = `Помилка завантаження (${response.status})`;
          try {
            const errBody = await response.json();
            if (errBody?.error) message = errBody.error;
          } catch {
            // Ігноруємо, якщо відповідь не JSON
          }
          throw new Error(message);
        }

        const data = await response.json();
        setRoadmap(data);

        const apiNodes = Array.isArray(data.nodes) ? data.nodes : [];
        const hasSavedPositions =
          apiNodes.length <= 1 ||
          apiNodes.some(
            (n) => (n.positionX ?? 0) !== 0 || (n.positionY ?? 0) !== 0
          );

        const autoPositions = hasSavedPositions
          ? null
          : calculateTreeLayout(apiNodes);

        const mappedNodes = apiNodes.map((node) => {
          const position = hasSavedPositions
            ? { x: node.positionX ?? 0, y: node.positionY ?? 0 }
            : autoPositions.get(node.id) || { x: 0, y: 0 };

          const sortedChecklist = Array.isArray(node.checklist)
            ? [...node.checklist].sort(
                (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
              )
            : [];

          return {
            id: node.id,
            position,
            data: {
              id: node.id,
              label: node.title,
              title: node.title,
              description: node.description || '',
              category: node.category || 'Theory',
              estimatedMinutes: node.estimatedMinutes ?? 0,
              status: node.status || 'Locked',
              checklist: sortedChecklist,
            },
          };
        });

        const nodeIds = new Set(apiNodes.map((n) => n.id));
        const mappedEdges = apiNodes
          .filter((node) => node.parentNodeId && nodeIds.has(node.parentNodeId))
          .map((node) => {
            const isAnimated = node.status === 'Available';
            return {
              id: `e-${node.parentNodeId}-${node.id}`,
              source: node.parentNodeId,
              target: node.id,
              animated: isAnimated,
              style: isAnimated
                ? { strokeWidth: 1.5, strokeDasharray: '5 5' }
                : { strokeWidth: 1.5, opacity: 0.6 },
            };
          });

        setRawNodes(mappedNodes);
        setRawEdges(mappedEdges);
        setFetchError(null);
        setSelectedNode(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setFetchError(err.message || 'Не вдалося з’єднатися з сервером.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadedId(roadmapId);
        }
      }
    }

    fetchRoadmap();

    return () => controller.abort();
  }, [roadmapId]);

  const nodesWithTheme = useMemo(
    () =>
      rawNodes.map((node) => ({
        ...node,
        type: 'customStar',
        data: { ...node.data, isDark },
      })),
    [rawNodes, isDark]
  );

  const edgesWithTheme = useMemo(
    () =>
      rawEdges.map((edge) => ({
        ...edge,
        style: { ...edge.style, stroke: isDark ? '#a855f7' : '#ffffff' },
        markerEnd: edge.animated
          ? { type: MarkerType.ArrowClosed, color: isDark ? '#a855f7' : '#ffffff' }
          : undefined,
      })),
    [rawEdges, isDark]
  );

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <div
      className={`h-screen w-screen relative overflow-hidden font-sans ${
        isDark ? 'dark' : ''
      }`}
    >
      {/* 1. Глибокий градієнтний фон */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark
            ? 'bg-[#0b0a3b] bg-[radial-gradient(circle_at_30%_38%,_#2b1366_0%,_#0b0a3b_100%)]'
            : 'bg-[#f08cf0] bg-[radial-gradient(circle_at_50%_50%,_#f08cf0_0%,_#d278ff_100%)]'
        }`}
      />

      {/* 2. Текстура космосу */}
      <div
        className={`absolute inset-0 bg-[url('/space.jpg')] bg-cover bg-center transition-all duration-700 pointer-events-none ${
          isDark
            ? 'opacity-30 mix-blend-screen'
            : 'opacity-10 mix-blend-overlay filter brightness-110 contrast-125'
        }`}
      />

      {/* Шапка дерева (з реальних даних API) */}
      {roadmap && (
        <div
          className={`absolute top-6 left-6 z-20 max-w-md px-5 py-3.5 rounded-2xl border backdrop-blur-xl transition-colors ${
            isDark
              ? 'bg-[#120d4d]/75 border-[#a855f7]/30 text-white'
              : 'bg-white/40 border-white/60 text-purple-950'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {roadmap.knowledgeLevel && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/30">
                {roadmap.knowledgeLevel}
              </span>
            )}
            {roadmap.authorNickname && (
              <span className="text-xs opacity-70">by {roadmap.authorNickname}</span>
            )}
          </div>
          <h1 className="text-lg font-bold leading-tight">{roadmap.title}</h1>
          {roadmap.publicDescription && (
            <p className="text-xs opacity-75 mt-1 line-clamp-2">
              {roadmap.publicDescription}
            </p>
          )}
        </div>
      )}

      {/* Кнопка теми */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`absolute bottom-6 left-20 z-20 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-opacity duration-300 hover:opacity-100 ${
          isDark ? 'text-gray-300 opacity-60' : 'text-purple-900 opacity-60'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-5 h-5"
          strokeWidth="2"
        >
          {isDark ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          )}
        </svg>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Стан завантаження */}
      {loading && (
        <div className="relative z-10 h-full w-full flex items-center justify-center">
          <div className="px-6 py-4 rounded-2xl bg-[#120d4d]/80 border border-[#a855f7]/30 backdrop-blur-xl text-white text-sm font-medium">
            Завантаження сузір&apos;я...
          </div>
        </div>
      )}

      {/* Стан помилки */}
      {!loading && error && (
        <div className="relative z-10 h-full w-full flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#120d4d]/85 border border-red-400/40 backdrop-blur-xl text-white text-center">
            <h2 className="text-lg font-bold mb-2">Не вдалося відкрити дерево</h2>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* Дерево вузлів */}
      {!loading && !error && (
        <ReactFlow
          key={roadmap?.id || roadmapId}
          style={{ background: 'transparent' }}
          nodes={nodesWithTheme}
          edges={edgesWithTheme}
          nodeTypes={memoizedNodeTypes}
          onNodeClick={(e, node) => setSelectedNode(node.data)}
          nodesDraggable={false}
          fitView
          colorMode={isDark ? 'dark' : 'light'}
          className="focus:outline-none"
        >
          <Controls
            position="bottom-right"
            className={
              isDark
                ? '!bg-[#151042] !border-[#a855f7]/30 !fill-white shadow-lg'
                : '!bg-white/40 !border-white/50 !fill-purple-900 shadow-lg backdrop-blur-md'
            }
          />
        </ReactFlow>
      )}

      {/* Бокова шторка */}
      {selectedNode && (
        <div
          className={`absolute top-6 right-6 bottom-6 w-[400px] z-20 flex flex-col p-8 rounded-2xl transition-all duration-300 border shadow-2xl backdrop-blur-xl ${
            isDark
              ? 'bg-[#120d4d]/85 border-[#a855f7]/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] text-white'
              : 'bg-white/30 border-white/60 shadow-[0_0_50px_rgba(255,255,255,0.4)] text-purple-950'
          }`}
        >
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md text-white ${
                  isDark
                    ? 'bg-gradient-to-r from-[#6a35c4] to-[#a25be0] shadow-[0_0_15px_rgba(140,80,255,0.4)]'
                    : 'bg-gradient-to-r from-purple-400 to-pink-400'
                }`}
              >
                {selectedNode.category}
              </span>
              {selectedNode.estimatedMinutes > 0 && (
                <span className="text-xs font-medium opacity-70">
                  ~{selectedNode.estimatedMinutes} хв
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
                  : 'bg-white/40 hover:bg-white/60 text-purple-900'
              }`}
            >
              ✕
            </button>
          </div>

          <h2 className="text-2xl font-extrabold mb-3 tracking-tight leading-tight">
            {selectedNode.title}
          </h2>
          <p
            className={`mb-8 leading-relaxed text-sm ${
              isDark ? 'opacity-80' : 'opacity-90 font-medium'
            }`}
          >
            {selectedNode.description}
          </p>

          <div className="flex-1 overflow-y-auto pr-2">
            <h3
              className={`text-xs font-bold mb-4 tracking-widest uppercase ${
                isDark ? 'opacity-50' : 'text-purple-900/60'
              }`}
            >
              Node Checklist
            </h3>
            {selectedNode.checklist?.length > 0 ? (
              <ul className="space-y-3">
                {selectedNode.checklist.map((item, index) => {
                  const title = typeof item === 'string' ? item : item.title;
                  const completed =
                    typeof item === 'string' ? false : Boolean(item.isCompleted);

                  return (
                    <li
                      key={item.id ?? index}
                      className={`flex items-start p-3.5 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-white/50 border-white/60 hover:bg-white/70'
                      }`}
                    >
                      <span
                        className={`mr-4 mt-0.5 text-base ${
                          completed
                            ? isDark
                              ? 'text-[#00f076] drop-shadow-[0_0_8px_rgba(0,240,118,0.4)]'
                              : 'text-green-600'
                            : 'opacity-40'
                        }`}
                      >
                        {completed ? '✔' : '○'}
                      </span>
                      <span
                        className={`text-sm font-medium leading-snug ${
                          completed ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm opacity-60">Чек-ліст порожній.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}