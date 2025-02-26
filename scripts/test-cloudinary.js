/**
 * Cloudinary Integration Test Script
 * 
 * This script helps you test different aspects of the Cloudinary integration.
 * Run with: node scripts/test-cloudinary.js
 */

const testFunctions = {
  /**
   * Test the API endpoints
   */
  async testAPI() {
    console.log('Testing API endpoints...');
    
    // Test fetching assets
    try {
      console.log('\n1. Testing /api/cloudinary/assets endpoint:');
      const assetsResponse = await fetch('http://localhost:3000/api/cloudinary/assets');
      
      if (!assetsResponse.ok) {
        console.error(`❌ Assets API failed with status: ${assetsResponse.status}`);
      } else {
        const assetsData = await assetsResponse.json();
        console.log(`✅ Successfully fetched ${assetsData.assets?.length || 0} assets`);
        console.log('Sample asset:', assetsData.assets?.[0] || 'No assets found');
      }
    } catch (error) {
      console.error('❌ Error testing assets endpoint:', error);
    }
    
    // Test fetching organizers
    try {
      console.log('\n2. Testing /api/cloudinary/organizers endpoint:');
      const organizersResponse = await fetch('http://localhost:3000/api/cloudinary/organizers');
      
      if (!organizersResponse.ok) {
        console.error(`❌ Organizers API failed with status: ${organizersResponse.status}`);
      } else {
        const organizersData = await organizersResponse.json();
        console.log(`✅ Successfully fetched ${organizersData.folders?.length || 0} folders and ${organizersData.tags?.length || 0} tags`);
        if (organizersData.folders?.length) {
          console.log('Sample folders:', organizersData.folders.slice(0, 3));
        }
        if (organizersData.tags?.length) {
          console.log('Sample tags:', organizersData.tags.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('❌ Error testing organizers endpoint:', error);
    }
  },
  
  /**
   * Open the Media Management page
   */
  openMediaManagement() {
    console.log('Opening Media Management page in your browser...');
    const url = 'http://localhost:3000/admin/media';
    
    // Try to open the URL using different methods based on the OS
    try {
      const { exec } = require('child_process');
      const platform = process.platform;
      
      if (platform === 'win32') {
        exec(`start ${url}`);
      } else if (platform === 'darwin') {
        exec(`open ${url}`);
      } else {
        exec(`xdg-open ${url}`);
      }
      
      console.log(`✅ Opened ${url} in your browser`);
    } catch (error) {
      console.error('❌ Could not automatically open the browser. Please open this URL manually:', url);
    }
  },
  
  /**
   * Run all tests
   */
  async runAll() {
    console.log('Running all tests...');
    await this.testAPI();
    this.openMediaManagement();
  },
  
  /**
   * Print instructions for manual testing
   */
  printManualTestInstructions() {
    console.log(`
=====================================================
Manual Testing Instructions
=====================================================

1. Media Management Interface:
   - Navigate to: http://localhost:3000/admin/media
   - Verify all assets are displayed correctly
   - Test filtering by area, resource type, folder, and tag
   - Test searching for assets
   - Test switching between grid and list views

2. Upload Functionality:
   - Click the "Upload" button
   - Upload a test image or video
   - Add tags and select an area
   - Confirm that the upload is successful
   - Verify the new asset appears in the media list

3. Asset Organization:
   - Select one or more assets
   - Use the "Organize" dropdown to add tags or move to a folder
   - Edit an asset to update its details
   - Confirm changes are saved

4. Component Testing:
   - Create a test page that uses the CloudinaryImage component
   - Create a test page that uses the CloudinaryVideo component
   - Create a test page that uses the CloudinaryUploader component
   - Verify that all components work as expected

5. API Testing (using browser dev tools or Postman):
   - GET /api/cloudinary/assets?area=gallery
   - GET /api/cloudinary/organizers
   - POST /api/cloudinary/organize with appropriate payload

Report any issues you encounter during testing.
    `);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

if (command === 'help') {
  console.log(`
Cloudinary Test Script

Usage:
  node scripts/test-cloudinary.js <command>

Commands:
  api               Test API endpoints
  open              Open the Media Management page
  all               Run all tests
  manual            Print manual testing instructions
  help              Show this help message
  `);
} else if (command === 'api') {
  testFunctions.testAPI();
} else if (command === 'open') {
  testFunctions.openMediaManagement();
} else if (command === 'all') {
  testFunctions.runAll();
} else if (command === 'manual') {
  testFunctions.printManualTestInstructions();
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Use "help" to see available commands');
} 