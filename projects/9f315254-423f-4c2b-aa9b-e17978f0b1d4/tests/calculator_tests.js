/**
 * DIGITN AI Calculator - Test Suite
 * Comprehensive functional and logic tests for the calculator engine.
 * Run in a Node environment with a basic mock or within the browser console.
 */

class CalculatorTests {
  constructor() {
    this.engine = new window.CalculatorEngine();
    this.results = [];
  }

  test(name, fn) {
    try {
      this.engine.clear();
      fn();
      this.results.push({ name, status: 'PASSED' });
    } catch (error) {
      this.results.push({ name, status: 'FAILED', error: error.message });
      console.error(`Test FAILED: ${name}`, error);
    }
  }

  expect(actual, expected) {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  }

  runAll() {
    console.group('DIGITN Calculator Engine Tests');

    this.test('Initial state should be 0', () => {
      this.expect(this.engine.currentOperand, '0');
    });

    this.test('Number appending works correctly', () => {
      this.engine.appendNumber('1');
      this.engine.appendNumber('2');
      this.engine.appendNumber('3');
      this.expect(this.engine.currentOperand, '123');
    });

    this.test('Prevents multiple decimal points', () => {
      this.engine.appendNumber('1');
      this.engine.appendNumber('.');
      this.engine.appendNumber('2');
      this.engine.appendNumber('.');
      this.engine.appendNumber('3');
      this.expect(this.engine.currentOperand, '1.23');
    });

    this.test('Basic addition: 5 + 10 = 15', () => {
      this.engine.appendNumber('5');
      this.engine.chooseOperation('+');
      this.engine.appendNumber('1');
      this.engine.appendNumber('0');
      this.engine.compute();
      this.expect(this.engine.currentOperand, '15');
    });

    this.test('Basic subtraction: 20 - 7 = 13', () => {
      this.engine.appendNumber('2');
      this.engine.appendNumber('0');
      this.engine.chooseOperation('-');
      this.engine.appendNumber('7');
      this.engine.compute();
      this.expect(this.engine.currentOperand, '13');
    });

    this.test('Basic multiplication: 6 * 7 = 42', () => {
      this.engine.appendNumber('6');
      this.engine.chooseOperation('*');
      this.engine.appendNumber('7');
      this.engine.compute();
      this.expect(this.engine.currentOperand, '42');
    });

    this.test('Basic division: 100 / 4 = 25', () => {
      this.engine.appendNumber('1');
      this.engine.appendNumber('0');
      this.engine.appendNumber('0');
      this.engine.chooseOperation('/');
      this.engine.appendNumber('4');
      this.engine.compute();
      this.expect(this.engine.currentOperand, '25');
    });

    this.test('Floating point precision: 0.1 + 0.2 = 0.3', () => {
      this.engine.appendNumber('0');
      this.engine.appendNumber('.');
      this.engine.appendNumber('1');
      this.engine.chooseOperation('+');
      this.engine.appendNumber('0');
      this.engine.appendNumber('.');
      this.engine.appendNumber('2');
      this.engine.compute();
      this.expect(this.engine.currentOperand, '0.3');
    });

    this.test('Division by zero returns Error', () => {
      this.engine.appendNumber('5');
      this.engine.chooseOperation('/');
      this.engine.appendNumber('0');
      this.engine.compute();
      this.expect(this.engine.currentOperand, 'Error');
    });

    this.test('Toggle sign function', () => {
      this.engine.appendNumber('4');
      this.engine.appendNumber('2');
      this.engine.toggleSign();
      this.expect(this.engine.currentOperand, '-42');
      this.engine.toggleSign();
      this.expect(this.engine.currentOperand, '42');
    });

    this.test('Delete function works correctly', () => {
      this.engine.appendNumber('1');
      this.engine.appendNumber('2');
      this.engine.appendNumber('3');
      this.engine.delete();
      this.expect(this.engine.currentOperand, '12');
      this.engine.delete();
      this.expect(this.engine.currentOperand, '1');
      this.engine.delete();
      this.expect(this.engine.currentOperand, '0');
    });

    this.test('Clear all (AC) resets everything', () => {
      this.engine.appendNumber('9');
      this.engine.chooseOperation('*');
      this.engine.appendNumber('9');
      this.engine.clear();
      this.expect(this.engine.currentOperand, '0');
      this.expect(this.engine.previousOperand, '');
      this.expect(this.engine.operation, undefined);
    });

    this.test('Chaining multiple operations: 5 + 5 * 2 = 20', () => {
      this.engine.appendNumber('5');
      this.engine.chooseOperation('+');
      this.engine.appendNumber('5'); // result of prev op happens on next op
      this.engine.chooseOperation('*'); // 10 is current
      this.engine.appendNumber('2');
      this.engine.compute();
      this.expect(this.engine.currentOperand, '20');
    });

    console.table(this.results);
    const passedCount = this.results.filter(r => r.status === 'PASSED').length;
    console.log(`Summary: ${passedCount}/${this.results.length} tests passed.`);
    console.groupEnd();

    return passedCount === this.results.length;
  }
}

// Global hook for manual testing in browser console
window.runTests = () => {
  const tester = new CalculatorTests();
  return tester.runAll();
};

// To run automatically in a headless test environment, uncomment:
// if (typeof window !== 'undefined' && window.DEBUG_AUTO_TEST) {
//   window.runTests();
// }
