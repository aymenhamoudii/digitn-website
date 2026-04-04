/**
 * Comprehensive Test Suite for Calculator Logic
 * Note: These tests are designed to be run in a browser environment or via a test runner.
 */

import { Calculator } from './script.js';

const runTests = () => {
    console.log('%c🚀 Starting Calculator Test Suite...', 'font-weight: bold; font-size: 1.2rem; color: #3b82f6;');
    let passed = 0;
    let failed = 0;

    const mockDisplay = { innerText: '' };
    const mockExpr = { innerText: '' };
    const calc = new Calculator(mockDisplay, mockExpr);

    const assert = (name, condition, expected, actual) => {
        if (condition) {
            console.log(`%c✅ PASS: ${name}`, 'color: #10b981;');
            passed++;
        } else {
            console.error(`%c❌ FAIL: ${name}`, 'color: #ef4444;');
            console.error(`   Expected: ${expected}`);
            console.error(`   Actual: ${actual}`);
            failed++;
        }
    };

    // --- Unit Tests: Basic Arithmetic ---
    calc.reset();
    calc.appendNumber('5');
    calc.appendOperator('+');
    calc.appendNumber('10');
    calc.compute();
    assert('Addition (5+10=15)', calc.currentValue === '15', '15', calc.currentValue);

    calc.reset();
    calc.appendNumber('10');
    calc.appendOperator('*');
    calc.appendNumber('2');
    calc.appendOperator('-');
    calc.appendNumber('5');
    calc.compute();
    assert('Chained Operations (10*2-5=15)', calc.currentValue === '15', '15', calc.currentValue);

    calc.reset();
    calc.appendNumber('5');
    calc.appendOperator('/');
    calc.appendNumber('0');
    calc.compute();
    assert('Division by Zero', calc.currentValue === 'Infinity' || calc.currentValue === 'Error', 'Infinity/Error', calc.currentValue);

    // --- Unit Tests: Scientific Operations ---
    calc.reset();
    calc.appendNumber('16');
    calc.scientific('sqrt');
    assert('Square Root (sqrt(16)=4)', calc.currentValue === '4', '4', calc.currentValue);

    calc.reset();
    calc.appendNumber('5');
    calc.scientific('fact');
    assert('Factorial (5!=120)', calc.currentValue === '120', '120', calc.currentValue);

    calc.reset();
    calc.appendNumber('2');
    calc.scientific('pow2');
    assert('Square (2^2=4)', calc.currentValue === '4', '4', calc.currentValue);

    // --- Unit Tests: Trigonometry ---
    calc.reset();
    calc.isDegree = true;
    calc.appendNumber('90');
    calc.scientific('sin');
    assert('Sin in Degrees (sin(90)=1)', calc.currentValue === '1', '1', calc.currentValue);

    calc.reset();
    calc.isDegree = false;
    calc.currentValue = Math.PI.toString();
    calc.scientific('cos');
    assert('Cos in Radians (cos(PI)=-1)', calc.currentValue === '-1', '-1', calc.currentValue);

    // --- Edge Cases ---
    calc.reset();
    calc.appendNumber('0');
    calc.appendNumber('.');
    calc.appendNumber('0');
    calc.appendNumber('0');
    calc.appendNumber('1');
    assert('Decimal Input', calc.currentValue === '0.001', '0.001', calc.currentValue);

    calc.reset();
    calc.appendNumber('.');
    calc.appendNumber('.');
    assert('Multiple Decimals Prevention', calc.currentValue === '.', '.', calc.currentValue);

    // --- Integration Tests: History & persistence ---
    const initialHistoryLength = calc.history.length;
    calc.reset();
    calc.appendNumber('2');
    calc.appendOperator('+');
    calc.appendNumber('2');
    calc.compute();
    assert('History Integration (New Entry Added)', calc.history.length === initialHistoryLength + 1, initialHistoryLength + 1, calc.history.length);

    console.log(`\n%cTests Summary: ${passed} Passed, ${failed} Failed`, 'font-weight: bold; color: #3b82f6;');
};

// Check if running in browser and auto-run if ?test is in URL
if (typeof window !== 'undefined' && window.location.search.includes('test')) {
    document.addEventListener('DOMContentLoaded', runTests);
}

export { runTests };
