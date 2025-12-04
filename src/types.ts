/**
 * Supported image formats for input and output.
 */
export type ImageFormat =
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'webp'
  | 'gif'
  | 'tiff'
  | 'bmp'
  | 'avif'
  | 'heic'
  | 'heif';

/**
 * Configuration options for image processing.
 */
export interface ImageProcessingOptions {
  /** Target output format */
  format: ImageFormat;
  /** Desired width in pixels (optional) */
  width?: number;
  /** Desired height in pixels (optional) */
  height?: number;
  /** Minimum width constraint */
  minWidth?: number;
  /** Minimum height constraint */
  minHeight?: number;
  /** Maximum width constraint */
  maxWidth?: number;
  /** Maximum height constraint */
  maxHeight?: number;
  /** Quality setting (1-100) for formats that support it */
  quality?: number;
  /** Whether to allow upscaling images */
  allowUpscale?: boolean;
}

/**
 * CLI configuration options.
 */
export interface CliOptions extends ImageProcessingOptions {
  /** Input file or directory path */
  input: string;
  /** Output file or directory path */
  output: string;
  /** Whether to process subdirectories recursively */
  recursive?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Dry run mode - show what would be processed without writing files */
  dryRun?: boolean;
  /** Verbose logging */
  verbose?: boolean;
  /** Silent mode - only errors and summary */
  silent?: boolean;
  /** Path to configuration file (optional) */
  config?: string;
}

/**
 * Result of processing a single image file.
 */
export interface ProcessResult {
  /** Input file path */
  inputPath: string;
  /** Output file path */
  outputPath: string;
  /** Whether processing was successful */
  success: boolean;
  /** Error message if processing failed */
  error?: string;
  /** Original file size in bytes */
  originalSize?: number;
  /** New file size in bytes */
  newSize?: number;
}

/**
 * Summary of batch processing operation.
 */
export interface ProcessingSummary {
  /** Total number of files processed */
  total: number;
  /** Number of successful conversions */
  successful: number;
  /** Number of failed conversions */
  failed: number;
  /** Detailed results for each file */
  results: ProcessResult[];
}
