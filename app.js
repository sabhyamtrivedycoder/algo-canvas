const ROWS = 20, COLS = 30;
let grid = [], startNode = { r: 10, c: 5 }, targetNode = { r: 10, c: 24 }, isVisualizing = false, isMouseDown = false;
let audioCtx = null;
function playTone(freq) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  } catch(e) {}
}
function initGrid() {
  const container = document.getElementById('gridContainer');
  container.innerHTML = ''; grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const el = document.createElement('div');
      el.className = 'node';
      if (r === startNode.r && c === startNode.c) el.classList.add('start');
      else if (r === targetNode.r && c === targetNode.c) el.classList.add('target');
      el.addEventListener('mousedown', () => { if (!isVisualizing) { isMouseDown = true; toggleWall(r, c); } });
      el.addEventListener('mouseenter', () => { if (isMouseDown && !isVisualizing) toggleWall(r, c); });
      container.appendChild(el);
      row.push({ r, c, isWall: false, visited: false, prev: null, el });
    }
    grid.push(row);
  }
  document.addEventListener('mouseup', () => { isMouseDown = false; });
}
function toggleWall(r, c) {
  if ((r === startNode.r && c === startNode.c) || (r === targetNode.r && c === targetNode.c)) return;
  grid[r][c].isWall = !grid[r][c].isWall;
  grid[r][c].el.classList.toggle('wall', grid[r][c].isWall);
  playTone(220);
}
function clearGrid() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c].visited = false; grid[r][c].prev = null;
      grid[r][c].el.classList.remove('visited', 'path');
    }
  }
  document.getElementById('nodesVisited').textContent = '0';
  document.getElementById('pathLength').textContent = '0';
  document.getElementById('execTime').textContent = '0 ms';
}
function resetGrid() {
  clearGrid();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c].isWall = false; grid[r][c].el.classList.remove('wall');
    }
  }
}
function randomMaze() {
  clearGrid();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if ((r === startNode.r && c === startNode.c) || (r === targetNode.r && c === targetNode.c)) continue;
      const isWall = Math.random() < 0.28;
      grid[r][c].isWall = isWall;
      grid[r][c].el.classList.toggle('wall', isWall);
    }
  }
}
async function runAStar() {
  clearGrid(); isVisualizing = true;
  const startT = performance.now();
  const open = [{ r: startNode.r, c: startNode.c, f: 0, g: 0 }];
  const closed = new Set();
  const speed = 105 - parseInt(document.getElementById('speedRange').value);
  let explored = 0;
  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const curr = open.shift();
    const key = `${curr.r},${curr.c}`;
    if (closed.has(key)) continue;
    closed.add(key); explored++;
    if (curr.r === targetNode.r && curr.c === targetNode.c) {
      document.getElementById('execTime').textContent = `${(performance.now() - startT).toFixed(1)} ms`;
      let p = curr, len = 0;
      while (p) {
        if (!(p.r === startNode.r && p.c === startNode.c) && !(p.r === targetNode.r && p.c === targetNode.c)) {
          grid[p.r][p.c].el.classList.add('path');
          playTone(450 + len * 20);
          await new Promise(res => setTimeout(res, 30));
        }
        len++; p = grid[p.r][p.c].prev;
      }
      document.getElementById('pathLength').textContent = len;
      isVisualizing = false; return;
    }
    if (!(curr.r === startNode.r && curr.c === startNode.c)) {
      grid[curr.r][curr.c].el.classList.add('visited');
      playTone(280 + (explored % 30) * 15);
      document.getElementById('nodesVisited').textContent = explored;
      await new Promise(r => setTimeout(r, speed));
    }
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = curr.r + dr, nc = curr.c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (grid[nr][nc].isWall || closed.has(`${nr},${nc}`)) continue;
      const g = curr.g + 1;
      const h = Math.abs(nr - targetNode.r) + Math.abs(nc - targetNode.c);
      grid[nr][nc].prev = curr;
      open.push({ r: nr, c: nc, f: g + h, g });
    }
  }
  isVisualizing = false;
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
  initGrid();
  document.getElementById('algoSelect').addEventListener('change', (e) => {
    document.getElementById('algoLabel').textContent = e.target.options[e.target.selectedIndex].text;
  });
  document.getElementById('runBtn').addEventListener('click', runAStar);
  document.getElementById('clearBtn').addEventListener('click', resetGrid);
  document.getElementById('mazeBtn').addEventListener('click', randomMaze);
});
}
if (typeof module !== 'undefined') module.exports = { ROWS, COLS };