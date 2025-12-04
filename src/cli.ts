#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { convertImages } from './index';
import type { CliOptions } from './types';
import { DEFAULT_QUALITY, normalizeFormat } from './config';

const program = new Command();

/**
 * Loads configuration from a JSON file.
 *
 * @param configPath - Path to the configuration file
 * @returns Promise resolving to partial CliOptions
 */
async function loadConfig(configPath: string): Promise<Partial<CliOptions>> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content);
    return config;
  } catch (error) {
    throw new Error(
      `Failed to load config file: ${configPath}. ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Formats file size in human-readable format.
 *
 * @param bytes - File size in bytes
 * @returns Formatted string
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Main CLI function.
 */
async function main(): Promise<void> {
  program
    .name('img-tool')
    .description(
      'A production-quality CLI tool for converting images between any supported formats with advanced transformation options'
    )
    .version('1.0.0')
    .requiredOption('-i, --input <path>', 'Input file or directory path')
    .requiredOption('-o, --output <path>', 'Output file or directory path')
    .requiredOption(
      '-f, --format <format>',
      'Target output format (jpg, png, webp, gif, tiff, bmp, avif)'
    )
    .option('-w, --width <number>', 'Desired width in pixels', parseInt)
    .option('-h, --height <number>', 'Desired height in pixels', parseInt)
    .option('--min-width <number>', 'Minimum width constraint', parseInt)
    .option('--min-height <number>', 'Minimum height constraint', parseInt)
    .option('--max-width <number>', 'Maximum width constraint', parseInt)
    .option('--max-height <number>', 'Maximum height constraint', parseInt)
    .option('-q, --quality <1-100>', 'Output quality (1-100) for formats that support it', parseInt)
    .option('--allow-upscale', 'Allow upscaling images beyond original dimensions', false)
    .option('-r, --recursive', 'Process subdirectories recursively', false)
    .option('--overwrite', 'Overwrite existing output files', false)
    .option('--dry-run', 'Show what would be processed without writing files', false)
    .option('-v, --verbose', 'Print detailed logs for each file', false)
    .option('-s, --silent', 'Only print errors and summary', false)
    .option('-c, --config <path>', 'Path to JSON configuration file')
    .parse(process.argv);

  const options = program.opts<{
    input: string;
    output: string;
    format: string;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    allowUpscale?: boolean;
    recursive?: boolean;
    overwrite?: boolean;
    dryRun?: boolean;
    verbose?: boolean;
    silent?: boolean;
    config?: string;
  }>();

  try {
    // Load config file if provided
    let configOptions: Partial<CliOptions> = {};
    if (options.config) {
      configOptions = await loadConfig(path.resolve(options.config));
    }

    // Merge config file options with CLI options (CLI takes precedence)
    // Normalize format first
    const normalizedFormat = normalizeFormat(options.format);
    const cliOptions: CliOptions = {
      input: options.input,
      output: options.output,
      format: normalizedFormat,
      width: options.width ?? configOptions.width,
      height: options.height ?? configOptions.height,
      minWidth: options.minWidth ?? configOptions.minWidth,
      minHeight: options.minHeight ?? configOptions.minHeight,
      maxWidth: options.maxWidth ?? configOptions.maxWidth,
      maxHeight: options.maxHeight ?? configOptions.maxHeight,
      quality: options.quality ?? configOptions.quality ?? DEFAULT_QUALITY,
      allowUpscale: options.allowUpscale ?? configOptions.allowUpscale ?? false,
      recursive: options.recursive ?? configOptions.recursive ?? false,
      overwrite: options.overwrite ?? configOptions.overwrite ?? false,
      dryRun: options.dryRun ?? configOptions.dryRun ?? false,
      verbose: options.verbose ?? configOptions.verbose ?? false,
      silent: options.silent ?? configOptions.silent ?? false,
    };

    // Format is already normalized above, but validate it was successful
    if (!cliOptions.format) {
      console.error('Error: Invalid format specified');
      process.exit(1);
    }

    // Validate quality range
    if (cliOptions.quality !== undefined) {
      if (cliOptions.quality < 1 || cliOptions.quality > 100) {
        console.error('Error: Quality must be between 1 and 100');
        process.exit(1);
      }
    }

    // Validate dimension constraints
    if (cliOptions.minWidth && cliOptions.maxWidth && cliOptions.minWidth > cliOptions.maxWidth) {
      console.error('Error: min-width cannot be greater than max-width');
      process.exit(1);
    }
    if (
      cliOptions.minHeight &&
      cliOptions.maxHeight &&
      cliOptions.minHeight > cliOptions.maxHeight
    ) {
      console.error('Error: min-height cannot be greater than max-height');
      process.exit(1);
    }

    // Dry run mode
    if (cliOptions.dryRun) {
      if (!cliOptions.silent) {
        console.log('🔍 DRY RUN MODE - No files will be written\n');
        console.log(`Input: ${cliOptions.input}`);
        console.log(`Output: ${cliOptions.output}`);
        console.log(`Format: ${cliOptions.format}`);
        if (cliOptions.width || cliOptions.height) {
          console.log(`Dimensions: ${cliOptions.width || 'auto'} x ${cliOptions.height || 'auto'}`);
        }
        if (cliOptions.quality) {
          console.log(`Quality: ${cliOptions.quality}`);
        }
        console.log('\nWould process files...');
      }
      return;
    }

    // Process images
    if (!cliOptions.silent && !cliOptions.verbose) {
      console.log('Processing images...\n');
    }

    const summary = await convertImages(cliOptions);

    // Print results
    if (!cliOptions.silent) {
      if (cliOptions.verbose) {
        console.log('\n=== Processing Results ===\n');
        for (const result of summary.results) {
          if (result.success) {
            const sizeChange =
              result.originalSize && result.newSize
                ? ` (${formatFileSize(result.originalSize)} → ${formatFileSize(result.newSize)})`
                : '';
            console.log(`✅ ${result.inputPath} → ${result.outputPath}${sizeChange}`);
          } else {
            console.error(`❌ ${result.inputPath}: ${result.error}`);
          }
        }
        console.log('');
      }

      console.log('=== Summary ===');
      console.log(`Total files: ${summary.total}`);
      console.log(`✅ Successful: ${summary.successful}`);
      if (summary.failed > 0) {
        console.log(`❌ Failed: ${summary.failed}`);
      }
    }

    // Exit with error code if there were failures
    if (summary.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run CLI
main().catch((error) => {
  console.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
