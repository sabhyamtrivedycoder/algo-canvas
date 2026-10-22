const assert = require('assert');
const { ROWS, COLS } = require('./app.js');
console.log('🧪 Testing AlgoCanvas...');
assert(ROWS === 20 && COLS === 30, 'Grid dimension verified');
console.log('✅ AlgoCanvas test passed!');