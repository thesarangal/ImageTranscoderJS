# ImageTranscoderJS

A production-quality Node.js CLI tool for converting images between any supported formats with advanced transformation options. Built with TypeScript and Sharp for high-performance image processing.

## Overview

This tool provides a comprehensive solution for batch image conversion and transformation. It supports converting between multiple image formats (JPG, PNG, WebP, GIF, TIFF, BMP, AVIF) with options for resizing, quality control, and maintaining aspect ratios. Perfect for optimizing images for web, batch processing photo libraries, or converting between formats for compatibility.

## Features

- 🔄 **Multi-format conversion**: Convert between JPG, PNG, WebP, GIF, TIFF, BMP, and AVIF
- 📁 **Batch processing**: Process entire directories of images at once
- 🎯 **Smart resizing**: Maintain aspect ratio while resizing with width/height constraints
- 📏 **Resolution constraints**: Set minimum and maximum dimensions with aspect ratio preservation
- 🎨 **Quality control**: Adjust output quality for formats that support it (JPEG, WebP, AVIF)
- 🔍 **Recursive directory scanning**: Process nested subdirectories with `--recursive`
- 🛡️ **Safe defaults**: Prevents overwriting files unless explicitly allowed
- 📊 **Detailed reporting**: Verbose logging and processing summaries
- ⚡ **High performance**: Powered by Sharp, one of the fastest Node.js image processing libraries

## Tech Stack

