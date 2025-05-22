# Codebase Analyzer Setup & Usage Instructions

## 🚀 Advanced AI-Powered Codebase Analysis & Implementation Tool

This tool provides comprehensive analysis and automatic implementation of improvements for your Next.js application using Claude 3.7 Sonnet.

## Prerequisites ✅

- ✅ **Node.js 18+** (already have it)
- ✅ **Anthropic SDK** (already installed in package.json)
- ✅ **Git repository** (already set up)
- ✅ **PRD.md in memory-bank/** (required for project requirements)
- 🔑 **Anthropic API key** (get one at https://console.anthropic.com/)

## Quick Setup

### 1. Get Your Anthropic API Key
1. Go to https://console.anthropic.com/
2. Create account or sign in
3. Generate an API key
4. Copy the key

### 2. Set Your API Key
Choose one method:

**Option A: Add to .env.local (recommended)**
```bash
# Add this line to your existing .env.local file
ANTHROPIC_API_KEY=your_api_key_here
```

**Option B: Set environment variable**
```bash
# Windows Command Prompt
set ANTHROPIC_API_KEY=your_api_key_here

# Windows PowerShell
$env:ANTHROPIC_API_KEY="your_api_key_here"
```

### 3. Run the Analyzer
```bash
npm run analyze-codebase
```

## What It Does 🔧

### Phase 1: Analysis
- **Reads your entire codebase** from project root
- **Loads project requirements** from `memory-bank/PRD.md`
- **Analyzes code** using Claude 3.7 Sonnet
- **Identifies issues** like:
  - Component duplication
  - Performance problems
  - Project structure inconsistencies
  - Error handling gaps
  - Font integration issues
  - Any other code quality issues

### Phase 2: Implementation (after your approval)
- **Creates git branch** for changes
- **Actually implements fixes** by:
  - Creating new files
  - Updating existing files
  - Deleting unnecessary files
  - Reorganizing folder structure
- **Updates dependencies** if needed
- **Tests the application** to ensure it works

### Phase 3: Iterative Improvement
- **Checks for remaining issues**
- **Runs additional iterations** if needed
- **Continues until codebase is optimized**

## Interactive Workflow 🤝

1. **Initial Analysis**: Shows comprehensive analysis and improvement plan
2. **Get Your Approval**: "Do you approve proceeding with implementation? (y/n)"
3. **Implementation**: Actually makes the changes to your code
4. **Testing**: Verifies app still works after changes
5. **Next Iteration**: "Do you want another iteration? (y/n)"

## Example Output

```
🚀 Advanced Codebase Analysis & Implementation Tool
============================================================
Project: D:\fal
============================================================

Loading project requirements from: D:\fal\memory-bank\PRD.md
✓ Loaded project requirements (45,234 characters)

Loading codebase from: D:\fal
✓ Loaded codebase: 127 files, 234,567 characters

Files included in analysis:
  • package.json (3,456 bytes)
  • next.config.ts (1,234 bytes)
  • app/layout.tsx (2,345 bytes)
  ... and 124 more files

🔍 Starting comprehensive codebase analysis and improvement...

--- Iteration 1 ---

📋 ANALYSIS RESULTS:
================================================================================
## Codebase Overview
Your Next.js application has a complex structure with multiple media handling 
approaches and several opportunities for improvement...

## Issues Identified
1. **Component Duplication**: Found 5 duplicate media components
2. **Performance Issues**: Unoptimized image loading in 12 components
3. **Structure Inconsistencies**: Mixed folder organization patterns
...

❓ Do you approve proceeding with the implementation? (y/n): y

📝 Creating git branch for changes...
✓ Created and switched to branch: codebase-improvements-2025-05-21T15-30-00

🔧 Applying changes...
✓ Created: components/ui/optimized-media.tsx
✓ Updated: app/layout.tsx
✓ Deleted: components/duplicate-image.tsx
Applied 15 file operations

🚀 Checking application startup...
✓ Application compiled successfully

❓ Do you want another iteration? (y/n): y
```

## Safety Features 🛡️

- **Git Branching**: All changes in separate branch
- **Approval Required**: Won't change anything without permission
- **Application Testing**: Verifies app works after changes
- **Iterative Approach**: Small, manageable changes
- **Detailed Logging**: Complete record of what changed

## File Filtering 📁

**Includes these file types:**
- `.js`, `.jsx`, `.ts`, `.tsx` (JavaScript/TypeScript)
- `.json`, `.md` (Configuration/Documentation)  
- `.css`, `.scss` (Styles)
- `.html`, `.yml`, `.yaml` (Templates/Config)
- `.env*`, `.eslintrc*`, `.prettierrc*` (Environment/Linting)

**Excludes these directories:**
- `node_modules`, `.next`, `.git`
- `dist`, `build`, `coverage`
- `temp-migration`, `backup`, `attached_assets`
- `.vercel`, `.netlify`, `.husky`, `.cursor`

## Troubleshooting 🔧

**Error: ANTHROPIC_API_KEY not set**
- Add the API key to your `.env.local` file or set as environment variable

**Error: PRD.md not found**
- Make sure `memory-bank/PRD.md` exists in your project root
- The file contains your project requirements and goals

**Error: Application won't start**
- The script will identify and try to fix startup issues
- Check the detailed error output for specifics

**Large files filtered out**
- Files over 30KB are excluded to manage API limits
- The script tells you which files were filtered

## Customization ⚙️

You can modify `analyze-codebase.js` to:
- Change included/excluded file types
- Adjust file size limits
- Modify excluded directories
- Change the PRD file location

## Output Files 📄

The script creates:
- `analysis-iteration-1-[timestamp].md` - First analysis results
- `analysis-iteration-2-[timestamp].md` - Follow-up analyses
- Git branch with all implemented changes
- Updated project files

## Advanced Features 🚀

- **Smart File Prioritization**: Config files and important components analyzed first
- **Dependency Management**: Automatically updates package.json if needed
- **Test Integration**: Runs your test suite after changes (if available)
- **Error Recovery**: Continues iterating until all issues are resolved
- **Real Implementation**: Actually creates, updates, and deletes files

## Usage Tips 💡

1. **Review the plan carefully** before approving implementation
2. **Let it run multiple iterations** for best results
3. **Check the git branch** to see all changes made
4. **Merge when satisfied** with the improvements
5. **Backup important work** before running (git handles this automatically)

## Example Commands

```bash
# Run the analyzer
npm run analyze-codebase

# Check the git branch it created
git branch

# See what changed
git diff main

# Switch back to main if needed
git checkout main

# Merge the improvements when ready
git merge codebase-improvements-[timestamp]
```

---

## Ready to Improve Your Codebase? 🎯

Just run:
```bash
npm run analyze-codebase
```

The tool will guide you through the entire process interactively!