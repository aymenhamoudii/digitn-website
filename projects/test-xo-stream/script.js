document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('status');
    const resetBtn = document.getElementById('resetBtn');
    const scoreXDisplay = document.getElementById('scoreX');
    const scoreODisplay = document.getElementById('scoreO');
    const scoreDrawDisplay = document.getElementById('scoreDraw');

    let currentPlayer = 'X';
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let gameActive = true;
    let scores = { X: 0, O: 0, Draw: 0 };

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

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    }

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerText = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());
    }

    function handleResultValidation() {
        let roundWon = false;
        let winningLine = null;

        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];
            
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                winningLine = winCondition;
                break;
            }
        }

        if (roundWon) {
            statusText.innerText = `Player ${currentPlayer} Wins!`;
            statusText.style.color = currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
            gameActive = false;
            scores[currentPlayer]++;
            updateScores();
            highlightWinner(winningLine);
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusText.innerText = "Game is a Draw!";
            statusText.style.color = "var(--text-color)";
            gameActive = false;
            scores.Draw++;
            updateScores();
            return;
        }

        handlePlayerChange();
    }

    function handlePlayerChange() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.innerText = `Player ${currentPlayer}'s Turn`;
    }

    function highlightWinner(winningLine) {
        winningLine.forEach(index => {
            cells[index].classList.add('winner');
        });
    }

    function updateScores() {
        scoreXDisplay.innerText = scores.X;
        scoreODisplay.innerText = scores.O;
        scoreDrawDisplay.innerText = scores.Draw;
    }

    function handleRestartGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusText.innerText = "Player X's Turn";
        statusText.style.color = "var(--text-color)";
        cells.forEach(cell => {
            cell.innerText = "";
            cell.classList.remove('x');
            cell.classList.remove('o');
            cell.classList.remove('winner');
        });
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', handleRestartGame);
});
