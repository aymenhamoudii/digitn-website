/* ========================================
   Tic-Tac-Toe - Game Logic
   ======================================== */

// ========================================
// Demo Data Seeding
// ========================================

function initDemoData() {
  // Check if already seeded
  if (localStorage.getItem('xoDemoSeeded')) {
    return;
  }
  
  // Seed with some past game stats to make it interesting
  const stats = {
    xWins: Math.floor(Math.random() * 5) + 1,
    oWins: Math.floor(Math.random() * 3),
    draws: Math.floor(Math.random() * 2)
  };
  
  localStorage.setItem('xoStats', JSON.stringify(stats));
  localStorage.setItem('xoDemoSeeded', 'true');
}

// ========================================
// Game State
// ========================================

const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6]  // Diagonal top-right to bottom-left
];

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let stats = { xWins: 0, oWins: 0, draws: 0 };

// ========================================
// DOM Elements
// ========================================

const boardEl = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turnIndicator');
const gameStatus = document.getElementById('gameStatus');
const restartBtn = document.getElementById('restartBtn');
const xWinsEl = document.getElementById('xWins');
const oWinsEl = document.getElementById('oWins');
const drawsEl = document.getElementById('draws');

// ========================================
// Utility Functions
// ========================================

function sanitizeInput(str) {
  // Basic sanitization to prevent XSS
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '');
}

function updateStatsDisplay() {
  xWinsEl.textContent = stats.xWins;
  oWinsEl.textContent = stats.oWins;
  drawsEl.textContent = stats.draws;
}

function loadStats() {
  const saved = localStorage.getItem('xoStats');
  if (saved) {
    try {
      stats = JSON.parse(saved);
    } catch (e) {
      stats = { xWins: 0, oWins: 0, draws: 0 };
    }
  }
  updateStatsDisplay();
}

function saveStats() {
  localStorage.setItem('xoStats', JSON.stringify(stats));
}

// ========================================
// Game Logic
// ========================================

function checkWinner() {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  return null;
}

function checkDraw() {
  return board.every(cell => cell !== null);
}

function handleCellClick(e) {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  
  const index = parseInt(cell.dataset.index, 10);
  
  // Validate index
  if (isNaN(index) || index < 0 || index > 8) return;
  
  // Check if cell is already filled or game is over
  if (board[index] !== null || !gameActive) return;
  
  // Make the move
  makeMove(index, cell);
}

function makeMove(index, cell) {
  // Update board state
  board[index] = currentPlayer;
  
  // Add filled class and mark
  cell.classList.add('filled');
  cell.setAttribute('data-preview', '');
  
  const mark = document.createElement('span');
  mark.classList.add('mark', currentPlayer.toLowerCase());
  mark.setAttribute('aria-label', `${currentPlayer} at position ${index + 1}`);
  mark.textContent = currentPlayer;
  cell.appendChild(mark);
  
  // Remove keyboard trap - make sure other cells are still focusable
  cell.setAttribute('tabindex', '0');
  
  // Check for winner
  const result = checkWinner();
  if (result) {
    endGame(result.winner, result.combo);
    return;
  }
  
  // Check for draw
  if (checkDraw()) {
    endGame(null);
    return;
  }
  
  // Switch player
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateTurnIndicator();
  
  // Update hover preview for next player
  updateHoverPreview();
}

function updateTurnIndicator() {
  turnIndicator.textContent = `Player ${currentPlayer}'s turn`;
  turnIndicator.className = 'turn-indicator ' + (currentPlayer === 'X' ? 'x-turn' : 'o-turn');
}

function updateHoverPreview() {
  cells.forEach(cell => {
    if (!cell.classList.contains('filled')) {
      cell.setAttribute('data-preview', currentPlayer);
    }
  });
}

function endGame(winner, winningCombo = null) {
  gameActive = false;
  
  if (winner) {
    // Update stats
    if (winner === 'X') {
      stats.xWins++;
      xWinsEl.classList.add('highlight');
      setTimeout(() => xWinsEl.classList.remove('highlight'), 500);
    } else {
      stats.oWins++;
      oWinsEl.classList.add('highlight');
      setTimeout(() => oWinsEl.classList.remove('highlight'), 500);
    }
    saveStats();
    updateStatsDisplay();
    
    // Show winner
    turnIndicator.textContent = `Player ${winner} wins!`;
    turnIndicator.className = 'turn-indicator winner';
    
    // Highlight winning cells
    if (winningCombo) {
      boardEl.classList.add('winner');
      winningCombo.forEach(index => {
        cells[index].classList.add('winning');
      });
    }
  } else {
    // Draw
    stats.draws++;
    saveStats();
    updateStatsDisplay();
    drawsEl.classList.add('highlight');
    setTimeout(() => drawsEl.classList.remove('highlight'), 500);
    
    turnIndicator.textContent = "It's a draw!";
    turnIndicator.className = 'turn-indicator draw';
  }
  
  // Show restart button
  restartBtn.classList.add('visible');
}

function restartGame() {
  // Reset board state
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  
  // Reset UI
  cells.forEach(cell => {
    cell.classList.remove('filled', 'winning');
    cell.removeAttribute('data-preview');
    const mark = cell.querySelector('.mark');
    if (mark) mark.remove();
  });
  
  boardEl.classList.remove('winner');
  
  // Reset status
  updateTurnIndicator();
  updateHoverPreview();
  
  // Hide restart button
  restartBtn.classList.remove('visible');
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
  // Cell click handler
  boardEl.addEventListener('click', handleCellClick);
  
  // Keyboard navigation support
  cells.forEach((cell, index) => {
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCellClick(e);
      }
      
      // Arrow key navigation
      let newIndex = index;
      if (e.key === 'ArrowRight' && index < 6) newIndex = index + 3;
      if (e.key === 'ArrowLeft' && index > 2) newIndex = index - 3;
      if (e.key === 'ArrowDown' && index < 6) newIndex = index + 3;
      if (e.key === 'ArrowUp' && index > 2) newIndex = index - 3;
      
      if (newIndex !== index) {
        cells[newIndex].focus();
      }
    });
  });
  
  // Restart button
  restartBtn.addEventListener('click', restartGame);
}

// ========================================
// Initialize Game
// ========================================

function initGame() {
  loadStats();
  updateTurnIndicator();
  updateHoverPreview();
  initEventListeners();
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initDemoData();
  initGame();
});
