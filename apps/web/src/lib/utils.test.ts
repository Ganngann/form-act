import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
    });

    it('should handle array inputs', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2');
    });

    it('should handle object inputs (clsx behavior)', () => {
      expect(cn({ class1: true, class2: false })).toBe('class1');
    });

    it('should merge tailwind classes correctly (twMerge)', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2'); // twMerge should keep the last one
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });
  });
});
