import { describe, it, expect } from 'vitest';
import {
  isSupportedInputFormat,
  isSupportedOutputFormat,
  formatSupportsQuality,
  normalizeFormat,
  DEFAULT_QUALITY,
} from '../src/config';

describe('config', () => {
  describe('isSupportedInputFormat', () => {
    it('should return true for supported input formats', () => {
      expect(isSupportedInputFormat('jpg')).toBe(true);
      expect(isSupportedInputFormat('png')).toBe(true);
      expect(isSupportedInputFormat('webp')).toBe(true);
      expect(isSupportedInputFormat('gif')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(isSupportedInputFormat('svg')).toBe(false);
      expect(isSupportedInputFormat('pdf')).toBe(false);
    });
  });

  describe('isSupportedOutputFormat', () => {
    it('should return true for supported output formats', () => {
      expect(isSupportedOutputFormat('jpg')).toBe(true);
      expect(isSupportedOutputFormat('png')).toBe(true);
      expect(isSupportedOutputFormat('webp')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(isSupportedOutputFormat('heic')).toBe(false);
      expect(isSupportedOutputFormat('svg')).toBe(false);
    });
  });

  describe('formatSupportsQuality', () => {
    it('should return true for formats that support quality', () => {
      expect(formatSupportsQuality('jpg')).toBe(true);
      expect(formatSupportsQuality('jpeg')).toBe(true);
      expect(formatSupportsQuality('webp')).toBe(true);
      expect(formatSupportsQuality('avif')).toBe(true);
    });

    it('should return false for formats that do not support quality', () => {
      expect(formatSupportsQuality('png')).toBe(false);
      expect(formatSupportsQuality('gif')).toBe(false);
    });
  });

  describe('normalizeFormat', () => {
    it('should normalize jpg to jpeg', () => {
      expect(normalizeFormat('jpg')).toBe('jpeg');
      expect(normalizeFormat('JPG')).toBe('jpeg');
    });

    it('should return lowercase format for other formats', () => {
      expect(normalizeFormat('PNG')).toBe('png');
      expect(normalizeFormat('WebP')).toBe('webp');
    });

    it('should throw error for unsupported formats', () => {
      expect(() => normalizeFormat('svg')).toThrow();
      expect(() => normalizeFormat('pdf')).toThrow();
    });
  });

  describe('DEFAULT_QUALITY', () => {
    it('should have a reasonable default quality value', () => {
      expect(DEFAULT_QUALITY).toBeGreaterThanOrEqual(1);
      expect(DEFAULT_QUALITY).toBeLessThanOrEqual(100);
      expect(DEFAULT_QUALITY).toBe(80);
    });
  });
});
