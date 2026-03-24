document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');

    let currentPlayer = 'X';
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let gameActive = true;

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const handleCellClick = (e) => {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        updateCell(clickedCell, clickedCellIndex);
        checkResult();
    };

    const updateCell = (cell, index) => {
        gameState[index] = currentPlayer;
        cell.innerText = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        cell.classList.add('taken');
    };

    const checkResult = () => {
        let roundWon = false;
        let winningLine = [];

        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] === "" || gameState[b] === "" || gameState[c] === "") {
                continue;
            }
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                winningLine = [a, b, c];
                break;
            }
        }

        if (roundWon) {
            statusText.innerText = `Player ${currentPlayer} Wins!`;
            gameActive = false;
            highlightWinner(winningLine);
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusText.innerText = "Draw!";
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusText.innerText = `Player ${currentPlayer}'s Turn`;
    };

    const highlightWinner = (indices) => {
        indices.forEach(index => {
            cells[index].classList.add('winning-cell');
        });
    };

    const resetGame = () => {
        currentPlayer = 'X';
        gameState = ["", "", "", "", "", "", "", "", ""];
        gameActive = true;
        statusText.innerText = `Player X's Turn`;
        cells.forEach(cell => {
            cell.innerText = "";
            cell.classList.remove('x', 'o', 'taken', 'winning-cell');
        });
    };

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
});
