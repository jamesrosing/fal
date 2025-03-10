import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure the samples directory exists
const samplesDir = path.join(path.resolve(__dirname, '..'), 'public', 'samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

// Create a simple HTML template for the page preview
function createPreviewHtml(title) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${title} Preview</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f0f0f0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .preview-container {
        text-align: center;
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        width: 80%;
        max-width: 600px;
      }
      h1 {
        color: #333;
      }
      p {
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="preview-container">
      <h1>${title} Preview</h1>
      <p>This is a placeholder image for the ${title.toLowerCase()} page.</p>
      <p>Replace this with an actual screenshot in production.</p>
    </div>
  </body>
  </html>
  `;
}

// Create placeholder files
const pages = [
  { id: 'home', title: 'Home Page' },
  { id: 'services', title: 'Services Page' },
  { id: 'about', title: 'About Us' },
  { id: 'contact', title: 'Contact Page' }
];

// Create placeholders
pages.forEach(page => {
  const previewContent = createPreviewHtml(page.title);
  const previewPath = path.join(samplesDir, `${page.id}-preview.html`);
  fs.writeFileSync(previewPath, previewContent);
  console.log(`Created placeholder HTML for ${page.title} at ${previewPath}`);
});

console.log('\nPlaceholder HTML files created successfully!');
console.log('To convert these to images, open each HTML file in a browser and take a screenshot.');
console.log('Save the screenshots as JPG files with the same names (e.g., home-preview.jpg).'); 