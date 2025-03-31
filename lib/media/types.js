/**
 * @typedef {'image' | 'video'} MediaType
 */

/**
 * @typedef {'hero' | 'article' | 'service' | 'team' | 'gallery' | 'logo' | 'video-thumbnail'} MediaArea
 */

/**
 * @typedef {'auto' | 'jpg' | 'png' | 'webp' | 'avif'} ImageFormat
 */

/**
 * @typedef {'mp4' | 'webm' | 'mov'} VideoFormat
 */

/**
 * @typedef {Object} MediaAsset
 * @property {string} id
 * @property {MediaType} type
 * @property {MediaArea} area
 * @property {string} description
 * @property {string} publicId
 * @property {Object} [dimensions]
 * @property {number} dimensions.width
 * @property {number} dimensions.height
 * @property {number} dimensions.aspectRatio
 * @property {Object} defaultOptions
 * @property {number} defaultOptions.width
 * @property {number} defaultOptions.quality
 * @property {ImageFormat} [defaultOptions.format]
 */

/**
 * @typedef {Object} MediaPlacement
 * @property {string} path
 * @property {string} description
 * @property {Object} dimensions
 * @property {number} dimensions.width
 * @property {number} dimensions.height
 * @property {number} dimensions.aspectRatio
 * @property {string[]} transformations
 */

/**
 * @typedef {Object} MediaOptions
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [quality]
 * @property {string} [format]
 * @property {string} [crop]
 * @property {string} [gravity]
 * @property {boolean} [simplifiedMode]
 * @property {'image' | 'video' | 'auto' | 'raw'} [resource_type]
 * @property {string} [alt]
 */

/**
 * @typedef {Object} VideoOptions
 * @property {VideoFormat} [format]
 * @property {number} [quality]
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} [poster]
 * @property {boolean} [autoPlay]
 * @property {boolean} [muted]
 * @property {boolean} [loop]
 * @property {boolean} [controls]
 */

export { 
  // These exports are just for JSDoc type compatibility
  // Not actually used at runtime
} 