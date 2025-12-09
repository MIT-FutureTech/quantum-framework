/**
 * Comprehensive algorithm variants extracted from three CSV sources:
 * 1. Parallel_Algos.csv - Parallel classical algorithms
 * 2. Quantum_Algorithms.csv - Quantum algorithms
 * 3. Sheet1.csv - Sequential classical algorithms
 * 
 * This provides the most complete coverage with both parallel and sequential classical variants.
 * 
 * Problems included:
 * - Integer Factorization (15 classical [7 parallel + 8 sequential], 6 quantum)
 * - Database Search (13 classical [5 parallel + 8 sequential], 2 quantum)
 * 
 * Formulas use:
 * - n: problem size (bits to factor, array size, string length, etc.)
 * - m: secondary parameter (e.g., pattern length in string search)
 * - p: number of processors (for parallel classical algorithms only)
 * - q: number of qubits (for quantum algorithms)
 * 
 * Metrics for ranking (lower is better):
 * - speed: 1 = fastest, 2 = medium, 3 = slower
 * - work: 1 = least work, 2 = medium, 3 = more work
 * - span: 1 = lowest span/depth, 2 = medium, 3 = higher span
 * - space: 1 = least space, 2 = medium, 3 = more space
 */

export const algorithmVariants = {
    /**
     * INTEGER FACTORIZATION
     * Problem: Factor an n-bit integer into its prime factors
     * Variables: n = number of bits in the integer to factor
     * 
     * Includes both parallel and sequential classical algorithms
     */
    'Integer Factorization': {
      classical: [
        {
          key: 'gnfs-parallel',
          name: 'GNFS (General Number Field Sieve) - Parallel',
          description: 'State-of-the-art classical factoring with parallelization',
          available: true,
          runtimeFormula: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3)) / p',
          workFormula: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3))',
          metrics: { speed: 1, work: 1, span: 2, space: 2 },
          reference: 'Yang et al. (2005-2017) - Multiple parallel GNFS implementations',
          parallel: true
        },
        {
          key: 'rational-sieve-parallel',
          name: 'Rational Sieve - Parallel',
          description: 'GNFS variant with different complexity constant',
          available: true,
          runtimeFormula: 'e^((32/9 * n)^(1/3) * log(n, e)^(2/3)) / p',
          workFormula: 'e^((32/9 * n)^(1/3) * log(n, e)^(2/3))',
          metrics: { speed: 1, work: 1, span: 2, space: 2 },
          reference: 'Rational sieve - Parallel implementation',
          parallel: true
        },
        {
          key: 'quadratic-sieve-parallel',
          name: 'Quadratic Sieve - Parallel',
          description: 'Effective for smaller integers, parallelizes well',
          available: true,
          runtimeFormula: 'e^(sqrt(9/8) * sqrt(n * log(n, e))) / p',
          workFormula: 'e^(sqrt(9/8) * sqrt(n * log(n, e)))',
          metrics: { speed: 2, work: 2, span: 2, space: 2 },
          reference: 'Åsbrink, Brynielsson (2000), Silverman (1987)',
          parallel: true
        },
        {
          key: 'trial-division-parallel',
          name: 'Trial Division - Parallel',
          description: 'Embarrassingly parallel but exponential complexity',
          available: true,
          runtimeFormula: 'sqrt(n) / p',
          workFormula: 'sqrt(n)',
          metrics: { speed: 3, work: 3, span: 1, space: 1 },
          reference: 'Yan - Parallel trial division',
          parallel: true
        },
        
        {
          key: 'gnfs-sequential',
          name: 'GNFS (General Number Field Sieve)',
          description: 'Best known classical algorithm for large integers',
          available: true,
          runtimeFormula: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3))',
          workFormula: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3))',
          metrics: { speed: 1, work: 1, span: 3, space: 2 },
          reference: 'General Number Field Sieve - Sequential',
          parallel: false
        },
        {
          key: 'quadratic-sieve',
          name: 'Quadratic Sieve',
          description: 'Second-fastest known algorithm, simpler than GNFS',
          available: true,
          runtimeFormula: 'e^(sqrt((1 * n * log(n, e))))',
          workFormula: 'e^(sqrt((1 * n * log(n, e))))',
          metrics: { speed: 2, work: 2, span: 3, space: 2 },
          reference: 'Multiple Polynomial Quadratic Sieve',
          parallel: false
        },
        {
          key: 'rational-sieve',
          name: 'Rational Sieve',
          description: 'Similar to quadratic sieve with different parameters',
          available: true,
          runtimeFormula: 'e^(sqrt((2 * n * log(n, e))))',
          workFormula: 'e^(sqrt((2 * n * log(n, e))))',
          metrics: { speed: 2, work: 2, span: 3, space: 2 },
          reference: 'Rational Sieve algorithm',
          parallel: false
        },
        {
          key: 'cfrac',
          name: 'CFRAC (Continued Fraction)',
          description: 'Historical algorithm, predecessor to quadratic sieve',
          available: true,
          runtimeFormula: 'e^(sqrt(2 * n * log(n, e)))',
          workFormula: 'e^(sqrt(2 * n * log(n, e)))',
          metrics: { speed: 2, work: 2, span: 3, space: 2 },
          reference: 'Continued Fraction Factorization',
          parallel: false
        },
        {
          key: 'dixon',
          name: "Dixon's Algorithm",
          description: 'First subexponential factoring algorithm',
          available: true,
          runtimeFormula: 'e^(2 * sqrt(2) * sqrt(n * log(n, e)))',
          workFormula: 'e^(2 * sqrt(2) * sqrt(n * log(n, e)))',
          metrics: { speed: 2, work: 2, span: 3, space: 2 },
          reference: 'Dixon (1981) - Random squares method',
          parallel: false
        },
        {
          key: 'squfof',
          name: 'SQUFOF (Square Forms Factorization)',
          description: 'Fast for integers up to ~100 digits',
          available: true,
          runtimeFormula: '2^(n/4)',
          workFormula: '2^(n/4)',
          metrics: { speed: 2, work: 2, span: 3, space: 1 },
          reference: 'Shanks - Square Forms Factorization',
          parallel: false
        },
        {
          key: 'trial-division',
          name: 'Trial Division',
          description: 'Simple but inefficient for large numbers',
          available: true,
          runtimeFormula: '2^(n/2)',
          workFormula: '2^(n/2)',
          metrics: { speed: 3, work: 3, span: 3, space: 1 },
          reference: 'Basic trial division algorithm',
          parallel: false
        },
        {
          key: 'wheel-factorization',
          name: 'Wheel Factorization',
          description: 'Optimized trial division skipping multiples',
          available: true,
          runtimeFormula: '2^(n/2)',
          workFormula: '2^(n/2)',
          metrics: { speed: 3, work: 3, span: 3, space: 1 },
          reference: 'Wheel factorization optimization',
          parallel: false
        },
        {
          key: 'fermat',
          name: "Fermat's Factorization",
          description: 'Good for numbers with factors close to sqrt(n)',
          available: true,
          runtimeFormula: '2^n',
          workFormula: '2^n',
          metrics: { speed: 3, work: 3, span: 3, space: 1 },
          reference: 'Fermat factorization method',
          parallel: false
        },
        {
          key: 'euler-factorization',
          name: "Euler's Factorization",
          description: 'Extension of Fermat method',
          available: true,
          runtimeFormula: '2^(n/2)',
          workFormula: '2^(n/2)',
          metrics: { speed: 3, work: 3, span: 3, space: 1 },
          reference: 'Euler factorization method',
          parallel: false
        },
        {
          key: 'williams-p-plus-1',
          name: "Williams' p+1 Algorithm",
          description: 'Complement to Pollard p-1, finds certain special factors',
          available: true,
          runtimeFormula: '2^n',
          workFormula: '2^n',
          metrics: { speed: 3, work: 3, span: 3, space: 2 },
          reference: 'Williams p+1 algorithm',
          parallel: false
        },
        
        {
          key: 'ecm-lenstra',
          name: 'Elliptic Curve Method (Lenstra)',
          description: 'Effective for finding medium-sized factors',
          available: false,
          runtimeFormula: null,
          workFormula: null,
          metrics: { speed: 2, work: 2, span: 2, space: 2 },
          reference: 'Lenstra ECM - complex formula based on factor size',
          parallel: false,
          note: 'Depends on smallest prime factor size'
        },
        {
          key: 'pollard-rho',
          name: "Pollard's Rho Algorithm",
          description: 'Probabilistic algorithm, good for small factors',
          available: false,
          runtimeFormula: null,
          workFormula: null,
          metrics: { speed: 2, work: 2, span: 3, space: 1 },
          reference: 'Pollard Rho - expected runtime varies',
          parallel: false,
          note: 'Expected runtime depends on smallest factor'
        },
        {
          key: 'pollard-p-minus-1',
          name: "Pollard's p-1 Algorithm",
          description: 'Finds factors with smooth p-1 values',
          available: false,
          runtimeFormula: null,
          workFormula: null,
          metrics: { speed: 2, work: 2, span: 3, space: 2 },
          reference: 'Pollard p-1 algorithm',
          parallel: false,
          note: 'Depends on smoothness bound B'
        },
        {
          key: 'special-nfs',
          name: 'Special Number Field Sieve',
          description: 'Optimized GNFS for numbers with special form',
          available: false,
          runtimeFormula: null,
          workFormula: null,
          metrics: { speed: 1, work: 1, span: 2, space: 2 },
          reference: 'SNFS - only for special form numbers',
          parallel: false,
          note: 'Only applicable to numbers of special form'
        }
      ],
      quantum: [
        {
          key: 'jacobi',
          name: 'Jacobi Factoring',
          description: 'Near-linear gates with sublinear depth - 2024 breakthrough',
          available: true,
          runtimeFormula: 'n * log(n, e)',
          workFormula: 'n * log(n, e) * q',
          metrics: { speed: 1, work: 1, span: 1, space: 1 },
          reference: 'Kahanamoku-Meyer et al. (2024)'
        },
        {
          key: 'shor',
          name: "Shor's Algorithm",
          description: 'Original quantum factoring breakthrough - polynomial time',
          available: true,
          runtimeFormula: 'n^2 * log(n, e) * log(log(n, e))',
          workFormula: 'n^2 * log(n, e) * log(log(n, e)) * q',
          metrics: { speed: 1, work: 1, span: 1, space: 2 },
          reference: 'Shor (1994)'
        },
        {
          key: 'regev',
          name: "Regev's Algorithm",
          description: 'Reduced circuit complexity improvement over Shor',
          available: true,
          runtimeFormula: 'n^2',
          workFormula: 'n^2 * q',
          metrics: { speed: 1, work: 1, span: 1, space: 2 },
          reference: 'Regev (2023)'
        },
        {
          key: 'gidney-ekera',
          name: 'Gidney-Ekera',
          description: 'Practical near-term quantum implementation focus',
          available: true,
          runtimeFormula: '0.3 * n^3 * log(n, e) + 0.005 * n^3 * log(n, e) * log(log(n, e))',
          workFormula: '0.3 * n^3 * log(n, e) * q',
          metrics: { speed: 2, work: 2, span: 2, space: 1 },
          reference: 'Gidney, Ekera (2021)'
        },
        {
          key: 'chevnigard',
          name: 'Chevnigard',
          description: 'Reduces qubit requirements',
          available: true,
          runtimeFormula: 'n^3 * log(n, e)',
          workFormula: 'n^3 * log(n, e) * q',
          metrics: { speed: 2, work: 2, span: 2, space: 1 },
          reference: 'Chevnigard et al. (2024)'
        },
        {
          key: 'sqif',
          name: 'SQIF (Sublinear Quantum Integer Factoring)',
          description: 'Experimental sublinear resource approach',
          available: false,
          runtimeFormula: null,
          workFormula: null,
          metrics: { speed: 1, work: 1, span: 1, space: 1 },
          reference: 'Bao Yan et al. (2022)',
          note: 'Formula incomplete in source data'
        }
      ]
    },
  
    /**
     * DATABASE SEARCH / STRING SEARCH
     * Problem: Search for a pattern/element in data
     * Variables: n = size of text/database, m = size of pattern (if applicable)
     * 
     * Includes both parallel and sequential classical algorithms
     */
    'Database Search': {
      classical: [
        {
          key: 'galil-parallel',
          name: "Galil's Constant Time Search",
          description: 'Achieves O(1) time with sufficient parallelism',
          available: true,
          runtimeFormula: '1',
          workFormula: 'n',
          metrics: { speed: 1, work: 2, span: 1, space: 2 },
          reference: 'Galil - Constant time parallel search',
          parallel: true
        },
        {
          key: 'berkman-parallel',
          name: 'Berkman et al. Ultra-Fast',
          description: 'O(log log n) depth parallel search',
          available: true,
          runtimeFormula: 'log(log(n, e), e)',
          workFormula: 'n',
          metrics: { speed: 1, work: 2, span: 1, space: 2 },
          reference: 'Berkman et al. - Log-log depth',
          parallel: true
        },
        {
          key: 'vishkin-parallel',
          name: 'Vishkin Logarithmic Search',
          description: 'O(log n) time parallel algorithm',
          available: true,
          runtimeFormula: 'log(n, e)',
          workFormula: 'n * log(n, e)',
          metrics: { speed: 1, work: 2, span: 1, space: 2 },
          reference: 'Vishkin - CRCW PRAM',
          parallel: true
        },
        {
          key: 'kedem-parallel',
          name: 'Kedem et al. Parallel',
          description: 'Efficient parallel string matching',
          available: true,
          runtimeFormula: 'log(n, e) / p',
          workFormula: 'log(n, e)',
          metrics: { speed: 1, work: 1, span: 1, space: 2 },
          reference: 'Kedem et al.',
          parallel: true
        },
        {
          key: 'ferragina-luccio',
          name: 'Ferragina-Luccio Parallel',
          description: 'Complex parallel string matching algorithm',
          available: true,
          runtimeFormula: '(n * log(n, e)^2 / p) + (n * log(n, e)^2 / (p * log(n / p, e)))',
          workFormula: 'n * log(n, e)^2',
          metrics: { speed: 1, work: 2, span: 1, space: 2 },
          reference: 'Ferragina, Luccio',
          parallel: true
        },

        {
          key: 'kmp',
          name: 'Knuth-Morris-Pratt (KMP)',
          description: 'Optimal sequential string matching - O(m+n)',
          available: true,
          runtimeFormula: 'm + n',
          workFormula: 'm + n',
          metrics: { speed: 1, work: 1, span: 3, space: 1 },
          reference: 'Knuth, Morris, Pratt (1977)',
          parallel: false
        },
        {
          key: 'boyer-moore',
          name: 'Boyer-Moore',
          description: 'Sublinear average case, skips characters',
          available: true,
          runtimeFormula: 'm * n',
          workFormula: 'm * n',
          metrics: { speed: 2, work: 2, span: 3, space: 1 },
          reference: 'Boyer, Moore (1977)',
          parallel: false
        },
        {
          key: 'rabin-karp',
          name: 'Rabin-Karp',
          description: 'Rolling hash algorithm for pattern matching',
          available: true,
          runtimeFormula: 'm * n',
          workFormula: 'm * n',
          metrics: { speed: 2, work: 2, span: 3, space: 1 },
          reference: 'Rabin, Karp - Hash-based search',
          parallel: false
        },
        {
          key: 'naive-search',
          name: 'Naive Search',
          description: 'Brute force - check every position',
          available: true,
          runtimeFormula: 'm * (n - m + 1)',
          workFormula: 'm * (n - m + 1)',
          metrics: { speed: 3, work: 3, span: 3, space: 1 },
          reference: 'Basic naive string search',
          parallel: false
        },
        {
          key: 'bitap',
          name: 'Bitap Algorithm',
          description: 'Bitwise string matching, fuzzy matching capable',
          available: true,
          runtimeFormula: 'm * n',
          workFormula: 'm * n',
          metrics: { speed: 2, work: 2, span: 3, space: 1 },
          reference: 'Bitap (shift-or) algorithm',
          parallel: false
        },
        {
          key: 'binary-search',
          name: 'Binary Search',
          description: 'O(log n) for sorted data',
          available: true,
          runtimeFormula: 'log(n, 2)',
          workFormula: 'log(n, 2)',
          metrics: { speed: 1, work: 1, span: 3, space: 1 },
          reference: 'Classic binary search - requires sorted data',
          parallel: false
        },
        {
          key: 'interpolation-search',
          name: 'Interpolation Search',
          description: 'O(log log n) average for uniform data',
          available: true,
          runtimeFormula: 'log(log(n, e), e)',
          workFormula: 'log(log(n, e), e)',
          metrics: { speed: 1, work: 1, span: 3, space: 1 },
          reference: 'Interpolation search',
          parallel: false
        },
        {
          key: 'linear-search',
          name: 'Linear Search',
          description: 'Sequential scan - O(n)',
          available: true,
          runtimeFormula: 'n',
          workFormula: 'n',
          metrics: { speed: 3, work: 3, span: 3, space: 1 },
          reference: 'Basic linear search',
          parallel: false
        }
      ],
      quantum: [
        {
          key: 'grover',
          name: "Grover's Algorithm",
          description: 'Optimal quantum search - quadratic speedup',
          available: true,
          runtimeFormula: 'sqrt(n)',
          workFormula: 'sqrt(n) * q',
          metrics: { speed: 1, work: 1, span: 1, space: 2 },
          reference: 'Grover (1996) - Proven optimal'
        },
        {
          key: 'quantum-walk',
          name: 'Quantum Walk Search',
          description: 'Quantum walk for structured search',
          available: true,
          runtimeFormula: 'sqrt(n * log(n, e))',
          workFormula: 'sqrt(n * log(n, e)) * q',
          metrics: { speed: 1, work: 1, span: 1, space: 2 },
          reference: 'Quantum walk-based algorithms'
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