- **Runtime**: Node.js (LTS 18+)
- **Language**: TypeScript (strict mode)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)
- **CLI Framework**: [Commander.js](https://github.com/tj/commander.js)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting**: ESLint + Prettier

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/ImageTranscoderJS.git
cd ImageTranscoderJS

# Install dependencies
npm install

# Build the project
npm run build
```

### Global Installation

After building, you can install globally:

```bash
npm link
```

Or use directly with `npx`:

```bash
npx img-tool --help
```

## Usage

### Basic Examples

#### Convert a Single File

```bash
# Convert a single image to PNG
npx img-tool -i input.jpg -o output.png -f png

# Convert with quality setting
npx img-tool -i photo.jpg -o photo.webp -f webp --quality 90
```

#### Convert All Images in a Directory

```bash
# Convert all images in a folder to WebP
npx img-tool -i ./input -o ./output -f webp

# Process recursively (including subdirectories)
npx img-tool -i ./photos -o ./converted -f png --recursive
```

#### Resize Images

```bash
# Resize to specific width (maintains aspect ratio)
npx img-tool -i input.jpg -o output.jpg -f jpg --width 800

# Resize to specific height (maintains aspect ratio)
npx img-tool -i input.jpg -o output.jpg -f jpg --height 600

# Resize to fit within dimensions (maintains aspect ratio)
npx img-tool -i input.jpg -o output.jpg -f jpg --width 1920 --height 1080
```

#### Quality Control

```bash
# Convert with custom quality (1-100)
npx img-tool -i photo.jpg -o photo_optimized.jpg -f jpg --quality 85
```

#### Resolution Constraints

```bash
# Ensure minimum dimensions
npx img-tool -i input.jpg -o output.jpg -f jpg --min-width 800 --min-height 600

# Ensure maximum dimensions
npx img-tool -i input.jpg -o output.jpg -f jpg --max-width 1920 --max-height 1080

# Combine min and max constraints
npx img-tool -i input.jpg -o output.jpg -f jpg \
  --min-width 800 --min-height 600 \
  --max-width 1920 --max-height 1080

# Allow upscaling if needed
npx img-tool -i small.jpg -o large.jpg -f jpg --min-width 2000 --allow-upscale
```

#### Advanced Usage

```bash
# Dry run (see what would be processed without writing files)
npx img-tool -i ./input -o ./output -f webp --dry-run

# Overwrite existing files
npx img-tool -i ./input -o ./output -f png --overwrite

# Verbose logging (detailed file-by-file output)
npx img-tool -i ./input -o ./output -f webp --verbose

# Silent mode (only errors and summary)
npx img-tool -i ./input -o ./output -f webp --silent

# Use configuration file
npx img-tool -i ./input -o ./output -f webp --config config.json
```

### Configuration File

You can use a JSON configuration file to specify options:

```json
{
  "format": "webp",
  "width": 1920,
  "height": 1080,
  "quality": 85,
  "recursive": true,
  "overwrite": false
}
```

Then use it with:

```bash
npx img-tool -i ./input -o ./output --config config.json
```

Note: CLI options take precedence over config file options.

## Configuration Options

| Option | Short | Description | Default | Example |
|--------|-------|-------------|---------|---------|
| `--input` | `-i` | Input file or directory path | *required* | `-i ./photos` |
| `--output` | `-o` | Output file or directory path | *required* | `-o ./converted` |
| `--format` | `-f` | Target output format | *required* | `-f webp` |
| `--width` | `-w` | Desired width in pixels | - | `--width 800` |
| `--height` | `-h` | Desired height in pixels | - | `--height 600` |
| `--min-width` | | Minimum width constraint | - | `--min-width 800` |
| `--min-height` | | Minimum height constraint | - | `--min-height 600` |
| `--max-width` | | Maximum width constraint | - | `--max-width 1920` |
| `--max-height` | | Maximum height constraint | - | `--max-height 1080` |
| `--quality` | `-q` | Output quality (1-100) | 80 | `--quality 90` |
| `--allow-upscale` | | Allow upscaling images | `false` | `--allow-upscale` |
| `--recursive` | `-r` | Process subdirectories recursively | `false` | `--recursive` |
| `--overwrite` | | Overwrite existing output files | `false` | `--overwrite` |
| `--dry-run` | | Show what would be processed | `false` | `--dry-run` |
| `--verbose` | `-v` | Print detailed logs | `false` | `--verbose` |
| `--silent` | `-s` | Only print errors and summary | `false` | `--silent` |
| `--config` | `-c` | Path to JSON configuration file | - | `--config config.json` |

### Supported Formats

**Input formats**: JPG, JPEG, PNG, WebP, GIF, TIFF, BMP, AVIF, HEIC, HEIF

**Output formats**: JPG, JPEG, PNG, WebP, GIF, TIFF, BMP, AVIF

**Quality support**: JPEG, WebP, AVIF (quality option only applies to these formats)

## Project Structure

```
ImageTranscoderJS/
├── src/
│   ├── cli.ts              # CLI entry point and command parsing
│   ├── index.ts            # Main program entry and batch processing
│   ├── imageProcessor.ts   # Core image processing logic with Sharp
│   ├── config.ts           # Configuration, defaults, and format validation
│   └── types.ts            # TypeScript type definitions
├── tests/
│   ├── config.test.ts      # Tests for configuration utilities
│   ├── imageProcessor.test.ts  # Tests for image processing utilities
│   └── integration.test.ts    # Integration tests
├── dist/                   # Compiled JavaScript output (generated)
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

## Development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### Development Scripts

```bash
# Build TypeScript
npm run build

# Run in development mode (with watch)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Running the CLI

After building:

```bash
# Using npm start
npm start -- -i input.jpg -o output.png -f png

# Using the binary directly
node dist/cli.js -i input.jpg -o output.png -f png

# If installed globally
img-tool -i input.jpg -o output.png -f png
```

## How It Works

1. **Input Detection**: The tool automatically detects whether the input is a single file or directory
2. **File Discovery**: For directories, it scans for supported image files (optionally recursively)
3. **Image Processing**: Each image is processed using Sharp with the specified options:
   - Format conversion
   - Dimension calculation (maintaining aspect ratio)
   - Quality adjustment (for supported formats)
   - Constraint application (min/max dimensions)
4. **Output Writing**: Processed images are written to the output location with proper directory structure preservation
5. **Error Handling**: Individual file failures don't stop the batch process; errors are logged and reported in the summary

## Aspect Ratio Preservation

The tool always maintains the original aspect ratio of images:

- **Width only**: Scales proportionally by width
- **Height only**: Scales proportionally by height
- **Both width and height**: Fits within the bounding box while maintaining aspect ratio
- **Min/Max constraints**: Ensures dimensions stay within bounds while preserving aspect ratio

## Error Handling

- Invalid input paths are caught and reported
- Unsupported formats are rejected with clear error messages
- Individual file processing errors don't stop batch operations
- Exit codes: `0` for success, `1` for failures
- Detailed error messages help identify issues

## Testing

The project includes unit tests for core functionality:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Tests cover:
- Format validation and normalization
- Image extension detection
- Configuration utilities
- Integration scenarios

## Contributing

This is a portfolio project, but suggestions and improvements are welcome! If you find bugs or have feature ideas, please open an issue.

## License

MIT License - feel free to use this project for learning, portfolio, or commercial purposes.

## Author

This is a portfolio project demonstrating production-quality Node.js and TypeScript development practices.

---

**Note**: This tool requires Node.js 18+ and uses Sharp, which has native dependencies. Make sure your system has the necessary build tools installed if you encounter compilation issues.

