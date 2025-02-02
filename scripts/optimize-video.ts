import sharp from "sharp"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import { promises as fs } from "node:fs"
import { join, normalize } from "node:path"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
import { v2 as cloudinary } from "cloudinary"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const execAsync = promisify(exec)

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// Helper function to normalize paths for ffmpeg
function normalizePath(path: string): string {
  // Normalize path and replace backslashes with forward slashes
  return normalize(path).replace(/\\/g, '/')
}

// Helper function to upload to Cloudinary
async function uploadToCloudinary(filePath: string, publicId: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      public_id: publicId,
      folder: process.env.CLOUDINARY_FOLDER,
      overwrite: true
    })
    console.log(`✅ Uploaded ${publicId} to Cloudinary`)
    return result.secure_url
  } catch (error) {
    console.error(`Error uploading ${publicId} to Cloudinary:`, error)
    throw error
  }
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
    const uploadedUrls: Record<string, string> = {}
    
    for (const config of VIDEO_CONFIGS) {
      console.log(`\nProcessing ${config.name} version...`)
      
      // Convert to WebM with VP9 codec
      console.log(`- Creating WebM version...`)
      const webmPath = join(targetDir, `hero-${config.name}.webm`)
      await execAsync(
        `ffmpeg -i "${normalizePath(videoPath)}" -c:v libvpx-vp9 -crf ${config.crf.webm} -b:v 0 ` +
        `-vf scale=${config.width}:${config.height} -c:a libopus ` +
        `"${normalizePath(webmPath)}"`,
      )
      
      // Upload WebM to Cloudinary
      uploadedUrls[`webm-${config.name}`] = await uploadToCloudinary(
        webmPath,
        `hero-${config.name}-webm`
      )
      
      // Convert to MP4 with H.264 codec
      console.log(`- Creating MP4 version...`)
      const mp4Path = join(targetDir, `hero-${config.name}.mp4`)
      await execAsync(
        `ffmpeg -i "${normalizePath(videoPath)}" -c:v libx264 -crf ${config.crf.mp4} ` +
        `-vf scale=${config.width}:${config.height} -movflags +faststart ` +
        `"${normalizePath(mp4Path)}"`,
      )
      
      // Upload MP4 to Cloudinary
      uploadedUrls[`mp4-${config.name}`] = await uploadToCloudinary(
        mp4Path,
        `hero-${config.name}-mp4`
      )
    }
    
    console.log("\n✅ Video optimization and upload completed")
    console.log("\nCloudinary URLs:")
    Object.entries(uploadedUrls).forEach(([key, url]) => {
      console.log(`${key}: ${url}`)
    })
    return uploadedUrls
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
    console.log("\n✨ All done! Your video has been optimized and uploaded to Cloudinary.")
    console.log("\nNext steps:")
    console.log("1. Update the videoSources array in components/hero.tsx with the Cloudinary URLs")
    console.log("2. Update next.config.ts to include the Cloudinary domain")
  } else {
    console.log("\n⚠️ Some operations failed. Please check the errors above.")
  }
}

main()

