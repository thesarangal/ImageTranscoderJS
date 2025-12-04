import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { ImageProcessingOptions, ProcessResult } from './types';
import { formatSupportsQuality, normalizeFormat } from './config';

/**
 * Calculates the target dimensions while maintaining aspect ratio.
 *
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param options - Processing options with width/height constraints
 * @returns Object with target width and height
 */
function calculateTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ImageProcessingOptions
): { width: number; height: number } {
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  // Apply width/height constraints
  if (options.width && !options.height) {
    // Only width specified - scale proportionally
    targetWidth = options.width;
    targetHeight = Math.round((originalHeight * options.width) / originalWidth);
  } else if (options.height && !options.width) {
    // Only height specified - scale proportionally
    targetHeight = options.height;
    targetWidth = Math.round((originalWidth * options.height) / originalHeight);
  } else if (options.width && options.height) {
    // Both specified - fit within bounding box while maintaining aspect ratio
    const widthRatio = options.width / originalWidth;
    const heightRatio = options.height / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);
    targetWidth = Math.round(originalWidth * ratio);
    targetHeight = Math.round(originalHeight * ratio);
  }

  // Apply min constraints
  if (options.minWidth && targetWidth < options.minWidth) {
    if (options.allowUpscale) {
      const scale = options.minWidth / targetWidth;
      targetWidth = options.minWidth;
      targetHeight = Math.round(targetHeight * scale);
    } else {
      targetWidth = options.minWidth;
      targetHeight = Math.round((targetHeight * options.minWidth) / targetWidth);
    }
  }
  if (options.minHeight && targetHeight < options.minHeight) {
    if (options.allowUpscale) {
      const scale = options.minHeight / targetHeight;
      targetHeight = options.minHeight;
      targetWidth = Math.round(targetWidth * scale);
    } else {
      targetHeight = options.minHeight;
      targetWidth = Math.round((targetWidth * options.minHeight) / targetHeight);
    }
  }

  // Apply max constraints
  if (options.maxWidth && targetWidth > options.maxWidth) {
    const scale = options.maxWidth / targetWidth;
    targetWidth = options.maxWidth;
    targetHeight = Math.round(targetHeight * scale);
  }
  if (options.maxHeight && targetHeight > options.maxHeight) {
    const scale = options.maxHeight / targetHeight;
    targetHeight = options.maxHeight;
    targetWidth = Math.round(targetWidth * scale);
  }

  return { width: targetWidth, height: targetHeight };
}

/**
 * Processes a single image file with the given options.
 *
 * @param inputPath - Path to the input image file
 * @param outputPath - Path where the output image should be written
 * @param options - Image processing options
 * @returns Promise resolving to a ProcessResult
 */
export async function processImage(
  inputPath: string,
  outputPath: string,
  options: ImageProcessingOptions
): Promise<ProcessResult> {
  try {
    // Get original file size
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;

    // Read image metadata
    const metadata = await sharp(inputPath).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to read image dimensions');
    }

    // Calculate target dimensions
    const { width, height } = calculateTargetDimensions(metadata.width, metadata.height, options);

    // Build sharp pipeline
    let pipeline = sharp(inputPath);

    // Apply resizing if dimensions changed
    if (width !== metadata.width || height !== metadata.height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: !options.allowUpscale,
      });
    }

    // Convert format and apply quality if supported
    const format = normalizeFormat(options.format);
    const sharpFormat = format === 'jpeg' ? 'jpg' : format;

    if (formatSupportsQuality(format) && options.quality !== undefined) {
      pipeline = pipeline.toFormat(sharpFormat as keyof sharp.FormatEnum, {
        quality: options.quality,
      });
    } else {
      pipeline = pipeline.toFormat(sharpFormat as keyof sharp.FormatEnum);
    }

    // Write output file
    await pipeline.toFile(outputPath);

    // Get new file size
    const newStats = await fs.stat(outputPath);
    const newSize = newStats.size;

    return {
      inputPath,
      outputPath,
      success: true,
      originalSize,
      newSize,
    };
  } catch (error) {
    return {
      inputPath,
      outputPath,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Gets the file extension from a path.
 *
 * @param filePath - File path
 * @returns File extension (without dot) or empty string
 */
export function getFileExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return ext.slice(1); // Remove leading dot
}

/**
 * Checks if a file extension corresponds to a supported image format.
 *
 * @param extension - File extension (without dot)
 * @returns True if the extension represents a supported image format
 */
export function isImageExtension(extension: string): boolean {
  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
    'tiff',
    'tif',
    'bmp',
    'avif',
    'heic',
    'heif',
  ];
  return imageExtensions.includes(extension.toLowerCase());
}
