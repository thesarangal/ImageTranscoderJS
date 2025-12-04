import * as fs from 'fs/promises';
import * as path from 'path';
import type { CliOptions, ProcessResult, ProcessingSummary } from './types';
import { processImage, isImageExtension, getFileExtension } from './imageProcessor';
import { normalizeFormat } from './config';

/**
 * Processes a single image file.
 *
 * @param inputPath - Path to input image file
 * @param outputPath - Path to output image file
 * @param options - Processing options
 * @returns Promise resolving to ProcessResult
 */
export async function convertSingleImage(
  inputPath: string,
  outputPath: string,
  options: CliOptions
): Promise<ProcessResult> {
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Check if output file exists
  if (!options.overwrite) {
    try {
      await fs.access(outputPath);
      // File exists and overwrite is not enabled
      return {
        inputPath,
        outputPath,
        success: false,
        error: 'Output file already exists. Use --overwrite to replace it.',
      };
    } catch {
      // File doesn't exist, proceed
    }
  }

  // Process the image
  const result = await processImage(inputPath, outputPath, {
    format: normalizeFormat(options.format),
    width: options.width,
    height: options.height,
    minWidth: options.minWidth,
    minHeight: options.minHeight,
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight,
    quality: options.quality,
    allowUpscale: options.allowUpscale,
  });

  return result;
}

/**
 * Recursively finds all image files in a directory.
 *
 * @param dirPath - Directory path to search
 * @param recursive - Whether to search subdirectories
 * @returns Promise resolving to array of image file paths
 */
async function findImageFiles(dirPath: string, recursive: boolean): Promise<string[]> {
  const imageFiles: string[] = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory() && recursive) {
      const subFiles = await findImageFiles(fullPath, recursive);
      imageFiles.push(...subFiles);
    } else if (entry.isFile()) {
      const ext = getFileExtension(entry.name);
      if (isImageExtension(ext)) {
        imageFiles.push(fullPath);
      }
    }
  }

  return imageFiles;
}

/**
 * Generates output path for a file in batch processing.
 *
 * @param inputPath - Input file path
 * @param inputDir - Input directory path
 * @param outputDir - Output directory path
 * @param format - Target output format
 * @returns Output file path
 */
function generateOutputPath(
  inputPath: string,
  inputDir: string,
  outputDir: string,
  format: string
): string {
  // Get relative path from input directory
  const relativePath = path.relative(inputDir, inputPath);
  const dirname = path.dirname(relativePath);
  const basename = path.basename(relativePath, path.extname(relativePath));

  // Construct output path with new extension
  const outputSubDir = dirname === '.' ? outputDir : path.join(outputDir, dirname);
  const outputFileName = `${basename}.${format}`;
  return path.join(outputSubDir, outputFileName);
}

/**
 * Processes all images in a directory.
 *
 * @param inputDir - Input directory path
 * @param outputDir - Output directory path
 * @param options - Processing options
 * @returns Promise resolving to ProcessingSummary
 */
export async function convertDirectory(
  inputDir: string,
  outputDir: string,
  options: CliOptions
): Promise<ProcessingSummary> {
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Find all image files
  const imageFiles = await findImageFiles(inputDir, options.recursive ?? false);

  if (imageFiles.length === 0) {
    return {
      total: 0,
      successful: 0,
      failed: 0,
      results: [],
    };
  }

  // Process each image
  const results: ProcessResult[] = [];
  const format = normalizeFormat(options.format);

  for (const inputPath of imageFiles) {
    const outputPath = generateOutputPath(inputPath, inputDir, outputDir, format);

    // Check if output file exists
    if (!options.overwrite) {
      try {
        await fs.access(outputPath);
        // File exists and overwrite is not enabled - skip
        results.push({
          inputPath,
          outputPath,
          success: false,
          error: 'Output file already exists. Use --overwrite to replace it.',
        });
        continue;
      } catch {
        // File doesn't exist, proceed
      }
    }

    // Ensure output subdirectory exists
    const outputSubDir = path.dirname(outputPath);
    await fs.mkdir(outputSubDir, { recursive: true });

    // Process the image
    const result = await processImage(inputPath, outputPath, {
      format,
      width: options.width,
      height: options.height,
      minWidth: options.minWidth,
      minHeight: options.minHeight,
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      quality: options.quality,
      allowUpscale: options.allowUpscale,
    });

    results.push(result);
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return {
    total: results.length,
    successful,
    failed,
    results,
  };
}

/**
 * Main conversion function that handles both single files and directories.
 *
 * @param options - CLI options
 * @returns Promise resolving to ProcessingSummary
 */
export async function convertImages(options: CliOptions): Promise<ProcessingSummary> {
  const inputPath = path.resolve(options.input);
  const outputPath = path.resolve(options.output);

  // Check if input exists
  try {
    const stats = await fs.stat(inputPath);
    const isDirectory = stats.isDirectory();

    if (isDirectory) {
      // Process directory
      return await convertDirectory(inputPath, outputPath, options);
    } else {
      // Process single file
      // Determine output path
      let finalOutputPath = outputPath;
      if ((await fs.stat(outputPath).catch(() => null))?.isDirectory()) {
        // Output is a directory, generate filename
        const inputBasename = path.basename(inputPath, path.extname(inputPath));
        const format = normalizeFormat(options.format);
        finalOutputPath = path.join(outputPath, `${inputBasename}.${format}`);
      }

      const result = await convertSingleImage(inputPath, finalOutputPath, options);

      return {
        total: 1,
        successful: result.success ? 1 : 0,
        failed: result.success ? 0 : 1,
        results: [result],
      };
    }
  } catch (error) {
    throw new Error(
      `Input path does not exist or is not accessible: ${inputPath}. ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
