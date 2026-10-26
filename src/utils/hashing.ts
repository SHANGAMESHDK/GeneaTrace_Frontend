// Simple deterministic pseudo-SHA256 representation for demo purposes
export function pseudoHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = ((Math.abs(hash * 31)) >>> 0).toString(16).padStart(8, '0');
  const part3 = ((Math.abs(hash * 97)) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((Math.abs(hash * 389)) >>> 0).toString(16).padStart(8, '0');
  return `0x${hex}${part2}${part3}${part4}`.toLowerCase();
}

export function formatAddress(hash: string, chars = 6): string {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}
