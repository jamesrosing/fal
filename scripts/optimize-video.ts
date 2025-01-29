import sharp from "sharp"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"

const execAsync = promisify(exec)

async function checkFfmpeg() {
  try {
    await execAsync("ffmpeg -version")
    return true
  } catch (error) {
    console.error("\n❌ FFmpeg is not installed. Please install it first:")
    console.log("\nFor Windows:")
    console.log("1. Install with Chocolatey (recommended):")
    console.log("   choco install ffmpeg")
    console.log("\nOr download manually:")
    console.log("1. Go to https://github.com/BtbN/FFmpeg-Builds/releases")
    console.log("2. Download ffmpeg-master-latest-win64-gpl.zip")
    console.log("3. Extract and add the bin folder to your system PATH")
    console.log("\nFor Mac:")
    console.log("   brew install ffmpeg")
    console.log("\nFor Linux:")
    console.log("   sudo apt install ffmpeg")
    return false
  }
}

async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function checkVideoExists(videoPath: string) {
  try {
    await fs.access(videoPath)
    return true
  } catch {
    console.error(`\n❌ Video file not found: ${videoPath}`)
    console.log("\nPlease ensure you have placed your video file at:")
    console.log(videoPath)
    console.log("\nThe video should be named 'background.mp4'")
    return false
  }
}

async function generateVideoPoster() {
  const videoDir = path.join(process.cwd(), "public", "video")
  const videoPath = path.join(videoDir, "background.mp4")
  
  await ensureDirectoryExists(videoDir)

  if (!(await checkVideoExists(videoPath))) {
    return false
  }

  try {
    console.log("📸 Generating video poster...")
    // Use ffmpeg to extract the first frame
    await execAsync(`ffmpeg -i "${videoPath}" -vframes 1 -f image2 "${path.join(videoDir, "temp-poster.jpg")}"`)
    
    // Optimize the poster image
    await sharp(path.join(videoDir, "temp-poster.jpg"))
      .resize(1920, 1080, {
        fit: "cover",
        position: "center"
      })
      .jpeg({ 
        quality: 80,
        progressive: true
      })
      .toFile(path.join(videoDir, "video-poster.jpg"))

    // Clean up temporary file
    await fs.unlink(path.join(videoDir, "temp-poster.jpg"))
    
    console.log("✅ Video poster generated successfully")
    return true
  } catch (error) {
    console.error("Error generating video poster:", error)
    return false
  }
}

async function optimizeVideo() {
  const videoDir = path.join(process.cwd(), "public", "video")
  const videoPath = path.join(videoDir, "background.mp4")
  
  await ensureDirectoryExists(videoDir)

  if (!(await checkVideoExists(videoPath))) {
    return false
  }

  try {
    console.log("🎬 Converting video to WebM format...")
    // Convert to WebM with VP9 codec
    await execAsync(`ffmpeg -i "${videoPath}" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "${path.join(videoDir, "background.webm")}"`)
    
    console.log("✅ Video optimization completed")
    return true
  } catch (error) {
    console.error("Error optimizing video:", error)
    return false
  }
}

// Run the optimization process
async function main() {
  console.log("🎥 Starting video optimization process...")
  
  // Check for ffmpeg installation
  if (!(await checkFfmpeg())) {
    return
  }

  const posterSuccess = await generateVideoPoster()
  const optimizeSuccess = await optimizeVideo()

  if (posterSuccess && optimizeSuccess) {
    console.log("\n✨ All done! Your video has been optimized and the poster has been generated.")
    console.log("\nFiles created:")
    console.log("- public/video/video-poster.jpg")
    console.log("- public/video/background.webm")
  } else {
    console.log("\n⚠️ Some operations failed. Please check the errors above.")
  }
}

main()

