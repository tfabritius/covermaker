export function parseNumberOrFraction(input: string): number | null {
  // Check if input is a valid number
  const number = Number(input);
  if (!Number.isNaN(number)) {
    return number;
  }

  // Check if input is a simple fraction of the form "a/b"
  const fractionMatch = input.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (
      !Number.isNaN(numerator) && !Number.isNaN(denominator) &&
      denominator !== 0
    ) {
      return numerator / denominator;
    }
  }

  // Input is neither a valid number nor a simple fraction
  return null;
}
