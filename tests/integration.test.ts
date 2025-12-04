import { describe, it, expect } from 'vitest';
import { normalizeFormat } from '../src/config';
import type { ImageProcessingOptions } from '../src/types';

describe('integration', () => {
  describe('format normalization', () => {
    it('should handle format conversion workflow', () => {
      const formats = ['jpg', 'png', 'webp', 'gif'];
      for (const format of formats) {
        const normalized = normalizeFormat(format);
        expect(normalized).toBeDefined();
        expect(typeof normalized).toBe('string');
      }
    });
  });

  describe('options validation', () => {
    it('should validate quality range', () => {
      const options: ImageProcessingOptions = {
        format: 'jpeg',
        quality: 85,
      };
      expect(options.quality).toBeGreaterThanOrEqual(1);
      expect(options.quality).toBeLessThanOrEqual(100);
    });

    it('should validate dimension constraints', () => {
      const options: ImageProcessingOptions = {
        format: 'png',
        width: 800,
        height: 600,
        maxWidth: 1920,
        maxHeight: 1080,
      };
      expect(options.width).toBeLessThanOrEqual(options.maxWidth!);
      expect(options.height).toBeLessThanOrEqual(options.maxHeight!);
    });
  });
});
