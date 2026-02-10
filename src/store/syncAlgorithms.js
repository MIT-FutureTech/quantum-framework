#!/usr/bin/env node

/**
 * Google Sheets Algorithm Sync Script
 * 
 * Automatically fetches algorithm data from Google Sheets and generates algorithmVariants.js
 * Run weekly via cron job to keep algorithms up-to-date
 * 
 * Usage: node sync-algorithms.js
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Google Sheet ID (from the URL)
  SPREADSHEET_ID: '1c6HTfHQfp7MIg1LFo6_wFOzKLIHA1rzVpDxXIPosRQ0',
  
  // Sheet names (tabs in the Google Sheet)
  SHEETS: {
    PARALLEL: 'Parallel Algos',
    QUANTUM: 'Quantum Algorithms', 
    SHEET1: 'Sheet1',
    APPROX: 'Approx Algos'
  },
  
  // Output file path (relative to project root)
  OUTPUT_FILE: 'src/store/algorithmVariants.js',
  
  // Problems to sync (can add more later)
  PROBLEMS: {
    'Integer Factorization': {
      parallel: 'Integer Factoring',
      sheet1: 'Integer Factoring',
      approx: null,
      quantum: 'Integer Factoring'
    },
    'Database Search': {
      parallel: 'String Search',
      sheet1: 'String Search',
      approx: 'String Search',
      quantum: 'String Search'
    },
    'Traveling Salesman': {
      parallel: null,
      sheet1: null,
      approx: 'The Traveling-Salesman Problem',
      quantum: 'The Traveling-Salesman Problem'
    }
  }
};

// ============================================================================
// GOOGLE SHEETS API SETUP
// ============================================================================

async function getGoogleSheetsClient() {
  // Use API key for read-only public access
  // Get your API key from: https://console.cloud.google.com/apis/credentials
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'GOOGLE_SHEETS_API_KEY environment variable not set!\n' +
      'Get an API key from: https://console.cloud.google.com/apis/credentials\n' +
      'Then run: export GOOGLE_SHEETS_API_KEY="your-key-here"'
    );
  }
  
  const sheets = google.sheets({ version: 'v4', auth: apiKey });
  return sheets;
}

// ============================================================================
// DATA FETCHING
// ============================================================================

async function fetchSheetData(sheets, sheetName) {
  try {
    console.log(`📥 Fetching ${sheetName}...`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      range: `${sheetName}!A:AZ`, // Get all columns
    });
    
    const rows = response.data.values || [];
    console.log(`   ✓ Got ${rows.length} rows from ${sheetName}`);
    
    return rows;
  } catch (error) {
    console.error(`   ✗ Error fetching ${sheetName}:`, error.message);
    return [];
  }
}

// ============================================================================
// FORMULA CONVERSION (LaTeX to mathjs)
// ============================================================================

function convertToMathjs(formula) {
  if (!formula || formula.trim() === '' || formula === '-' || formula === '?') {
    return null;
  }
  
  let result = formula.trim();
  
  // Remove LaTeX $ signs
  result = result.replace(/\$/g, '');
  
  // Skip complex L_n notation
  if (result.includes('L_n[') || result.includes('L_n\\[')) {
    const match = result.match(/exp\(\((.+?)\)\)/);
    if (match) {
      let inner = match[1];
      inner = inner.replace(/\\?ln\s+n/g, 'log(n, e)');
      inner = inner.replace(/\(ln n\)/g, '(log(n, e))');
      inner = inner.replace(/ln\s*n/g, 'log(n, e)');
      return `e^(${inner})`;
    }
    return null;
  }
  
  // Skip formulas with non-standard parameters
  const skipPatterns = ['M^a', 'r(a)', 'T_1', 'TP', 'B \\', 'pi(', 'under assumption', 'p(n)', '2^{(p(n)}'];
  if (skipPatterns.some(pattern => result.includes(pattern))) {
    return null;
  }
  
  // Convert patterns
  const conversions = [
    // O() notation
    [/O\((.*?)\)/g, '$1'],
    [/Omega\((.*?)\)/g, '$1'],
    [/Theta\((.*?)\)/g, '$1'],
    
    // Exponentials
    [/\\exp\s*\{([^}]+)\}/g, 'e^($1)'],
    [/\\exp\s*\(([^)]+)\)/g, 'e^($1)'],
    [/exp\s*\(([^)]+)\)/g, 'e^($1)'],
    
    // Logarithms
    [/\\log_2\s*\{([^}]+)\}/g, 'log($1, 2)'],
    [/\\log_2\s*\(([^)]+)\)/g, 'log($1, 2)'],
    [/\\log\s*\{([^}]+)\}/g, 'log($1, e)'],
    [/\\log\s*\(([^)]+)\)/g, 'log($1, e)'],
    [/\\ln\s*\{([^}]+)\}/g, 'log($1, e)'],
    [/\\ln\s*\(([^)]+)\)/g, 'log($1, e)'],
    [/ln\(([^)]+)\)/g, 'log($1, e)'],
    [/ln n/g, 'log(n, e)'],
    [/log n/g, 'log(n, e)'],
    [/log\(n\)/g, 'log(n, e)'],
    [/\\log V/g, 'log(V, e)'],
    [/log V/g, 'log(V, e)'],
    
    // Square roots
    [/\\sqrt\{([^}]+)\}/g, 'sqrt($1)'],
    [/\\lceil([^\\]+)\\rceil/g, 'ceil($1)'],
    
    // Powers
    [/\^\{([^}]+)\}/g, '^($1)'],
    [/\\{/g, '('],
    [/\\}/g, ')'],
    
    // Clean up
    [/\\/g, ''],
    [/\s+/g, ' ']
  ];
  
  for (const [pattern, replacement] of conversions) {
    result = result.replace(pattern, replacement);
  }
  
  result = result.trim();
  
  // Replace V with n (for graph algorithms)
  result = result.replace(/\bV\b/g, 'n');
  result = result.replace(/\bE\b/g, 'n^2');
  
  // Final validation
  const rejectPatterns = ['\\', '_{', 'under', 'assumption', 'o(1)', 'where'];
  if (rejectPatterns.some(pattern => result.includes(pattern))) {
    return null;
  }
  
  return result || null;
}

// ============================================================================
// PARSING ALGORITHMS FROM SHEETS
// ============================================================================

function parseParallelAlgos(rows, problemName) {
  const algorithms = [];
  const headers = rows[0] || [];
  
  // Column indices (0-based)
  const nameIdx = 1;        // Family Name
  const algoNameIdx = 17;   // Algorithm Name
  const variantIdx = 7;     // Variation
  const runtimeIdx = 27;    // Time Complexity
  const workIdx = 31;       // Parallel Algorithm Work
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[nameIdx] === problemName) {
      const algoName = row[algoNameIdx] || '';
      if (algoName.trim()) {
        algorithms.push({
          name: algoName.trim(),
          variant: (row[variantIdx] || '').trim(),
          runtime: (row[runtimeIdx] || '').trim(),
          work: (row[workIdx] || '').trim(),
          parallel: true,
          source: 'Parallel Algos'
        });
      }
    }
  }
  
  return algorithms;
}

function parseSheet1Algos(rows, problemName) {
  const algorithms = [];
  const headers = rows[0] || [];
  
  // Column indices
  const nameIdx = 1;        // Family Name
  const algoNameIdx = 14;   // Algorithm Name
  const variantIdx = 4;     // Variation
  const runtimeIdx = 28;    // Time Complexity
  const quantumIdx = 50;    // Quantum?
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[nameIdx] === problemName) {
      const isQuantum = row[quantumIdx] || '0';
      if (!['1', 'Y', 'y', 'Yes'].includes(isQuantum)) {
        const algoName = row[algoNameIdx] || '';
        if (algoName.trim()) {
          const runtime = (row[runtimeIdx] || '').trim();
          algorithms.push({
            name: algoName.trim(),
            variant: (row[variantIdx] || '').trim(),
            runtime: runtime,
            work: runtime, // Sequential: work = runtime
            parallel: false,
            source: 'Sheet1'
          });
        }
      }
    }
  }
  
  return algorithms;
}

function parseApproxAlgos(rows, problemName) {
  const algorithms = [];
  const headers = rows[0] || [];
  
  // Column indices
  const nameIdx = 1;        // Family Name
  const algoNameIdx = 15;   // Algorithm Name
  const variantIdx = 5;     // Variation
  const runtimeIdx = 28;    // Time Complexity
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[nameIdx] === problemName) {
      const algoName = row[algoNameIdx] || '';
      if (algoName.trim()) {
        const runtime = (row[runtimeIdx] || '').trim();
        algorithms.push({
          name: algoName.trim(),
          variant: (row[variantIdx] || '').trim(),
          runtime: runtime,
          work: runtime,
          parallel: false,
          approximation: true,
          source: 'Approx Algos'
        });
      }
    }
  }
  
  return algorithms;
}

function parseQuantumAlgos(rows, problemName) {
  const algorithms = [];
  const headers = rows[0] || [];
  
  // Column indices
  const nameIdx = 1;        // Family Name
  const algoNameIdx = 13;   // Algorithm Name
  const variantIdx = 4;     // Variation
  const runtimeIdx = 27;    // Time Complexity
  const workIdx = 29;       // Circuit Size / Work
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[nameIdx] === problemName) {
      const algoName = row[algoNameIdx] || '';
      if (algoName.trim()) {
        algorithms.push({
          name: algoName.trim(),
          variant: (row[variantIdx] || '').trim(),
          runtime: (row[runtimeIdx] || '').trim(),
          work: (row[workIdx] || '').trim(),
          source: 'Quantum Algorithms'
        });
      }
    }
  }
  
  return algorithms;
}

// ============================================================================
// REMOVE DUPLICATES
// ============================================================================

function removeDuplicates(algorithms) {
  const seen = new Map();
  const unique = [];
  
  for (const algo of algorithms) {
    // Create a unique key based on name + runtime formula
    const key = `${algo.name.toLowerCase()}-${algo.runtime}`;
    
    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(algo);
    } else {
      console.log(`   ⚠️  Skipping duplicate: ${algo.name}`);
    }
  }
  
  return unique;
}

// ============================================================================
// CREATE ALGORITHM VARIANT OBJECT
// ============================================================================

function createVariant(algo, index, algoType) {
  const runtimeMathjs = convertToMathjs(algo.runtime);
  let workMathjs = convertToMathjs(algo.work);
  
  // Handle work formula
  if (runtimeMathjs && !workMathjs) {
    if (algoType === 'classical') {
      if (algo.parallel) {
        // Remove /p to get work
        workMathjs = runtimeMathjs.replace(/\s*\/\s*p/, '');
      } else {
        workMathjs = runtimeMathjs;
      }
    } else {
      // quantum
      workMathjs = `(${runtimeMathjs}) * q`;
    }
  }
  
  const available = runtimeMathjs !== null && workMathjs !== null;
  
  // Generate unique key
  const nameKey = algo.name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50);
  const key = `${nameKey}-${index}`;
  
  // Estimate metrics
  const metrics = estimateMetrics(algo.runtime, algo.approximation);
  
  // IMPORTANT: Description comes ONLY from spreadsheet "variant" field
  let description = algo.variant || 'Algorithm variant';
  if (algo.approximation) {
    description = `Approximation/Heuristic: ${description}`;
  }
  
  const variant = {
    key,
    name: algo.name.substring(0, 80),
    description: description.substring(0, 150), // From spreadsheet only!
    available,
    runtimeFormula: runtimeMathjs,
    workFormula: workMathjs,
    metrics,
    reference: `${algo.source}${algo.variant ? ' - ' + algo.variant : ''}`,
    parallel: algo.parallel || false
  };
  
  if (algo.approximation) {
    variant.approximation = true;
  }
  
  if (!available) {
    variant.note = `Formula unavailable - original: ${algo.runtime.substring(0, 50)}`;
  }
  
  return variant;
}

function estimateMetrics(runtime, isApproximation = false) {
  const metrics = { speed: 2, work: 2, span: 2, space: 2 };
  
  const runtimeLower = (runtime || '').toLowerCase();
  
  if (isApproximation) {
    metrics.speed = 1;
  }
  
  if (/n log n|nlog|m\+n|v\^2 log v|v log v/.test(runtimeLower)) {
    metrics.speed = 1;
  } else if (/n\^2|v\^2|n\^3|v\^3/.test(runtimeLower)) {
    metrics.speed = 2;
  } else if (/2\^n|e\^|exp|v\^2 e/.test(runtimeLower)) {
    metrics.speed = 3;
  } else if (/sqrt\(n\)|n\/2/.test(runtimeLower)) {
    metrics.speed = 1;
  }
  
  metrics.work = metrics.speed;
  
  return metrics;
}

// ============================================================================
// PARSE COMPLETE PROBLEM
// ============================================================================

async function parseProblem(sheets, problemName, names, sheetsData) {
  console.log(`\n📊 Processing: ${problemName}`);
  
  const classicalAlgos = [];
  const quantumAlgos = [];
  
  // Parse classical algorithms
  if (names.parallel && sheetsData.parallel) {
    const algos = parseParallelAlgos(sheetsData.parallel, names.parallel);
    classicalAlgos.push(...algos);
    console.log(`   ✓ Found ${algos.length} parallel algorithms`);
  }
  
  if (names.sheet1 && sheetsData.sheet1) {
    const algos = parseSheet1Algos(sheetsData.sheet1, names.sheet1);
    classicalAlgos.push(...algos);
    console.log(`   ✓ Found ${algos.length} sequential algorithms`);
  }
  
  if (names.approx && sheetsData.approx) {
    const algos = parseApproxAlgos(sheetsData.approx, names.approx);
    classicalAlgos.push(...algos);
    console.log(`   ✓ Found ${algos.length} approximation algorithms`);
  }
  
  // Parse quantum algorithms
  if (names.quantum && sheetsData.quantum) {
    const algos = parseQuantumAlgos(sheetsData.quantum, names.quantum);
    quantumAlgos.push(...algos);
    console.log(`   ✓ Found ${algos.length} quantum algorithms`);
  }
  
  // Remove duplicates
  const uniqueClassical = removeDuplicates(classicalAlgos);
  const uniqueQuantum = removeDuplicates(quantumAlgos);
  
  if (uniqueClassical.length === 0 || uniqueQuantum.length === 0) {
    console.log(`   ⚠️  Skipping ${problemName}: needs both classical and quantum`);
    return null;
  }
  
  // Create variant objects
  const classicalVariants = uniqueClassical
    .map((algo, i) => createVariant(algo, i, 'classical'))
    .filter(v => v !== null);
  
  const quantumVariants = uniqueQuantum
    .map((algo, i) => createVariant(algo, i, 'quantum'))
    .filter(v => v !== null);
  
  const classicalAvailable = classicalVariants.filter(v => v.available).length;
  const quantumAvailable = quantumVariants.filter(v => v.available).length;
  
  console.log(`   ✅ Result: ${classicalAvailable}/${classicalVariants.length} classical, ${quantumAvailable}/${quantumVariants.length} quantum available`);
  
  return {
    classical: classicalVariants,
    quantum: quantumVariants
  };
}

// ============================================================================
// GENERATE JAVASCRIPT FILE
// ============================================================================

function formatAlgorithm(algo, indent = 6) {
  const spaces = ' '.repeat(indent);
  const spaces2 = ' '.repeat(indent + 2);
  
  let js = `${spaces}{\n`;
  js += `${spaces2}key: '${algo.key}',\n`;
  js += `${spaces2}name: '${algo.name.replace(/'/g, "\\'")}',\n`;
  js += `${spaces2}description: '${(algo.description || '').replace(/'/g, "\\'")}',\n`;
  js += `${spaces2}available: ${algo.available},\n`;
  js += `${spaces2}runtimeFormula: ${algo.runtimeFormula ? `'${algo.runtimeFormula}'` : 'null'},\n`;
  js += `${spaces2}workFormula: ${algo.workFormula ? `'${algo.workFormula}'` : 'null'},\n`;
  js += `${spaces2}metrics: { speed: ${algo.metrics.speed}, work: ${algo.metrics.work}, span: ${algo.metrics.span}, space: ${algo.metrics.space} },\n`;
  js += `${spaces2}reference: '${(algo.reference || '').replace(/'/g, "\\'")}',\n`;
  js += `${spaces2}parallel: ${algo.parallel || false}`;
  
  if (algo.approximation) {
    js += `,\n${spaces2}approximation: true`;
  }
  
  if (algo.note) {
    js += `,\n${spaces2}note: '${algo.note.replace(/'/g, "\\'")}'`;
  }
  
  js += `\n${spaces}}`;
  return js;
}

function generateJavaScriptFile(problemsData) {
  let js = `/**
 * Algorithm Variants - Auto-generated from Google Sheets
 * 
 * Last updated: ${new Date().toISOString()}
 * Source: https://docs.google.com/spreadsheets/d/1c6HTfHQfp7MIg1LFo6_wFOzKLIHA1rzVpDxXIPosRQ0/
 * 
 * DO NOT EDIT THIS FILE MANUALLY - It will be overwritten by the sync script
 * To update: run \`npm run sync-algorithms\` or wait for weekly cron job
 */

