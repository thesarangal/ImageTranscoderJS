import { describe, it, expect } from 'vitest';
import { getFileExtension, isImageExtension } from '../src/imageProcessor';

describe('imageProcessor', () => {
  describe('getFileExtension', () => {
    it('should extract file extension without dot', () => {
      expect(getFileExtension('image.jpg')).toBe('jpg');
      expect(getFileExtension('image.PNG')).toBe('png');
      expect(getFileExtension('path/to/image.webp')).toBe('webp');
    });

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('image')).toBe('');
      expect(getFileExtension('path/to/image')).toBe('');
    });
  });

  describe('isImageExtension', () => {
    it('should return true for image extensions', () => {
      expect(isImageExtension('jpg')).toBe(true);
      expect(isImageExtension('jpeg')).toBe(true);
      expect(isImageExtension('png')).toBe(true);
      expect(isImageExtension('webp')).toBe(true);
      expect(isImageExtension('gif')).toBe(true);
      expect(isImageExtension('JPG')).toBe(true); // Case insensitive
    });

    it('should return false for non-image extensions', () => {
      expect(isImageExtension('txt')).toBe(false);
      expect(isImageExtension('pdf')).toBe(false);
      expect(isImageExtension('doc')).toBe(false);
      expect(isImageExtension('')).toBe(false);
    });
  });
});
