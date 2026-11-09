"use strict";

/* =========================================================
   Nodi Space — landing page
   Структура файлу:
   1. Допоміжні константи
   2. Зоряне небо (canvas)
   3. Дерево навичок (SVG, малюється з даних)
   4. Паралакс від миші
   5. Підсвітка кнопки для ОС користувача
   6. Ініціалізація
   ========================================================= */

/* ---------- 1. Допоміжні константи ---------- */
const SVG_NS = "http://www.w3.org/2000/svg";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Створює SVG-елемент із заданими атрибутами. */
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    el.setAttribute(name, value);
  }
  return el;
}

/* ---------- 2. Зоряне небо ---------- */
/**
 * Малює мерехтливі зірки на <canvas>.
 * @param {HTMLCanvasElement} canvas
 * @param {{density?: number, maxRadius?: number, color?: string}} options
 *   density — кількість зірок на 1 px² (0.0001 ≈ 1 зірка на 10 000 px²)
 */
function createStarfield(canvas, { density = 0.00012, maxRadius = 1.4, color = "255,255,255" } = {}) {
  const ctx = canvas.getContext("2d");
  let stars = [];
  let width = 0;
  let height = 0;
  let rafId = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(width * height * density);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * maxRadius + 0.3,
      base: Math.random() * 0.5 + 0.3, // базова яскравість
      speed: Math.random() * 1.5 + 0.5, // швидкість мерехтіння
      phase: Math.random() * Math.PI * 2, // зсув фази, щоб зірки блимали не синхронно
    }));
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      const twinkle = reduceMotion.matches ? 0 : Math.sin((time / 1000) * s.speed + s.phase) * 0.3;
      const alpha = Math.max(0.05, s.base + twinkle);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${alpha.toFixed(2)})`;
      ctx.fill();
    }
  }

  function loop(time) {
    draw(time);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(rafId);
    draw(performance.now());
    if (!reduceMotion.matches && !document.hidden) {
      rafId = requestAnimationFrame(loop);
    }
  }

  new ResizeObserver(() => {
    resize();
    start();
  }).observe(canvas);

  // Не палимо процесор, коли вкладка неактивна
  document.addEventListener("visibilitychange", start);
}

/* ---------- 3. Дерево навичок ---------- */
/**
 * Дані дерева. Координати — у системі viewBox="0 0 620 400".
 * Щоб змінити дерево, достатньо відредагувати ці два масиви.
 */
const SKILL_TREE = {
  nodes: [
    { id: "core", type: "core", x: 110, y: 209 },
    { id: "a", x: 207, y: 208, tone: "violet" },
    { id: "b", x: 271, y: 118, tone: "violet" },
    { id: "c", x: 330, y: 208, tone: "violet" },
    { id: "d", x: 265, y: 291, tone: "violet" },
    { id: "e", x: 364, y: 291, tone: "violet" },
    { id: "f", x: 430, y: 208, tone: "blue" },
    { id: "g", x: 527, y: 208, tone: "blue" },
  ],
  // [звідки, куди, стиль лінії]
  edges: [
    ["core", "a", "solid"],
    ["a", "b", "dotted"],
    ["a", "c", "dotted"],
    ["a", "d", "dotted"],
    ["b", "c", "dotted"],
    ["d", "c", "dotted"],
    ["d", "e", "dotted"],
    ["e", "f", "dotted"],
    ["c", "f", "dashdot"],
    ["f", "g", "dashed"],
  ],
};

const STAR_OUTER_R = 19;
const STAR_INNER_R = 8;
const CORE_R = 38;
const EDGE_GAP = 6; // відступ лінії від краю вузла

/** Координати вершин п'ятикутної зірки (10 точок: зовнішня/внутрішня по черзі). */
function starPoints(cx, cy, outer, inner) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2; // починаємо з верхньої вершини
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}

function renderSkillTree(svg, tree) {
  const byId = new Map(tree.nodes.map((n) => [n.id, n]));
  const radiusOf = (n) => (n.type === "core" ? CORE_R : STAR_OUTER_R);

  // <defs>: стрілка на кінці лінії
  const defs = svgEl("defs");
  const marker = svgEl("marker", {
    id: "arrow",
    viewBox: "0 0 10 10",
    refX: "9",
    refY: "5",
    markerWidth: "7",
    markerHeight: "7",
    markerUnits: "userSpaceOnUse",
    orient: "auto",
  });
  marker.append(svgEl("path", { d: "M0 1 L10 5 L0 9 z", fill: "#d9c4ff" }));
  defs.append(marker);
  svg.append(defs);

  // Лінії малюємо першими, щоб вузли були поверх
  const edgesLayer = svgEl("g");
  const edgeEls = [];

  for (const [fromId, toId, style] of tree.edges) {
    const from = byId.get(fromId);
    const to = byId.get(toId);

    // Вектор від A до B та його довжина
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;

    // Скорочуємо відрізок з обох боків на радіус вузла + відступ
    const startOffset = radiusOf(from) + EDGE_GAP;
    const endOffset = radiusOf(to) + EDGE_GAP;

    const line = svgEl("line", {
      class: `edge edge--${style}`,
      x1: (from.x + ux * startOffset).toFixed(2),
      y1: (from.y + uy * startOffset).toFixed(2),
      x2: (to.x - ux * endOffset).toFixed(2),
      y2: (to.y - uy * endOffset).toFixed(2),
      "marker-end": "url(#arrow)",
    });
    edgesLayer.append(line);
    edgeEls.push({ line, fromId, toId });
  }
  svg.append(edgesLayer);

  // Вузли
  const unlocked = new Set(["core"]); // ядро завжди "розблоковане"

  function refreshEdges() {
    for (const { line, fromId, toId } of edgeEls) {
      line.classList.toggle("is-active", unlocked.has(fromId) && unlocked.has(toId));
    }
  }

  for (const node of tree.nodes) {
    if (node.type === "core") {
      const g = svgEl("g", { class: "node node--core" });
      g.append(
        svgEl("image", {
          href: "assets/logo.svg",
          x: node.x - CORE_R,
          y: node.y - CORE_R,
          width: CORE_R * 2,
          height: CORE_R * 2,
        })
      );
      svg.append(g);
      continue;
    }

    const g = svgEl("g", {
      class: `node node--${node.tone}`,
      tabindex: "0",
      role: "button",
      "aria-pressed": "false",
      "aria-label": `Skill ${node.id.toUpperCase()}`,
    });
    g.append(
      svgEl("polygon", {
        class: "star",
        points: starPoints(node.x, node.y, STAR_OUTER_R, STAR_INNER_R),
      })
    );

    const toggle = () => {
      const isOn = g.classList.toggle("is-unlocked");
      g.setAttribute("aria-pressed", String(isOn));
      if (isOn) unlocked.add(node.id);
      else unlocked.delete(node.id);
      refreshEdges();
    };

    g.addEventListener("click", toggle);
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    svg.append(g);
  }

  refreshEdges();
}

/* ---------- 4. Паралакс від миші ---------- */
function initParallax(container) {
  const canFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!container || !canFinePointer || reduceMotion.matches) return;

  window.addEventListener(
    "pointermove",
    (e) => {
      // Нормалізуємо координати миші до діапазону [-1; 1]
      const px = (e.clientX / window.innerWidth - 0.5) * 2;
      const py = (e.clientY / window.innerHeight - 0.5) * 2;
      container.style.setProperty("--px", px.toFixed(3));
      container.style.setProperty("--py", py.toFixed(3));
    },
    { passive: true }
  );
}

/* ---------- 5. Підсвітка кнопки для ОС користувача ---------- */
function highlightDesktopButton() {
  const platform = (navigator.userAgentData?.platform || navigator.platform || "").toLowerCase();
  let target = null;
  if (platform.includes("win")) target = "windows";
  else if (platform.includes("mac")) target = "macos";

  if (target) {
    document.querySelector(`[data-platform="${target}"]`)?.classList.add("is-recommended");
  }
}

/* ---------- 6. Ініціалізація ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Велике зоряне небо на фоні
  createStarfield(document.getElementById("starfield"));

  // Дрібні зірки всередині картки прев'ю
  const previewStars = document.querySelector(".preview__stars");
  if (previewStars) {
    createStarfield(previewStars, { density: 0.0004, maxRadius: 1.1, color: "230,210,255" });
  }

  // Дерево навичок
  const tree = document.getElementById("skill-tree");
  if (tree) renderSkillTree(tree, SKILL_TREE);

  initParallax(document.querySelector(".hero__visual"));
  highlightDesktopButton();

  // Поки що посилання завантаження — заглушки: не стрибаємо на початок сторінки.
  // Видаліть цей блок, коли підставите реальні URL.
  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
  });
});
