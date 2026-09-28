// Sudoku game: generates a puzzle with exactly one solution.

const boardEl = document.getElementById('board');
const padEl = document.getElementById('pad');
const msgEl = document.getElementById('message');
const timeEl = document.getElementById('time');
const levelEl = document.getElementById('level');

// How many cells to blank out for each difficulty
const LEVELS = { easy: 38, medium: 46, hard: 52 };

let solution, grid, given;
let selected = null;
let seconds = 0;
let timerId = null;
let won = false;

// ---------- Helpers ----------

const emptyGrid = () => Array.from({ length: 9 }, () => Array(9).fill(0));

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Is value v allowed at (r, c)? Checks row, column and 3x3 box,
// ignoring the cell itself.
function isValid(g, r, c, v) {
  for (let i = 0; i < 9; i++) {
    if (i !== c && g[r][i] === v) return false;
    if (i !== r && g[i][c] === v) return false;
  }
  const br = r - (r % 3);
  const bc = c - (c % 3);
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      if ((i !== r || j !== c) && g[i][j] === v) return false;
    }
  }
  return true;
}

// ---------- Puzzle generation ----------

// Fill an empty grid with a random complete solution (backtracking).
function fill(g) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (g[r][c] !== 0) continue;
      for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (isValid(g, r, c, v)) {
          g[r][c] = v;
          if (fill(g)) return true;
          g[r][c] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

// Count solutions, stopping early once we reach `limit`.
function countSolutions(g, limit) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (g[r][c] !== 0) continue;
      let total = 0;
      for (let v = 1; v <= 9 && total < limit; v++) {
        if (isValid(g, r, c, v)) {
          g[r][c] = v;
          total += countSolutions(g, limit - total);
          g[r][c] = 0;
        }
      }
      return total;
    }
  }
  return 1;
}

function newGame() {
  solution = emptyGrid();
  fill(solution);
  grid = solution.map(row => [...row]);

  // Remove numbers one by one, keeping the puzzle uniquely solvable
  const target = LEVELS[levelEl.value];
  let removed = 0;
  for (const n of shuffle([...Array(81).keys()])) {
    if (removed >= target) break;
    const r = Math.floor(n / 9);
    const c = n % 9;
    const backup = grid[r][c];
    grid[r][c] = 0;
    if (countSolutions(grid, 2) === 1) removed++;
    else grid[r][c] = backup;
  }

  given = grid.map(row => row.map(v => v !== 0));
  selected = null;
  won = false;
  seconds = 0;
  timeEl.textContent = '0:00';
  msgEl.textContent = '';
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
  render();
}

// ---------- Timer ----------

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function tick() {
  seconds++;
  timeEl.textContent = formatTime(seconds);
}

// ---------- Drawing the board ----------

function render() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.textContent = v || '';

      if (given[r][c]) cell.classList.add('given');
      if (c % 3 === 2 && c < 8) cell.classList.add('box-right');
      if (r % 3 === 2 && r < 8) cell.classList.add('box-bottom');
      if (v && !isValid(grid, r, c, v)) cell.classList.add('conflict');

      if (selected) {
        const [sr, sc] = selected;
        const sameBox =
          Math.floor(sr / 3) === Math.floor(r / 3) &&
          Math.floor(sc / 3) === Math.floor(c / 3);
        if (sr === r && sc === c) cell.classList.add('selected');
        else {
          if (sr === r || sc === c || sameBox) cell.classList.add('peer');
          if (grid[sr][sc] && v === grid[sr][sc]) cell.classList.add('same');
        }
      }
      boardEl.appendChild(cell);
    }
  }
}

// ---------- Player actions ----------

function setValue(v) {
  if (won || !selected) return;
  const [r, c] = selected;
  if (given[r][c]) return;
  grid[r][c] = v;
  render();
  checkWin();
}

function checkWin() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0 || !isValid(grid, r, c, grid[r][c])) return;
    }
  }
  won = true;
  clearInterval(timerId);
  msgEl.textContent = `Solved in ${formatTime(seconds)}. Nice work!`;
}

function useHint() {
  if (won) return;
  let target = null;
  if (selected && !given[selected[0]][selected[1]]) {
    target = selected;
  } else {
    const wrong = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== solution[r][c]) wrong.push([r, c]);
      }
    }
    if (wrong.length) target = wrong[Math.floor(Math.random() * wrong.length)];
  }
  if (!target) return;
  const [r, c] = target;
  grid[r][c] = solution[r][c];
  given[r][c] = true;
  selected = target;
  render();
  checkWin();
}

// ---------- Events ----------

boardEl.addEventListener('click', e => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  selected = [Number(cell.dataset.r), Number(cell.dataset.c)];
  render();
});

document.addEventListener('keydown', e => {
  if (e.key >= '1' && e.key <= '9') setValue(Number(e.key));
  else if (['Backspace', 'Delete', '0'].includes(e.key)) setValue(0);
  else if (selected && e.key.startsWith('Arrow')) {
    e.preventDefault();
    let [r, c] = selected;
    if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
    if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
    if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
    if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
    selected = [r, c];
    render();
  }
});

// Number pad: buttons 1-9 plus an erase button
for (let n = 1; n <= 9; n++) {
  const btn = document.createElement('button');
  btn.textContent = n;
  btn.addEventListener('click', () => setValue(n));
  padEl.appendChild(btn);
}
const erase = document.createElement('button');
erase.textContent = 'Erase';
erase.addEventListener('click', () => setValue(0));
padEl.appendChild(erase);

document.getElementById('new').addEventListener('click', newGame);
document.getElementById('hint').addEventListener('click', useHint);
levelEl.addEventListener('change', newGame);

newGame();
