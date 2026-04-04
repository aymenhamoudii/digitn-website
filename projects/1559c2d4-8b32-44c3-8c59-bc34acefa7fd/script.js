/**
 * Scientific Glass Calculator Logic
 * Author: DIGITN AI
 */

class Calculator {
    constructor(displayElement, expressionElement) {
        this.displayElement = displayElement;
        this.expressionElement = expressionElement;
        this.reset();
        this.history = JSON.parse(localStorage.getItem('calc-history')) || [];
        this.isDegree = false;
    }

    reset() {
        this.currentValue = '0';
        this.expression = '';
        this.shouldResetScreen = false;
        this.lastInputWasOperator = false;
        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.currentValue === '0' || this.shouldResetScreen) {
            this.currentValue = number;
            this.shouldResetScreen = false;
        } else {
            // Prevent multiple decimal points
            if (number === '.' && this.currentValue.includes('.')) return;
            this.currentValue += number;
        }
        this.lastInputWasOperator = false;
        this.updateDisplay();
    }

    appendOperator(operator) {
        if (this.shouldResetScreen) {
            this.expression = '';
            this.shouldResetScreen = false;
        }

        if (this.lastInputWasOperator && this.currentValue === '0') {
            // Replace previous operator if another is pressed consecutively
            this.expression = this.expression.slice(0, -1) + operator;
        } else {
            this.expression += this.currentValue + operator;
            this.currentValue = '0';
        }

        this.lastInputWasOperator = true;
        this.updateDisplay();
    }

    delete() {
        if (this.shouldResetScreen) {
            this.reset();
            return;
        }

        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    compute() {
        if (this.expression === '') return;
        
        let result;
        const fullExpression = this.expression + this.currentValue;
        
        try {
            // Clean expression for JS eval
            const evalExpr = fullExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/mod/g, '%')
                .replace(/π/g, Math.PI)
                .replace(/e/g, Math.E);

            // Using safer evaluation strategy
            result = Function(`"use strict"; return (${evalExpr})`)();
            
            if (result === undefined || result === null || isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid");
            }

            this.addToHistory(fullExpression, result);
            this.currentValue = this.formatResult(result);
            this.expression = '';
            this.shouldResetScreen = true;
            this.lastInputWasOperator = false;
        } catch (e) {
            this.currentValue = 'Error';
            this.expression = '';
            this.shouldResetScreen = true;
        }
        this.updateDisplay();
    }

    scientific(func) {
        const val = parseFloat(this.currentValue);
        let result;

        switch (func) {
            case 'sin':
                result = this.isDegree ? Math.sin(val * Math.PI / 180) : Math.sin(val);
                break;
            case 'cos':
                result = this.isDegree ? Math.cos(val * Math.PI / 180) : Math.cos(val);
                break;
            case 'tan':
                result = this.isDegree ? Math.tan(val * Math.PI / 180) : Math.tan(val);
                break;
            case 'log':
                result = Math.log10(val);
                break;
            case 'ln':
                result = Math.log(val);
                break;
            case 'sqrt':
                result = Math.sqrt(val);
                break;
            case 'pow2':
                result = Math.pow(val, 2);
                break;
            case 'powy':
                this.appendOperator('**');
                return;
            case 'inv':
                result = 1 / val;
                break;
            case 'abs':
                result = Math.abs(val);
                break;
            case 'exp':
                result = Math.exp(val);
                break;
            case 'fact':
                result = this.factorial(val);
                break;
            default: return;
        }

        this.currentValue = this.formatResult(result);
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    factorial(n) {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0) return 1;
        if (n > 170) return Infinity; // Prevent overflow
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    formatResult(num) {
        if (Math.abs(num) < 1e-10 && Math.abs(num) > 0) return "0";
        const maxLen = 14;
        let str = num.toString();
        
        if (str.length > maxLen) {
            if (Number.isInteger(num)) {
                return num.toExponential(6);
            } else {
                return parseFloat(num.toFixed(8)).toString();
            }
        }
        return str;
    }

    updateDisplay() {
        this.displayElement.innerText = this.currentValue;
        // Clean display for user
        this.expressionElement.innerText = this.expression
            .replace(/\*\*/g, '^')
            .replace(/\*/g, '×')
            .replace(/\//g, '÷');
    }

    addToHistory(expr, res) {
        const formattedRes = this.formatResult(res);
        const item = { 
            expr: expr.replace(/\*\*/g, '^').replace(/\*/g, '×').replace(/\//g, '÷'), 
            res: formattedRes,
            id: Date.now()
        };
        this.history.unshift(item);
        if (this.history.length > 50) this.history.pop();
        localStorage.setItem('calc-history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('history-list');
        if (!list) return;
        
        if (this.history.length === 0) {
            list.innerHTML = '<li class="history-item" style="cursor: default; background: transparent; text-align: center; opacity: 0.5;">No history yet</li>';
            return;
        }

        list.innerHTML = this.history.map((item) => `
            <li class="history-item" data-res="${item.res}" data-expr="${item.expr}">
                <span class="hist-exp" aria-hidden="true">${item.expr} =</span>
                <span class="hist-res">${item.res}</span>
            </li>
        `).join('');

        // Re-attach listeners to new history items
        list.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentValue = item.dataset.res;
                this.shouldResetScreen = true;
                this.updateDisplay();
                document.getElementById('history-panel').classList.add('hidden');
            });
        });
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calc-history');
        this.renderHistory();
    }
}

