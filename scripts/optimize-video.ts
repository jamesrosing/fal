import sharp from "sharp"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import { promises as fs } from "node:fs"
import { join, normalize } from "node:path"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const execAsync = promisify(exec)

// Helper function to normalize paths for ffmpeg
function normalizePath(path: string): string {
  // Normalize path and replace backslashes with forward slashes
  return normalize(path).replace(/\\/g, '/')
}

interface VideoConfig {
  name: string;
  width: number;
  height: number;
  crf: {
    webm: number;
    mp4: number;
  };
}

const VIDEO_CONFIGS: VideoConfig[] = [
  {
    name: "720p",
    width: 1280,
    height: 720,
    crf: {
      webm: 30,
      mp4: 23,
    },
  },
  {
    name: "480p",
    width: 854,
    height: 480,
    crf: {
      webm: 33,
      mp4: 26,
    },
  },
]

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

async function generateImages() {
  const rootDir = join(__dirname, "..")
  const videoDir = join(rootDir, "public", "video")
  const imagesDir = join(rootDir, "public", "images")
  const videoPath = join(videoDir, "background.mp4")
  
  await ensureDirectoryExists(imagesDir)

  if (!(await checkVideoExists(videoPath))) {
    return false
  }

  try {
    console.log("📸 Generating images...")
    // Extract first frame for poster
    await execAsync(`ffmpeg -i "${normalizePath(videoPath)}" -vframes 1 -f image2 "${normalizePath(join(imagesDir, "temp-poster.jpg"))}"`)
    
    // Create poster image
    await sharp(join(imagesDir, "temp-poster.jpg"))
      .resize(1920, 1080, {
        fit: "cover",
        position: "center"
      })
      .jpeg({ 
        quality: 80,
        progressive: true
      })
      .toFile(join(imagesDir, "hero-poster.jpg"))

    // Create fallback image (slightly different crop/processing)
    await sharp(join(imagesDir, "temp-poster.jpg"))
      .resize(1920, 1080, {
        fit: "cover",
        position: "center"
      })
      .jpeg({ 
        quality: 85,
        progressive: true
      })
      .toFile(join(imagesDir, "hero-fallback.jpg"))

    // Clean up
    await fs.unlink(join(imagesDir, "temp-poster.jpg"))
    
    console.log("✅ Images generated successfully")
    return true
  } catch (error) {
    console.error("Error generating images:", error)
    return false
  }
}

async function optimizeVideo() {
  const rootDir = join(__dirname, "..")
  const sourceDir = join(rootDir, "public", "video")
  const targetDir = join(rootDir, "public", "videos")
  const videoPath = join(sourceDir, "background.mp4")
  
  await ensureDirectoryExists(targetDir)

  if (!(await checkVideoExists(videoPath))) {
    return false
  }

  try {
    console.log("🎬 Optimizing video for multiple formats...")
    
    for (const config of VIDEO_CONFIGS) {
      console.log(`\nProcessing ${config.name} version...`)
      
      // Convert to WebM with VP9 codec
      console.log(`- Creating WebM version...`)
      await execAsync(
        `ffmpeg -i "${normalizePath(videoPath)}" -c:v libvpx-vp9 -crf ${config.crf.webm} -b:v 0 ` +
        `-vf scale=${config.width}:${config.height} -c:a libopus ` +
        `"${normalizePath(join(targetDir, `hero-${config.name}.webm`))}"`,
      )
      
      // Convert to MP4 with H.264 codec
      console.log(`- Creating MP4 version...`)
      await execAsync(
        `ffmpeg -i "${normalizePath(videoPath)}" -c:v libx264 -crf ${config.crf.mp4} ` +
        `-vf scale=${config.width}:${config.height} -movflags +faststart ` +
        `"${normalizePath(join(targetDir, `hero-${config.name}.mp4`))}"`,
      )
    }
    
    console.log("\n✅ Video optimization completed")
    return true
  } catch (error) {
    console.error("Error optimizing video:", error)
    return false
  }
}

async function main() {
  console.log("🎥 Starting video optimization process...")
  
  if (!(await checkFfmpeg())) {
    return
  }

  const imagesSuccess = await generateImages()
  const optimizeSuccess = await optimizeVideo()

  if (imagesSuccess && optimizeSuccess) {
    console.log("\n✨ All done! Your video has been optimized and images have been generated.")
    console.log("\nFiles created:")
    console.log("- public/images/hero-poster.jpg")
    console.log("- public/images/hero-fallback.jpg")
    console.log("- public/videos/hero-720p.webm")
    console.log("- public/videos/hero-720p.mp4")
    console.log("- public/videos/hero-480p.webm")
    console.log("- public/videos/hero-480p.mp4")
  } else {
    console.log("\n⚠️ Some operations failed. Please check the errors above.")
  }
}

main()

