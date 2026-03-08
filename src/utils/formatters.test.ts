import { describe, it, expect } from 'vitest';
import { formatDuration, toISODate, formatDisplayDate } from '@/utils/formatters';

describe('formatDuration', () => {
  it('formats whole hours', () => {
    expect(formatDuration(8)).toBe('8h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(8.75)).toBe('8h 45m');
  });

  it('formats half hours', () => {
    expect(formatDuration(1.5)).toBe('1h 30m');
  });

  it('formats zero hours', () => {
    expect(formatDuration(0)).toBe('0h');
  });
});

describe('toISODate', () => {
  it('returns YYYY-MM-DD for a given date', () => {
    const d = new Date('2025-03-08T12:00:00Z');
    expect(toISODate(d)).toBe('2025-03-08');
  });
});

describe('formatDisplayDate', () => {
  it('returns a display-friendly date string', () => {
    const result = formatDisplayDate('2025-03-08');
    expect(result).toContain('2025');
    expect(result).toContain('Mar');
  });
});
