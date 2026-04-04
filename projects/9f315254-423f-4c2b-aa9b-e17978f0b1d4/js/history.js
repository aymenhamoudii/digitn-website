/**
 * History Management Logic
 */

let calculationHistory = [];

function addToHistory(expression, result) {
    const entry = {
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    };
    
    calculationHistory.unshift(entry);
    if (calculationHistory.length > 20) {
        calculationHistory.pop();
    }
    
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-msg">No calculations yet</p>';
        return;
    }
    
    const itemsHTML = calculationHistory.map((item, index) => {
        return `
            <div class="history-item" data-index="${index}">
                <div class="history-expr">${item.expression} =</div>
                <div class="history-res">${item.result}</div>
            </div>
        `;
    }).join('');
    
    historyList.innerHTML = itemsHTML;
}

function clearHistory() {
    calculationHistory = [];
    renderHistory();
}

function toggleHistoryPanel() {
    const panel = document.getElementById('history-panel');
    if (!panel) return;
    
    panel.classList.toggle('hidden');
    
    const container = document.querySelector('.calculator-container');
    if (!panel.classList.contains('hidden')) {
        container.style.maxWidth = '800px';
    } else {
        container.style.maxWidth = '360px';
    }
}

// Global scope expose
window.addToHistory = addToHistory;
window.clearHistory = clearHistory;
window.toggleHistoryPanel = toggleHistoryPanel;
