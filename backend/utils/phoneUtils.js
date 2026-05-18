/**
 * Generates possible variations of a given mobile number (e.g. with and without '+91' or '91' country code).
 * Useful for querying the database in a country-code insensitive manner.
 * 
 * @param {string|number} mobile - The input mobile number.
 * @returns {string[]} An array of unique phone number variations.
 */
const getMobileVariations = (mobile) => {
  if (!mobile) return [];
  
  // Clean spaces, hyphens, and parentheses, keeping digits and '+'
  const clean = mobile.toString().trim().replace(/[\s-()]/g, '');
  const variations = [clean];
  
  // Get raw digits
  const digits = clean.replace(/\D/g, '');
  
  if (digits.length === 10) {
    // 10-digit number entered: e.g. 9876543210
    variations.push(digits);
    variations.push(`+91${digits}`);
    variations.push(`91${digits}`);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    // 12-digit number starting with 91: e.g. 919876543210 or +919876543210
    const core = digits.substring(2);
    variations.push(core);
    variations.push(`+91${core}`);
    variations.push(`91${core}`);
  }
  
  // Also support stripping a leading '+' from clean if present
  if (clean.startsWith('+')) {
    variations.push(clean.substring(1));
  } else {
    variations.push(`+${clean}`);
  }

  return Array.from(new Set(variations));
};

module.exports = {
  getMobileVariations
};