export const algorithmVariants = {
`;

  // Add each problem
  for (const [problemName, data] of Object.entries(problemsData)) {
    js += `  '${problemName}': {\n`;
    
    // Classical algorithms
    js += `    classical: [\n`;
    for (let i = 0; i < data.classical.length; i++) {
      js += formatAlgorithm(data.classical[i], 6);
      if (i < data.classical.length - 1) {
        js += ',\n';
      } else {
        js += '\n';
      }
    }
    js += `    ],\n`;
    
    // Quantum algorithms
    js += `    quantum: [\n`;
    for (let i = 0; i < data.quantum.length; i++) {
      js += formatAlgorithm(data.quantum[i], 6);
      if (i < data.quantum.length - 1) {
        js += ',\n';
      } else {
        js += '\n';
      }
    }
    js += `    ]\n`;
    
    js += `  },\n`;
  }

  js += `};

/**
 * Get best algorithm based on priority: speed > work > span > space
 */
export function getBestAlgorithm(algorithms) {
  const available = algorithms.filter(a => a.available);
  if (available.length === 0) return algorithms[0];
  
  return available.sort((a, b) => {
    const priorities = ['speed', 'work', 'span', 'space'];
    for (const key of priorities) {
      const diff = (a.metrics[key] || Infinity) - (b.metrics[key] || Infinity);
      if (diff !== 0) return diff;
    }
    return 0;
  })[0];
}

