#!/usr/bin/env node

/**
 * Create Placeholder Image
 * 
 * This script creates a simple placeholder image using the Canvas API.
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create a 320x180 canvas
const width = 320;
const height = 180;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill the background
ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, width, height);

// Add a border
ctx.strokeStyle = '#cccccc';
ctx.lineWidth = 2;
ctx.strokeRect(2, 2, width - 4, height - 4);

// Add text
ctx.font = '16px Arial';
ctx.fillStyle = '#666666';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Placeholder Image', width / 2, height / 2);

// Save the image
const buffer = canvas.toBuffer('image/jpeg');
fs.writeFileSync(path.join(process.cwd(), 'public', 'placeholder-image.jpg'), buffer);
console.log('Created placeholder image: public/placeholder-image.jpg');

// Create preview images for each page
const pages = ['home', 'about', 'services', 'contact', 'general'];
pages.forEach(page => {
  // Add page name to the canvas
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, width - 4, height - 4);
  ctx.fillStyle = '#666666';
  ctx.fillText(`${page.charAt(0).toUpperCase() + page.slice(1)} Preview`, width / 2, height / 2);
  
  // Save the image
  const pageBuffer = canvas.toBuffer('image/jpeg');
  const filePath = path.join(process.cwd(), 'public', 'samples', `${page}-preview.jpg`);
  fs.writeFileSync(filePath, pageBuffer);
  console.log(`Created preview image: ${filePath}`);
}); 