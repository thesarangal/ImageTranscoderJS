import type { ImageFormat, ImageProcessingOptions } from './types';

/**
 * Default quality setting for formats that support quality control.
 */
export const DEFAULT_QUALITY = 80;

/**
 * Supported input formats that can be read by sharp.
 */
export const SUPPORTED_INPUT_FORMATS: readonly ImageFormat[] = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'tiff',
  'bmp',
  'avif',
  'heic',
  'heif',
] as const;

/**
 * Supported output formats that can be written by sharp.
 */
export const SUPPORTED_OUTPUT_FORMATS: readonly ImageFormat[] = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'tiff',
  'bmp',
  'avif',
] as const;

/**
 * Formats that support quality settings.
 */
export const QUALITY_SUPPORTED_FORMATS: readonly ImageFormat[] = [
  'jpg',
  'jpeg',
  'webp',
  'avif',
] as const;

/**
 * Default image processing options.
 */
export const DEFAULT_OPTIONS: ImageProcessingOptions = {
  format: 'png',
  quality: DEFAULT_QUALITY,
  allowUpscale: false,
};

/**
 * Validates if a format string is a supported input format.
 *
 * @param format - Format string to validate
 * @returns True if the format is supported for input
 */
export function isSupportedInputFormat(format: string): format is ImageFormat {
  return SUPPORTED_INPUT_FORMATS.includes(format.toLowerCase() as ImageFormat);
}

/**
 * Validates if a format string is a supported output format.
 *
 * @param format - Format string to validate
 * @returns True if the format is supported for output
 */
export function isSupportedOutputFormat(format: string): format is ImageFormat {
  return SUPPORTED_OUTPUT_FORMATS.includes(format.toLowerCase() as ImageFormat);
}

/**
 * Checks if a format supports quality settings.
 *
 * @param format - Format to check
 * @returns True if the format supports quality settings
 */
export function formatSupportsQuality(format: ImageFormat): boolean {
  return QUALITY_SUPPORTED_FORMATS.includes(format);
}

/**
 * Normalizes a format string to a standard ImageFormat.
 *
 * @param format - Format string to normalize
 * @returns Normalized ImageFormat
 * @throws Error if format is not supported
 */
export function normalizeFormat(format: string): ImageFormat {
  const normalized = format.toLowerCase();
  if (normalized === 'jpg') {
    return 'jpeg';
  }
  if (isSupportedOutputFormat(normalized)) {
    return normalized as ImageFormat;
  }
  throw new Error(`Unsupported format: ${format}`);
}
