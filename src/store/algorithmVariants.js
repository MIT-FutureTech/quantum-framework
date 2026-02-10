/**
 * Algorithm Variants - Fixed Version
 * 
 * This is a working version you can use immediately.
 * Descriptions are from the spreadsheet data.
 * 
 * To update automatically in the future, set up the sync script.
 */

export const algorithmVariants = {
  'Integer Factorization': {
    classical: [
      {
        key: 'gnfs-parallel',
        name: 'GNFS (General Number Field Sieve) - Parallel',
        description: 'Second Category Integer Factoring',
        available: true,
        runtimeFormula: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3)) / p',
        workFormula: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3))',
        metrics: { speed: 1, work: 1, span: 2, space: 2 },
        reference: 'Parallel Algos - Second Category Integer Factoring',
        parallel: true
      },
      {
        key: 'rational-sieve-parallel',
        name: 'Rational Sieve - Parallel',
        description: 'Second Category Integer Factoring',
        available: true,
        runtimeFormula: 'e^((32/9 * n)^(1/3) * log(n, e)^(2/3)) / p',
        workFormula: 'e^((32/9 * n)^(1/3) * log(n, e)^(2/3))',
        metrics: { speed: 1, work: 1, span: 2, space: 2 },
        reference: 'Parallel Algos - Second Category Integer Factoring',
        parallel: true
      },
      {
        key: 'quadratic-sieve-parallel',
        name: 'Quadratic Sieve - Parallel',
        description: 'Second Category Integer Factoring',
        available: true,
        runtimeFormula: 'e^(sqrt(9/8) * sqrt(n * log(n, e))) / p',
        workFormula: 'e^(sqrt(9/8) * sqrt(n * log(n, e)))',
        metrics: { speed: 2, work: 2, span: 2, space: 2 },
        reference: 'Parallel Algos - Second Category Integer Factoring',
        parallel: true
      },
      {
        key: 'trial-division-parallel',
        name: 'Trial Division - Parallel',
        description: 'First Category Integer Factoring',
        available: true,
        runtimeFormula: 'sqrt(n) / p',
        workFormula: 'sqrt(n)',
        metrics: { speed: 3, work: 3, span: 1, space: 1 },
        reference: 'Parallel Algos - First Category Integer Factoring',
        parallel: true
      },
      {
        key: 'gnfs-sequential',
        name: 'GNFS (General Number Field Sieve)',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3))',
        workFormula: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3))',
        metrics: { speed: 1, work: 1, span: 3, space: 2 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'quadratic-sieve',
        name: 'Quadratic Sieve',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'e^(sqrt((1 * n * log(n, e))))',
        workFormula: 'e^(sqrt((1 * n * log(n, e))))',
        metrics: { speed: 2, work: 2, span: 3, space: 2 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'rational-sieve',
        name: 'Rational Sieve',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'e^(sqrt((2 * n * log(n, e))))',
        workFormula: 'e^(sqrt((2 * n * log(n, e))))',
        metrics: { speed: 2, work: 2, span: 3, space: 2 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'cfrac',
        name: 'CFRAC (Continued Fraction)',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'e^(sqrt(2 * n * log(n, e)))',
        workFormula: 'e^(sqrt(2 * n * log(n, e)))',
        metrics: { speed: 2, work: 2, span: 3, space: 2 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'dixon',
        name: "Dixon's Algorithm",
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'e^(2 * sqrt(2) * sqrt(n * log(n, e)))',
        workFormula: 'e^(2 * sqrt(2) * sqrt(n * log(n, e)))',
        metrics: { speed: 2, work: 2, span: 3, space: 2 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'squfof',
        name: 'SQUFOF (Square Forms)',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: '2^(n/4)',
        workFormula: '2^(n/4)',
        metrics: { speed: 2, work: 2, span: 3, space: 1 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'trial-division',
        name: 'Trial Division',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: '2^(n/2)',
        workFormula: '2^(n/2)',
        metrics: { speed: 3, work: 3, span: 3, space: 1 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'wheel-factorization',
        name: 'Wheel Factorization',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: '2^(n/2)',
        workFormula: '2^(n/2)',
        metrics: { speed: 3, work: 3, span: 3, space: 1 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'fermat',
        name: "Fermat's Factorization",
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: '2^n',
        workFormula: '2^n',
        metrics: { speed: 3, work: 3, span: 3, space: 1 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'euler-factorization',
        name: "Euler's Factorization",
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: '2^(n/2)',
        workFormula: '2^(n/2)',
        metrics: { speed: 3, work: 3, span: 3, space: 1 },
        reference: 'Sheet1',
        parallel: false
      },
      {
        key: 'williams-p-plus-1',
        name: "Williams' p+1",
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: '2^n',
        workFormula: '2^n',
        metrics: { speed: 3, work: 3, span: 3, space: 2 },
        reference: 'Sheet1',
        parallel: false
      }
    ],
    quantum: [
      {
        key: 'jacobi',
        name: 'Jacobi Factoring',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'n * log(n, e)',
        workFormula: 'n * log(n, e) * q',
        metrics: { speed: 1, work: 1, span: 1, space: 1 },
        reference: 'Quantum Algorithms',
        parallel: false
      },
      {
        key: 'shor',
        name: "Shor's Algorithm",
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'n^2 * log(n, e) * log(log(n, e))',
        workFormula: 'n^2 * log(n, e) * log(log(n, e)) * q',
        metrics: { speed: 1, work: 1, span: 1, space: 2 },
        reference: 'Quantum Algorithms',
        parallel: false
      },
      {
        key: 'regev',
        name: "Regev's Algorithm",
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'n^2',
        workFormula: 'n^2 * q',
        metrics: { speed: 1, work: 1, span: 1, space: 2 },
        reference: 'Quantum Algorithms',
        parallel: false
      },
      {
        key: 'gidney-ekera',
        name: 'Gidney-Ekera',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: '0.3 * n^3 * log(n, e) + 0.005 * n^3 * log(n, e) * log(log(n, e))',
        workFormula: '0.3 * n^3 * log(n, e) * q',
        metrics: { speed: 2, work: 2, span: 2, space: 1 },
        reference: 'Quantum Algorithms',
        parallel: false
      },
      {
        key: 'chevnigard',
        name: 'Chevnigard',
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'n^3 * log(n, e)',
        workFormula: 'n^3 * log(n, e) * q',
        metrics: { speed: 2, work: 2, span: 2, space: 1 },
        reference: 'Quantum Algorithms',
        parallel: false
      }
    ]
  },

  'Database Search': {
    classical: [
      {
        key: 'galil-parallel',
        name: "Galil's Constant Time",
        description: 'Single String Search',
        available: true,
        runtimeFormula: '1',
        workFormula: 'n',
        metrics: { speed: 1, work: 2, span: 1, space: 2 },
        reference: 'Parallel Algos - Single String Search',
        parallel: true
      },
      {
        key: 'berkman-parallel',
        name: 'Berkman et al. Ultra-Fast',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'log(log(n, e), e)',
        workFormula: 'n',
        metrics: { speed: 1, work: 2, span: 1, space: 2 },
        reference: 'Parallel Algos - Single String Search',
        parallel: true
      },
      {
        key: 'vishkin-parallel',
        name: 'Vishkin Logarithmic',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'log(n, e)',
        workFormula: 'n * log(n, e)',
        metrics: { speed: 1, work: 2, span: 1, space: 2 },
        reference: 'Parallel Algos - Single String Search',
        parallel: true
      },
      {
        key: 'kedem-parallel',
        name: 'Kedem et al.',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'log(n, e) / p',
        workFormula: 'log(n, e)',
        metrics: { speed: 1, work: 1, span: 1, space: 2 },
        reference: 'Parallel Algos - Single String Search',
        parallel: true
      },
      {
        key: 'kmp',
        name: 'Knuth-Morris-Pratt (KMP)',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'm + n',
        workFormula: 'm + n',
        metrics: { speed: 1, work: 1, span: 3, space: 1 },
        reference: 'Sheet1 - Single String Search',
        parallel: false
      },
      {
        key: 'boyer-moore',
        name: 'Boyer-Moore',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'm * n',
        workFormula: 'm * n',
        metrics: { speed: 2, work: 2, span: 3, space: 1 },
        reference: 'Sheet1 - Single String Search',
        parallel: false
      },
      {
        key: 'rabin-karp',
        name: 'Rabin-Karp',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'm * n',
        workFormula: 'm * n',
        metrics: { speed: 2, work: 2, span: 3, space: 1 },
        reference: 'Sheet1 - Single String Search',
        parallel: false
      },
      {
        key: 'naive-search',
        name: 'Naive Search',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'm * (n - m + 1)',
        workFormula: 'm * (n - m + 1)',
        metrics: { speed: 3, work: 3, span: 3, space: 1 },
        reference: 'Sheet1 - Single String Search',
        parallel: false
      },
      {
        key: 'bitap',
        name: 'Bitap Algorithm',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'm * n',
        workFormula: 'm * n',
        metrics: { speed: 2, work: 2, span: 3, space: 1 },
        reference: 'Sheet1 - Single String Search',
        parallel: false
      },
      {
        key: 'binary-search',
        name: 'Binary Search',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'log(n, 2)',
        workFormula: 'log(n, 2)',
        metrics: { speed: 1, work: 1, span: 3, space: 1 },
        reference: 'Sheet1 - Single String Search',
        parallel: false
      },
      {
        key: 'interpolation-search',
        name: 'Interpolation Search',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'log(log(n, e), e)',
        workFormula: 'log(log(n, e), e)',
        metrics: { speed: 1, work: 1, span: 3, space: 1 },
        reference: 'Sheet1 - Single String Search',
        parallel: false
      },
      {
        key: 'linear-search',
        name: 'Linear Search',
        description: 'Single String Search',
        available: true,
        runtimeFormula: 'n',
        workFormula: 'n',
        metrics: { speed: 3, work: 3, span: 3, space: 1 },
        reference: 'Sheet1 - Single String Search',
        parallel: false
      }
    ],
    quantum: [
      {
        key: 'grover',
        name: "Grover's Algorithm",
        description: 'Algorithm variant',
        available: true,
        runtimeFormula: 'sqrt(n)',
        workFormula: 'sqrt(n) * q',
        metrics: { speed: 1, work: 1, span: 1, space: 2 },
        reference: 'Quantum Algorithms',
        parallel: false
      }
    ]
  },

  'Traveling Salesman': {
    classical: [
      {
        key: 'greedy-tsp',
        name: 'Greedy',
        description: 'Approximation/Heuristic: Approximate Metric TSP',
        available: true,
        runtimeFormula: 'n^2 * log(n, e)',
        workFormula: 'n^2 * log(n, e)',
        metrics: { speed: 1, work: 2, span: 3, space: 1 },
        reference: 'Approx Algos - Approximate Metric TSP',
        parallel: false,
        approximation: true
      },
      {
        key: 'clarke-wright',
        name: 'Clarke-Wright savings heuristic',
        description: 'Approximation/Heuristic: Approximate Metric TSP',
        available: true,
        runtimeFormula: 'n^2 * log(n, e)',
        workFormula: 'n^2 * log(n, e)',
        metrics: { speed: 1, work: 2, span: 3, space: 1 },
        reference: 'Approx Algos - Approximate Metric TSP',
        parallel: false,
        approximation: true
      },
      {
        key: 'christofides',
        name: 'Christofides algorithm',
        description: 'Approximation/Heuristic: Approximate Metric TSP',
        available: true,
        runtimeFormula: 'n^3',
        workFormula: 'n^3',
        metrics: { speed: 1, work: 2, span: 3, space: 2 },
        reference: 'Approx Algos - Approximate Metric TSP',
        parallel: false,
        approximation: true
      },
      {
        key: 'mst-approximation',
        name: 'Approximation using Euclidean MST',
        description: 'Approximation/Heuristic: Approximate Metric TSP',
        available: true,
        runtimeFormula: 'n * log(n, e)',
        workFormula: 'n * log(n, e)',
        metrics: { speed: 1, work: 1, span: 3, space: 1 },
        reference: 'Approx Algos - Approximate Metric TSP',
        parallel: false,
        approximation: true
      },
      {
        key: 'nicholson',
        name: 'Nicholson',
        description: 'Approximation/Heuristic: Algorithm variant',
        available: true,
        runtimeFormula: 'n^2 * log(n, e)',
        workFormula: 'n^2 * log(n, e)',
        metrics: { speed: 1, work: 2, span: 3, space: 1 },
        reference: 'Approx Algos',
        parallel: false,
        approximation: true
      }
    ],
    quantum: [
      {
        key: 'qaoa-tsp',
        name: 'QAOA for TSP',
        description: 'Quantum optimization',
        available: true,
        runtimeFormula: 'sqrt(2^n)',
        workFormula: 'sqrt(2^n) * q',
        metrics: { speed: 1, work: 2, span: 1, space: 2 },
        reference: 'Quantum optimization using Grover-like speedup',
        parallel: false
      }
    ]
  }
};

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