/**
 * Utility functions for formatting numbers in scientific notation
 */

/**
 * Format a number in scientific notation
 * @param {number} value - The number to format
 * @param {number} precision - Number of decimal places (default: 2)
 * @returns {string} Formatted string like "1.23e+10"
 */
export function toScientific(value, precision = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  if (value === 0) {
    return '0';
  }
  
  if (value === Infinity) {
    return '∞';
  }
  
  if (value === -Infinity) {
    return '-∞';
  }
  
  // Use toExponential for scientific notation
  return value.toExponential(precision);
}

/**
 * Format a number in scientific notation with HTML superscript
 * @param {number} value - The number to format
 * @param {number} precision - Number of decimal places (default: 2)
 * @returns {string} HTML string like "1.23 × 10<sup>10</sup>"
 */
export function toScientificHTML(value, precision = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  if (value === 0) {
    return '0';
  }
  
  if (value === Infinity) {
    return '∞';
  }
  
  if (value === -Infinity) {
    return '-∞';
  }
  
  const exponential = value.toExponential(precision);
  const parts = exponential.split('e');
  const mantissa = parseFloat(parts[0]);
  const exponent = parseInt(parts[1]);
  
  if (exponent === 0) {
    return mantissa.toString();
  }
  
  return `${mantissa} × 10<sup>${exponent}</sup>`;
}

/**
 * Format large numbers in scientific notation (threshold: > 10,000 or < 0.001)
 * @param {number} value - The number to format
 * @param {number} precision - Number of decimal places (default: 2)
 * @returns {string} Formatted string
 */
export function formatLargeNumber(value, precision = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  if (value === 0) {
    return '0';
  }
  
  if (value === Infinity) {
    return '∞';
  }
  
  if (value === -Infinity) {
    return '-∞';
  }
  
  const absValue = Math.abs(value);
  
  // Use scientific notation for very large or very small numbers
  if (absValue >= 10000 || (absValue < 0.001 && absValue > 0)) {
    return toScientific(value, precision);
  }
  
  // Otherwise use regular formatting
  return value.toFixed(precision);
}

/**
 * Format years in scientific notation if needed
 * @param {number} years - Number of years
 * @returns {string} Formatted string with "years" suffix
 */
export function formatYears(years) {
  if (years === null || years === undefined || isNaN(years)) {
    return 'N/A';
  }
  
  if (years === Infinity) {
    return '∞ years';
  }
  
  if (years >= 1e6) {
    return `${toScientific(years, 2)} years`;
  }
  
  if (years >= 1000) {
    return `${toScientific(years, 2)} years`;
  }
  
  return `${years.toFixed(1)} years`;
}

/**
 * Format time duration with appropriate units
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted string like "5.23 days" or "1.2e+10 years"
 */
export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds)) {
    return 'N/A';
  }
  
  if (seconds === Infinity) {
    return '∞';
  }
  
  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const year = 365.25 * day;
  
  if (seconds < minute) {
    return `${toScientific(seconds, 2)} seconds`;
  } else if (seconds < hour) {
    return `${toScientific(seconds / minute, 2)} minutes`;
  } else if (seconds < day) {
    return `${toScientific(seconds / hour, 2)} hours`;
  } else if (seconds < year) {
    return `${toScientific(seconds / day, 2)} days`;
  } else {
    return `${toScientific(seconds / year, 2)} years`;
  }
}

/**
 * Format log10 value to actual value in scientific notation
 * @param {number} log10Value - Log10 of the value
 * @param {number} precision - Number of decimal places (default: 2)
 * @returns {string} Formatted string
 */
export function fromLog10ToScientific(log10Value, precision = 2) {
  if (log10Value === null || log10Value === undefined || isNaN(log10Value)) {
    return 'N/A';
  }
  
  if (log10Value === Infinity) {
    return '∞';
  }
  
  if (log10Value === -Infinity) {
    return '0';
  }
  
  const actualValue = Math.pow(10, log10Value);
  return toScientific(actualValue, precision);
}