/**
 * Get all available algorithms
 */
export function getAvailableAlgorithms(problemName, type) {
  const problem = algorithmVariants[problemName];
  if (!problem) return [];
  
  const algorithms = type === 'classical' ? problem.classical : problem.quantum;
  return algorithms.filter(a => a.available);
}

/**
 * Get algorithm by key
 */
export function getAlgorithmByKey(problemName, type, key) {
  const problem = algorithmVariants[problemName];
  if (!problem) return null;
  
  const algorithms = type === 'classical' ? problem.classical : problem.quantum;
  return algorithms.find(a => a.key === key) || null;
}
`;

  return js;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('🚀 Starting Algorithm Sync from Google Sheets\n');
  console.log('=' .repeat(70));
  
  try {
    // Get Google Sheets client
    const sheets = await getGoogleSheetsClient();
    
    // Fetch all sheet data
    console.log('\n📥 Fetching data from Google Sheets...\n');
    const sheetsData = {
      parallel: await fetchSheetData(sheets, CONFIG.SHEETS.PARALLEL),
      quantum: await fetchSheetData(sheets, CONFIG.SHEETS.QUANTUM),
      sheet1: await fetchSheetData(sheets, CONFIG.SHEETS.SHEET1),
      approx: await fetchSheetData(sheets, CONFIG.SHEETS.APPROX)
    };
    
    // Parse all problems
    const problemsData = {};
    
    for (const [problemName, names] of Object.entries(CONFIG.PROBLEMS)) {
      const result = await parseProblem(sheets, problemName, names, sheetsData);
      if (result) {
        problemsData[problemName] = result;
      }
    }
    
    // Generate JavaScript file
    console.log('\n📝 Generating algorithmVariants.js...');
    const jsContent = generateJavaScriptFile(problemsData);
    
    // Write to file
    const outputPath = path.resolve(process.cwd(), CONFIG.OUTPUT_FILE);
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    
    console.log(`   ✅ Written to: ${outputPath}`);
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ SYNC COMPLETE!\n');
    console.log('Summary:');
    for (const [problemName, data] of Object.entries(problemsData)) {
      const classicalAvailable = data.classical.filter(a => a.available).length;
      const quantumAvailable = data.quantum.filter(a => a.available).length;
      console.log(`  • ${problemName}: ${classicalAvailable} classical + ${quantumAvailable} quantum`);
    }
    console.log('');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };