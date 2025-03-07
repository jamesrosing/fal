#!/usr/bin/env node

/**
 * Setup Media Scanner
 * 
 * This script installs the necessary dependencies for the media scanner
 * and adds the script to package.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Setting up media scanner...');

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install --save-dev @babel/parser @babel/traverse glob', { stdio: 'inherit' });
  console.log('Dependencies installed successfully.');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Add script to package.json
console.log('Adding script to package.json...');
try {
  const packageJsonPath = path.join(path.resolve(__dirname, '..'), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Add the script
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['scan-media-placeholders'] = 'node scripts/scan-media-placeholders.js';
  
  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Script added to package.json.');
} catch (error) {
  console.error('Error updating package.json:', error);
  process.exit(1);
}

console.log('Setup complete!');
console.log('You can now run the media scanner with: npm run scan-media-placeholders'); 