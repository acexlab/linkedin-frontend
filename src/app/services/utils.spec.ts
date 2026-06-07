import { timeAgo } from './utils';

describe('Utils: timeAgo', () => {
  it('should return "just now" for current times', () => {
    const nowIso = new Date().toISOString();
    expect(timeAgo(nowIso)).toBe('just now');
  });

  it('should return minutes format', () => {
    const past = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(past)).toBe('5m');
  });

  it('should return hours format', () => {
    const past = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(timeAgo(past)).toBe('3h');
  });

  it('should return days format', () => {
    const past = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();
    expect(timeAgo(past)).toBe('2d');
  });

  it('should return weeks format', () => {
    const past = new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString();
    expect(timeAgo(past)).toBe('1w');
  });
});
