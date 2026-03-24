// Tic-Tac-Toe Game - Complete JavaScript

(function() {
    'use strict';

    // Game State
    const state = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        gameMode: 'pvp', // 'pvp' or 'pvc'
        gameActive: true,
        scores: {
            x: 0,
            o: 0,
            draw: 0
        }
    };

    // Win combinations
    const winPatterns = [
        [0, 1, 2], // Top row
        [3, 4, 5], // Middle row
        [6, 7, 8], // Bottom row
        [0, 3, 6], // Left column
        [1, 4, 7], // Middle column
        [2, 5, 8], // Right column
        [0, 4, 8], // Diagonal top-left to bottom-right
        [2, 4, 6]  // Diagonal top-right to bottom-left
    ];

    // DOM Elements
    const elements = {
        gameBoard: document.getElementById('game-board'),
        cells: document.querySelectorAll('.cell'),
        statusText: document.getElementById('game-status').querySelector('.status-text'),
        restartBtn: document.getElementById('restart-btn'),
        modeBtns: document.querySelectorAll('.mode-btn'),
        scoreX: document.getElementById('score-x'),
        scoreO: document.getElementById('score-o'),
        scoreDraw: document.getElementById('score-draw'),
        modal: document.getElementById('winner-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        modalIcon: document.getElementById('modal-icon'),
        modalBtn: document.getElementById('modal-btn')
    };

    // Initialize Game
    function init() {
        addEventListeners();
        updateStatus();
    }

    // Add Event Listeners
    function addEventListeners() {
        // Cell clicks
        elements.cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });

        // Mode selection
        elements.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => switchMode(btn.dataset.mode));
        });

        // Restart button
        elements.restartBtn.addEventListener('click', restartGame);

        // Modal button
        elements.modalBtn.addEventListener('click', closeModalAndRestart);

        // Keyboard support for restart
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (elements.modal.classList.contains('show')) {
                    closeModalAndRestart();
                } else {
                    restartGame();
                }
            }
            if (e.key === 'Escape') {
                if (elements.modal.classList.contains('show')) {
                    closeModal();
                }
            }
        });
    }

    // Handle Cell Click
    function handleCellClick(e) {
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const index = parseInt(cell.dataset.index);

        // Check if cell is already taken or game is over
        if (state.board[index] !== '' || !state.gameActive) return;

        // Place mark
        placeMark(index);

        // Check for win or draw
        const result = checkGameResult();
        
        if (result) {
            if (result.winner) {
                endGame(result.winner, result.pattern);
            } else {
                endGame('draw');
            }
        } else {
            // Switch player
            state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
            updateStatus();

            // If playing against computer, trigger computer move
            if (state.gameMode === 'pvc' && state.currentPlayer === 'O' && state.gameActive) {
                setTimeout(computerMove, 500);
            }
        }
    }

    // Place Mark on Board
    function placeMark(index) {
        state.board[index] = state.currentPlayer;
        const cell = elements.cells[index];
        
        // Create span element for animation
        const span = document.createElement('span');
        span.textContent = state.currentPlayer;
        cell.appendChild(span);
        
        cell.classList.add(state.currentPlayer.toLowerCase(), 'taken');
    }

    // Computer Move (AI)
    function computerMove() {
        if (!state.gameActive) return;

        // Find best move using Minimax algorithm
        const bestMove = findBestMove();
        
        if (bestMove !== -1) {
            placeMark(bestMove);
            
            const result = checkGameResult();
            
            if (result) {
                if (result.winner) {
                    endGame(result.winner, result.pattern);
                } else {
                    endGame('draw');
                }
            } else {
                state.currentPlayer = 'X';
                updateStatus();
            }
        }
    }

    // Find Best Move using Minimax Algorithm
    function findBestMove() {
        let bestScore = -Infinity;
        let move = -1;

        for (let i = 0; i < 9; i++) {
            if (state.board[i] === '') {
                state.board[i] = 'O';
                let score = minimax(state.board, 0, false);
                state.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        return move;
    }

    // Minimax Algorithm
    function minimax(board, depth, isMaximizing) {
        const result = checkGameResult();
        
        if (result) {
            if (result.winner === 'O') return 10 - depth;
            if (result.winner === 'X') return depth - 10;
            return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    // Check Game Result
    function checkGameResult() {
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (
                state.board[a] &&
                state.board[a] === state.board[b] &&
                state.board[a] === state.board[c]
            ) {
                return { winner: state.board[a], pattern: pattern };
            }
        }

        if (!state.board.includes('')) {
            return { winner: null, pattern: null };
        }

        return null;
    }

    // End Game
    function endGame(result, pattern = null) {
        state.gameActive = false;

        // Highlight winning cells
        if (pattern) {
            pattern.forEach(index => {
                elements.cells[index].classList.add('winner');
            });
        }

        // Update scores
        if (result === 'draw') {
            state.scores.draw++;
            elements.scoreDraw.textContent = state.scores.draw;
            showModal('draw');
        } else {
            if (result === 'X') {
                state.scores.x++;
                elements.scoreX.textContent = state.scores.x;
            } else {
                state.scores.o++;
                elements.scoreO.textContent = state.scores.o;
            }
            showModal(result);
        }

        updateStatus(result, pattern ? 'winner' : 'draw');
    }

    // Update Status Display
    function updateStatus(result = null, type = 'turn') {
        const statusEl = elements.statusText;
        
        if (type === 'winner') {
            statusEl.className = `status-text winner-${result.toLowerCase()}`;
            statusEl.textContent = `${result} Wins!`;
        } else if (type === 'draw') {
            statusEl.className = 'status-text draw';
            statusEl.textContent = "It's a Draw!";
        } else {
            statusEl.className = `status-text ${state.currentPlayer.toLowerCase()}-turn`;
            statusEl.textContent = `${state.currentPlayer}'s Turn`;
        }
    }

    // Show Winner Modal
    function showModal(result) {
        setTimeout(() => {
            if (result === 'draw') {
                elements.modalIcon.textContent = '🤝';
                elements.modalTitle.textContent = "It's a Draw!";
                elements.modalMessage.textContent = 'Great game! Try again.';
            } else if (result === 'X') {
                elements.modalIcon.textContent = '🏆';
                elements.modalTitle.textContent = 'Player X Wins!';
                elements.modalMessage.textContent = 'Congratulations!';
            } else if (result === 'O') {
                elements.modalIcon.textContent = state.gameMode === 'pvc' ? '🤖' : '🏆';
                elements.modalTitle.textContent = state.gameMode === 'pvc' 
                    ? 'Computer Wins!' 
                    : 'Player O Wins!';
                elements.modalMessage.textContent = state.gameMode === 'pvc'
                    ? 'The machine wins this time!'
                    : 'Congratulations!';
            }
            
            elements.modal.classList.add('show');
        }, 600);
    }

    // Close Modal and Restart
    function closeModalAndRestart() {
        closeModal();
        setTimeout(restartGame, 300);
    }

    // Close Modal
    function closeModal() {
        elements.modal.classList.remove('show');
    }

    // Restart Game
    function restartGame() {
        state.board = ['', '', '', '', '', '', '', '', ''];
        state.currentPlayer = 'X';
        state.gameActive = true;

        // Reset cells
        elements.cells.forEach(cell => {
            cell.innerHTML = '';
            cell.className = 'cell';
        });

        updateStatus();
    }

    // Switch Game Mode
    function switchMode(mode) {
        state.gameMode = mode;
        
        // Update button states
        elements.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Reset and restart
        resetScores();
        restartGame();
    }

    // Reset Scores
    function resetScores() {
        state.scores = { x: 0, o: 0, draw: 0 };
        elements.scoreX.textContent = '0';
        elements.scoreO.textContent = '0';
        elements.scoreDraw.textContent = '0';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();