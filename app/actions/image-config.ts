'use server'

import fs from 'fs/promises'
import path from 'path'
import { ImageAsset } from '@/lib/image-config'

const CONFIG_PATH = path.join(process.cwd(), 'lib/image-config.ts')

export async function updateImageConfig(assets: Record<string, ImageAsset>) {
  try {
    // Read the current file
    const currentContent = await fs.readFile(CONFIG_PATH, 'utf-8')
    
    // Find the start and end of the IMAGE_ASSETS object
    const startMarker = 'export const IMAGE_ASSETS: Record<string, ImageAsset> = '
    const start = currentContent.indexOf(startMarker) + startMarker.length
    const end = currentContent.indexOf('};', start) + 1
    
    // Create the new content with proper property name formatting
    const assetsString = JSON.stringify(assets, null, 2)
      .replace(/"([^"]+)":/g, (match, key) => {
        // If the key contains a hyphen, wrap it in square brackets
        return key.includes('-') ? `['${key}']:` : `${key}:`
      })
      .replace(/"/g, "'") // Convert remaining double quotes to single quotes
    
    // Combine the content
    const newContent = 
      currentContent.slice(0, start) +
      assetsString +
      currentContent.slice(end)
    
    // Write the file
    await fs.writeFile(CONFIG_PATH, newContent, 'utf-8')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update image config:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update configuration'
    }
  }
}

export async function deleteImageAsset(assetId: string) {
  try {
    // Read the current file
    const currentContent = await fs.readFile(CONFIG_PATH, 'utf-8')
    
    // Import the current configuration
    const { IMAGE_ASSETS } = await import('@/lib/image-config')
    
    // Remove the asset
    const newAssets = { ...IMAGE_ASSETS }
    delete newAssets[assetId]
    
    // Update the file
    const result = await updateImageConfig(newAssets)
    
    return result
  } catch (error) {
    console.error('Failed to delete image asset:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete asset'
    }
  }
} 