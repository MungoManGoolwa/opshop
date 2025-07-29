# Build Scripts for Opshop Online

This directory contains utility scripts for managing the build process, type checking, and cleanup tasks for the Opshop Online marketplace application.

## Scripts Overview

### 🧹 Clean (`clean.js`)
Removes build artifacts and cache files to ensure clean builds.

```bash
# Basic cleanup
node scripts/clean.js

# Deep cleanup (includes additional cache directories)
node scripts/clean.js --deep

# Show help
node scripts/clean.js --help
```

**What it cleans:**
- `dist/` - Build output directory
- `node_modules/.cache` - Node modules cache
- `.vite` - Vite cache
- `client/dist` - Client build output
- `.tsbuildinfo` - TypeScript build info
- Coverage reports and other temporary files

### 🔍 Type Check (`type-check.js`)
Runs TypeScript compiler to check for type errors without generating output.

```bash
# Single type check
node scripts/type-check.js

# Watch mode (continuous checking)
node scripts/type-check.js --watch

# Verbose output
node scripts/type-check.js --verbose
```

**Features:**
- Uses `--noEmit` flag (no output generation)
- Uses `--skipLibCheck` for faster checking
- Provides helpful error messages and common fixes
- Supports watch mode for development

### 🏗️ Pre-build (`prebuild.js`)
Runs before the main build process to ensure everything is ready.

```bash
node scripts/prebuild.js
```

**What it does:**
1. **Cleanup**: Removes previous build artifacts
2. **Type Checking**: Validates TypeScript code
3. **File Verification**: Ensures critical files exist
4. **Issue Detection**: Checks for common build problems

### ✅ Post-build (`postbuild.js`)
Runs after the build process to verify outputs and provide summary.

```bash
node scripts/postbuild.js
```

**What it does:**
1. **Output Verification**: Confirms all expected files were created
2. **Bundle Analysis**: Reports file sizes and optimization opportunities
3. **Deployment Readiness**: Checks for production considerations
4. **Recommendations**: Provides next steps for deployment

## Integration with Build Process

### 🚀 Complete Build Process (`build-with-checks.js`)
Runs the complete build cycle with all checks and validations.

```bash
node scripts/build-with-checks.js
```

**Complete process:**
1. Prebuild checks and cleanup
2. Client application build (Vite)
3. Server bundle build (esbuild)
4. Postbuild verification and summary

### Manual Usage
```bash
# Individual steps
node scripts/prebuild.js
npm run build
node scripts/postbuild.js

# Or use the integrated script
node scripts/build-with-checks.js
```

### Development Workflow
```bash
# Clean and type check during development
node scripts/clean.js
node scripts/type-check.js --watch
```

### CI/CD Integration
These scripts are designed to be CI/CD friendly and provide appropriate exit codes:
- Exit code 0: Success
- Exit code 1: Failure (stops CI/CD pipeline)

## Common Use Cases

### Before Starting Development
```bash
node scripts/clean.js --deep
node scripts/type-check.js
```

### Before Committing Code
```bash
node scripts/type-check.js
```

### Preparing for Deployment
```bash
node scripts/prebuild.js
npm run build
node scripts/postbuild.js
```

### Troubleshooting Build Issues
```bash
node scripts/clean.js --deep
node scripts/type-check.js --verbose
```

## Output Examples

### Successful Type Check
```
🔍 Running TypeScript type checking...

✅ Type checking completed successfully!
```

### Build Verification
```
🔍 Starting postbuild verification...

1. Verifying build outputs...
   ✓ Server bundle: dist/index.js
   ✓ Client assets directory: dist/public
   ✓ Client entry point: dist/public/index.html

2. Build summary:
   📦 Server bundle size: 1,234KB
   📁 Client assets: 42 files
   📦 Main client bundle: 567KB
```

## Error Handling

All scripts include comprehensive error handling and provide helpful guidance when issues occur:

- **Type errors**: Suggests common fixes and missing imports
- **Missing files**: Lists what's expected and where to find them
- **Build failures**: Provides debugging steps and recommendations

## Environment Requirements

- Node.js 18+
- TypeScript installed (`npm install -g typescript` or use `npx`)
- All project dependencies installed (`npm install`)

## Notes

- Scripts use ES modules syntax (`.js` files with `"type": "module"` in package.json)
- All scripts are executable and can be run directly
- Designed to work across different operating systems
- Provide colored output for better readability in terminals