// UI and Initialization
document.addEventListener('DOMContentLoaded', () => {
    const calc = new Calculator(
        document.getElementById('current-display'),
        document.getElementById('prev-operation')
    );

    // Theme Management
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // Sidebar Logic
    const histBtn = document.getElementById('history-toggle');
    const histPanel = document.getElementById('history-panel');
    const clearHistBtn = document.getElementById('clear-history');

    histBtn.addEventListener('click', () => histPanel.classList.toggle('hidden'));
    clearHistBtn.addEventListener('click', () => calc.clearHistory());

    // Click outside to close history
    document.addEventListener('click', (e) => {
        if (!histPanel.classList.contains('hidden') && 
            !histPanel.contains(e.target) && 
            !histBtn.contains(e.target)) {
            histPanel.classList.add('hidden');
        }
    });

    // Button Interaction
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const { val, action, func } = btn.dataset;

            if (val) {
                if (['+', '-', '*', '/', 'mod'].includes(val)) {
                    calc.appendOperator(val === 'mod' ? 'mod' : val);
                } else if (val === 'pi') {
                    calc.currentValue = Math.PI.toFixed(10);
                    calc.updateDisplay();
                } else if (val === 'e') {
                    calc.currentValue = Math.E.toFixed(10);
                    calc.updateDisplay();
                } else {
                    calc.appendNumber(val);
                }
            } else if (action) {
                switch(action) {
                    case 'clear': calc.reset(); break;
                    case 'delete': calc.delete(); break;
                    case 'calculate': calc.compute(); break;
                }
            } else if (func) {
                if (func === 'deg-rad') {
                    calc.isDegree = !calc.isDegree;
                    document.getElementById('angle-mode').innerText = calc.isDegree ? 'DEG' : 'RAD';
                    btn.innerText = calc.isDegree ? 'Rad' : 'Deg';
                } else {
                    calc.scientific(func);
                }
            }
        });
    });

    // Keyboard Support
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') calc.appendNumber(e.key);
        if (e.key === '.') calc.appendNumber('.');
        if (e.key === '+') calc.appendOperator('+');
        if (e.key === '-') calc.appendOperator('-');
        if (e.key === '*') calc.appendOperator('*');
        if (e.key === '/') { e.preventDefault(); calc.appendOperator('/'); }
        if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calc.compute(); }
        if (e.key === 'Backspace') calc.delete();
        if (e.key === 'Escape') calc.reset();
        
        // Find button for visual feedback
        const btn = document.querySelector(`.btn[data-val="${e.key === '*' ? '×' : e.key}"]`) ||
                    document.querySelector(`.btn[data-action="${e.key === 'Enter' ? 'calculate' : ''}"]`);
        if (btn) {
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 100);
        }
    });

    calc.renderHistory();
});

export { Calculator };
