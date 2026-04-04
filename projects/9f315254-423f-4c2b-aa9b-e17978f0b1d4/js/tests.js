/**
 * Basic Calculator Unit Tests
 * Run this by opening index.html and typing 'runTests()' in the browser console.
 * No imports/exports - all classes are global.
 */

function runTests() {
  console.group('Calculator Engine Tests');
  
  const testEngine = new CalculatorEngine();
  
  // Test 1: Simple Addition
  testEngine.reset();
  testEngine.appendNumber('5');
  testEngine.chooseOperator('+');
  testEngine.appendNumber('7');
  testEngine.compute();
  console.assert(testEngine.currentInput === '12', `Addition Fail: Expected 12, got ${testEngine.currentInput}`);
  
  // Test 2: Decimal Precision
  testEngine.reset();
  testEngine.appendNumber('0');
  testEngine.appendDecimal();
  testEngine.appendNumber('1');
  testEngine.chooseOperator('+');
  testEngine.appendNumber('0');
  testEngine.appendDecimal();
  testEngine.appendNumber('2');
  testEngine.compute();
  console.assert(testEngine.currentInput === '0.3', `Precision Fail: Expected 0.3, got ${testEngine.currentInput}`);
  
  // Test 3: Sign Toggle
  testEngine.reset();
  testEngine.appendNumber('10');
  testEngine.toggleSign();
  console.assert(testEngine.currentInput === '-10', `Sign Toggle Fail: Expected -10, got ${testEngine.currentInput}`);
  
  // Test 4: Percentage
  testEngine.reset();
  testEngine.appendNumber('50');
  testEngine.percent();
  console.assert(testEngine.currentInput === '0.5', `Percentage Fail: Expected 0.5, got ${testEngine.currentInput}`);
  
  // Test 5: Multi-step calculation
  testEngine.reset();
  testEngine.appendNumber('2');
  testEngine.chooseOperator('*');
  testEngine.appendNumber('3');
  testEngine.chooseOperator('+'); // This should compute 2*3=6
  console.assert(testEngine.currentInput === '6', `Multi-step Fail (Step 1): Expected 6, got ${testEngine.currentInput}`);
  testEngine.appendNumber('4');
  testEngine.compute();
  console.assert(testEngine.currentInput === '10', `Multi-step Fail (Step 2): Expected 10, got ${testEngine.currentInput}`);
  
  // Test 6: Clear History
  testEngine.reset();
  testEngine.addToHistory('1 + 1 =', '2');
  console.assert(testEngine.history.length > 0, 'History should not be empty');
  testEngine.clearHistory();
  console.assert(testEngine.history.length === 0, 'History should be cleared');

  console.log('Tests complete! Check console assertions for errors.');
  console.groupEnd();
}

// Attach to window for easy access
window.runTests = runTests;
