#!/usr/bin/env node

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import Anthropic from "@anthropic-ai/sdk";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Configuration
const PROJECT_PATH = process.cwd();
const PRD_PATH = path.join(PROJECT_PATH, "memory-bank", "PRD.txt");

// Maximum tokens to use (leave buffer for response)
const MAX_TOKENS = 180000; // Leave 20k buffer for response
const MAX_CHARS_PER_TOKEN = 4; // Rough estimate
const MAX_CONTENT_CHARS = MAX_TOKENS * MAX_CHARS_PER_TOKEN;

// File extensions to include in codebase analysis (more selective)
const INCLUDE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.md'
];

// Directories to exclude from analysis (more aggressive)
const EXCLUDE_DIRS = [
  'node_modules', '.next', '.git', 'dist', 'build', 'coverage',
  '.vercel', '.netlify', 'public', 'temp-migration', 'backup', 
  'attached_assets', '.husky', '.cursor', 'docs', 'assets',
  'images', 'videos', 'fonts', 'icons', '__tests__', 'test',
  'tests', 'spec', '.vscode', '.idea'
];

// Files to always exclude
const EXCLUDE_FILES = [
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.env', '.env.local', '.env.production', '.env.development',
  'README.md', 'CHANGELOG.md', 'LICENSE', '.gitignore',
  '.eslintrc', '.prettierrc', 'analyze-codebase.js'
];

// File importance scoring
const FILE_IMPORTANCE = {
  'package.json': 100,
  'next.config.ts': 90,
  'next.config.js': 90,
  'tailwind.config.ts': 85,
  'tailwind.config.js': 85,
  'tsconfig.json': 80,
  'app/layout.tsx': 95,
  'app/page.tsx': 95,
  'app/globals.css': 75,
  'lib/': 70,
  'components/': 65,
  'app/': 60,
  'types/': 55,
  'hooks/': 50,
  'utils/': 45
};

class OptimizedCodebaseAnalyzer {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.codebaseContent = '';
    this.projectRequirements = '';
    this.currentPass = 1;
    this.maxPasses = 3;
    this.analysisMode = 'comprehensive'; // 'comprehensive', 'focused', 'minimal'
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  question(query) {
    return new Promise(resolve => this.rl.question(query, resolve));
  }

  readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
      return null;
    }
  }

  writeFileContent(filePath, content) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing file ${filePath}: ${error.message}`);
      return false;
    }
  }

  shouldExclude(filePath) {
    const relativePath = path.relative(PROJECT_PATH, filePath);
    const fileName = path.basename(filePath);
    
    return EXCLUDE_DIRS.some(dir => 
      relativePath.includes(dir) || relativePath.startsWith(dir)
    ) || EXCLUDE_FILES.includes(fileName);
  }

  shouldIncludeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return INCLUDE_EXTENSIONS.includes(ext);
  }

  // Calculate file importance score
  getFileImportance(filePath) {
    const relativePath = path.relative(PROJECT_PATH, filePath);
    let score = 0;
    
    // Check exact matches first
    if (FILE_IMPORTANCE[relativePath]) {
      return FILE_IMPORTANCE[relativePath];
    }
    
    // Check directory matches
    for (const [pattern, importance] of Object.entries(FILE_IMPORTANCE)) {
      if (relativePath.startsWith(pattern)) {
        score = Math.max(score, importance);
      }
    }
    
    // Boost core files
    if (relativePath.includes('layout.tsx') || relativePath.includes('page.tsx')) {
      score += 20;
    }
    
    // Reduce score for deeply nested files
    const depth = relativePath.split(path.sep).length;
    score -= Math.max(0, (depth - 3) * 5);
    
    return Math.max(0, score);
  }

  readDirectory(dirPath, maxDepth = 8, currentDepth = 0) {
    if (currentDepth > maxDepth) return [];
    
    const items = [];
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (this.shouldExclude(fullPath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          items.push(...this.readDirectory(fullPath, maxDepth, currentDepth + 1));
        } else if (entry.isFile() && this.shouldIncludeFile(fullPath)) {
          const content = this.readFileContent(fullPath);
          if (content !== null) {
            const relativePath = path.relative(PROJECT_PATH, fullPath);
            const importance = this.getFileImportance(fullPath);
            
            items.push({
              path: relativePath,
              fullPath: fullPath,
              content: content,
              size: content.length,
              importance: importance
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dirPath}: ${error.message}`);
    }
    
    return items;
  }

  // Smart file filtering based on analysis mode and content size
  filterFilesByStrategy(files, strategy = 'comprehensive') {
    let filteredFiles = [...files];
    
    // Remove very large files first
    const maxFileSize = strategy === 'minimal' ? 5000 : 
                       strategy === 'focused' ? 15000 : 30000;
    
    filteredFiles = filteredFiles.filter(file => file.size < maxFileSize);
    
    // Sort by importance
    filteredFiles.sort((a, b) => b.importance - a.importance);
    
    // Apply strategy-specific limits
    let maxFiles, minImportance;
    
    switch (strategy) {
      case 'minimal':
        maxFiles = 50;
        minImportance = 40;
        break;
      case 'focused':
        maxFiles = 150;
        minImportance = 20;
        break;
      case 'comprehensive':
      default:
        maxFiles = 300;
        minImportance = 0;
        break;
    }
    
    // Filter by minimum importance and max file count
    filteredFiles = filteredFiles
      .filter(file => file.importance >= minImportance)
      .slice(0, maxFiles);
    
    return filteredFiles;
  }

  // Estimate token count
  estimateTokens(content) {
    return Math.ceil(content.length / MAX_CHARS_PER_TOKEN);
  }

  // Format codebase with smart truncation
  formatCodebaseOptimized(files, maxChars = MAX_CONTENT_CHARS) {
    let formatted = `Project Structure (${files.length} files):\n\n`;
    
    // Add file tree (compact)
    formatted += `Key Files:\n`;
    files.slice(0, 30).forEach(file => {
      formatted += `├── ${file.path} (${file.importance})\n`;
    });
    if (files.length > 30) {
      formatted += `... and ${files.length - 30} more files\n`;
    }
    formatted += `\n`;
    
    // Add file contents with smart truncation
    formatted += `File Contents:\n\n`;
    
    let currentChars = formatted.length;
    const maxContentPerFile = Math.floor((maxChars - currentChars) / files.length);
    
    for (const file of files) {
      const fileHeader = `File: ${file.path} (importance: ${file.importance})\n${'='.repeat(50)}\n`;
      
      if (currentChars + fileHeader.length > maxChars) break;
      
      formatted += fileHeader;
      currentChars += fileHeader.length;
      
      let content = file.content;
      const availableSpace = Math.min(maxContentPerFile, maxChars - currentChars - 100);
      
      if (content.length > availableSpace) {
        // Smart truncation - keep beginning and end
        const keepStart = Math.floor(availableSpace * 0.7);
        const keepEnd = availableSpace - keepStart - 50;
        
        content = content.substring(0, keepStart) + 
                 '\n\n... [truncated] ...\n\n' + 
                 content.substring(content.length - keepEnd);
      }
      
      formatted += content + '\n\n';
      currentChars += content.length + 2;
      
      if (currentChars > maxChars) break;
    }
    
    return formatted;
  }

  loadProjectRequirements() {
    console.log(`Loading project requirements from: ${PRD_PATH}`);
    
    if (!fs.existsSync(PRD_PATH)) {
      console.error(`Error: PRD.txt not found at ${PRD_PATH}`);
      console.log('Please ensure the PRD.txt file exists in the memory-bank directory.');
      process.exit(1);
    }
    
    let requirements = this.readFileContent(PRD_PATH);
    if (!requirements) {
      console.error('Error: Could not read PRD.txt file');
      process.exit(1);
    }
    
    // Truncate requirements if too long
    const maxRequirementsChars = 10000;
    if (requirements.length > maxRequirementsChars) {
      requirements = requirements.substring(0, maxRequirementsChars) + '\n\n[... truncated for brevity ...]';
      console.log(`⚠️  PRD truncated to ${maxRequirementsChars} characters`);
    }
    
    this.projectRequirements = requirements;
    console.log(`✓ Loaded project requirements (${this.projectRequirements.length} characters)`);
  }

  async selectAnalysisStrategy() {
    console.log('\n📊 Analysis Strategy Selection:');
    console.log('1. Minimal - Focus on core files only (~50 files, fastest)');
    console.log('2. Focused - Include important components (~150 files, balanced)'); 
    console.log('3. Comprehensive - Include most relevant files (~300 files, thorough)');
    console.log('4. Multi-pass - Analyze in multiple focused passes (recommended)');
    
    const choice = await this.question('\nSelect strategy (1-4) [4]: ');
    
    switch (choice.trim()) {
      case '1':
        this.analysisMode = 'minimal';
        break;
      case '2':
        this.analysisMode = 'focused';
        break;
      case '3':
        this.analysisMode = 'comprehensive';
        break;
      case '4':
      default:
        this.analysisMode = 'multi-pass';
        break;
    }
    
    console.log(`✓ Selected: ${this.analysisMode} analysis`);
  }

  loadCodebase(focusArea = null) {
    console.log(`Loading codebase from: ${PROJECT_PATH}${focusArea ? ` (focus: ${focusArea})` : ''}`);
    
    if (!fs.existsSync(PROJECT_PATH)) {
      console.error(`Error: Project directory not found at ${PROJECT_PATH}`);
      process.exit(1);
    }
    
    let files = this.readDirectory(PROJECT_PATH);
    
    // Apply focus area filter if specified
    if (focusArea) {
      files = files.filter(file => 
        file.path.includes(focusArea) || 
        file.importance > 80 // Always include high-importance files
      );
    }
    
    // Apply strategy-specific filtering
    const strategy = this.analysisMode === 'multi-pass' ? 'focused' : this.analysisMode;
    const filteredFiles = this.filterFilesByStrategy(files, strategy);
    
    this.codebaseContent = this.formatCodebaseOptimized(filteredFiles);
    this.files = filteredFiles;
    
    const estimatedTokens = this.estimateTokens(this.codebaseContent + this.projectRequirements);
    
    console.log(`✓ Loaded codebase: ${filteredFiles.length} files, ${this.codebaseContent.length} characters`);
    console.log(`📊 Estimated tokens: ${estimatedTokens} / ${MAX_TOKENS}`);
    
    if (estimatedTokens > MAX_TOKENS) {
      console.log('⚠️  Still over token limit, applying additional filtering...');
      
      // Emergency filtering - keep only highest importance files
      const emergencyFiles = filteredFiles
        .filter(file => file.importance > 50)
        .slice(0, 100);
      
      this.codebaseContent = this.formatCodebaseOptimized(emergencyFiles, MAX_CONTENT_CHARS * 0.8);
      this.files = emergencyFiles;
      
      const newTokens = this.estimateTokens(this.codebaseContent + this.projectRequirements);
      console.log(`📊 After emergency filtering: ${newTokens} tokens with ${emergencyFiles.length} files`);
    }
    
    // Show top files included
    console.log('\nTop files included:');
    filteredFiles.slice(0, 15).forEach(file => {
      console.log(`  • ${file.path} (${file.importance}, ${file.size} bytes)`);
    });
    if (filteredFiles.length > 15) {
      console.log(`  ... and ${filteredFiles.length - 15} more files`);
    }
  }

  async executeGitCommand(command, cwd = PROJECT_PATH) {
    try {
      const { stdout, stderr } = await execAsync(command, { cwd });
      if (stderr && !stderr.includes('warning')) {
        console.warn(`Git warning: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      console.error(`Git error: ${error.message}`);
      throw error;
    }
  }

  async createGitBranch() {
    console.log('\n📝 Creating git branch for changes...');
    
    try {
      await this.executeGitCommand('git status');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const branchName = `codebase-improvements-${timestamp}`;
      await this.executeGitCommand(`git checkout -b ${branchName}`);
      console.log(`✓ Created and switched to branch: ${branchName}`);
      return branchName;
    } catch (error) {
      console.error('Failed to create git branch:', error.message);
      console.log('Continuing without git branch...');
      return null;
    }
  }

  async applyChanges(response) {
    console.log('\n🔧 Applying changes...');
    
    const fileOperations = [];
    const lines = response.split('\n');
    let currentFileOp = null;
    let inCodeBlock = false;
    let codeContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('Create file:') || line.includes('Update file:') || line.includes('Delete file:')) {
        if (currentFileOp && currentFileOp.content) {
          fileOperations.push(currentFileOp);
        }
        
        const parts = line.split(':');
        const filePath = parts.slice(1).join(':').trim();
        currentFileOp = {
          operation: line.includes('Delete') ? 'delete' : 'write',
          path: filePath,
          content: ''
        };
        inCodeBlock = false;
        codeContent = '';
      } else if (line.startsWith('```')) {
        if (inCodeBlock) {
          if (currentFileOp) {
            currentFileOp.content = codeContent;
            fileOperations.push(currentFileOp);
            currentFileOp = null;
          }
          inCodeBlock = false;
          codeContent = '';
        } else {
          inCodeBlock = true;
          codeContent = '';
        }
      } else if (inCodeBlock) {
        codeContent += line + '\n';
      }
    }
    
    if (currentFileOp && currentFileOp.content) {
      fileOperations.push(currentFileOp);
    }
    
    for (const op of fileOperations) {
      const fullPath = path.join(PROJECT_PATH, op.path);
      
      try {
        if (op.operation === 'delete') {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`✓ Deleted: ${op.path}`);
          }
        } else {
          this.writeFileContent(fullPath, op.content.trim());
          console.log(`✓ ${fs.existsSync(fullPath) ? 'Updated' : 'Created'}: ${op.path}`);
        }
      } catch (error) {
        console.error(`❌ Failed to ${op.operation} ${op.path}: ${error.message}`);
      }
    }
    
    console.log(`Applied ${fileOperations.length} file operations`);
    return fileOperations.length > 0;
  }

  async runSingleAnalysis(focusArea = null, passNumber = 1) {
    console.log(`\n--- ${focusArea ? `${focusArea} Analysis` : `Pass ${passNumber}`} ---`);
    
    const prompt = `You are an AI coding expert specialized in analyzing and improving Next.js applications. ${focusArea ? `Focus specifically on the ${focusArea} area of the codebase.` : ''}

<codebase>
${this.codebaseContent}
</codebase>

<project_requirements>
${this.projectRequirements}
</project_requirements>

Your task:
1. Analyze the ${focusArea || 'codebase'} and identify key issues
2. Provide specific, implementable solutions
3. Focus on high-impact improvements
4. Provide concrete file operations

${focusArea ? `Focus areas for ${focusArea}:
- Component structure and reusability
- Performance optimizations
- Code organization
- Error handling
- Type safety` : ''}

Provide file operations in this format:
Create file: path/to/file.tsx
\`\`\`typescript
// file content here
\`\`\`

Update file: path/to/existing/file.tsx
\`\`\`typescript
// updated content here
\`\`\`

Focus on actual implementation rather than just recommendations.`;

    try {
      const response = await this.anthropic.beta.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 8000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('❌ Error during analysis:', error.message);
      if (error.status === 401) {
        console.error('Please check your ANTHROPIC_API_KEY environment variable.');
      }
      throw error;
    }
  }

  async runMultiPassAnalysis() {
    const focusAreas = [
      'app', // Core app structure
      'components', // Reusable components
      'lib' // Utilities and configurations
    ];
    
    console.log('\n🎯 Multi-pass analysis strategy selected');
    console.log(`Will analyze: ${focusAreas.join(', ')}`);
    
    const results = [];
    
    for (const area of focusAreas) {
      try {
        console.log(`\n🔍 Analyzing ${area}...`);
        this.loadCodebase(area);
        
        const result = await this.runSingleAnalysis(area);
        results.push({ area, result });
        
        // Save individual results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFile = `analysis-${area}-${timestamp}.md`;
        fs.writeFileSync(outputFile, result);
        console.log(`💾 ${area} analysis saved to: ${outputFile}`);
        
        // Apply changes immediately
        await this.applyChanges(result);
        
        // Small delay between passes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error analyzing ${area}:`, error.message);
        continue;
      }
    }
    
    return results;
  }

  async execute() {
    console.log('🚀 Optimized Codebase Analysis & Implementation Tool');
    console.log('=' .repeat(70));
    console.log(`Project: ${PROJECT_PATH}`);
    console.log('=' .repeat(70));
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ Error: ANTHROPIC_API_KEY environment variable not set');
      console.log('Please set your Anthropic API key in .env.local');
      process.exit(1);
    }
    
    try {
      this.loadProjectRequirements();
      await this.selectAnalysisStrategy();
      
      let results;
      
      if (this.analysisMode === 'multi-pass') {
        // Create git branch
        await this.createGitBranch();
        results = await this.runMultiPassAnalysis();
      } else {
        this.loadCodebase();
        
        // Ask for approval
        const approval = await this.question('\n❓ Proceed with analysis? (y/n): ');
        if (approval.toLowerCase() !== 'y' && approval.toLowerCase() !== 'yes') {
          console.log('Analysis cancelled.');
          this.rl.close();
          return;
        }
        
        await this.createGitBranch();
        const result = await this.runSingleAnalysis();
        await this.applyChanges(result);
        
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFile = `analysis-${this.analysisMode}-${timestamp}.md`;
        fs.writeFileSync(outputFile, result);
        console.log(`💾 Results saved to: ${outputFile}`);
      }
      
      console.log('\n🎉 Analysis and implementation complete!');
      
    } catch (error) {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Run the optimized analyzer
const analyzer = new OptimizedCodebaseAnalyzer();
analyzer.execute().catch(console.error);
