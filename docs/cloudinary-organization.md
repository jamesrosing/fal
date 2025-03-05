# Cloudinary Organization Structure

## Folder Structure

```
about
about/facility
about/hero
about/mission
about/team
articles
articles/categories
articles/hero
contact
contact/hero
contact/locations
home
home/featured-articles
home/hero
home/services
home/testimonials
procedures
services
services-dermatology
services-dermatology/hero
services-dermatology/treatments
services-medical-spa
services-medical-spa/hero
services-medical-spa/treatments
services-plastic-surgery
services-plastic-surgery/before-after
services-plastic-surgery/hero
services-plastic-surgery/procedures
services/categories
services/dermatology
services/hero
team/headshots
uncategorized
```

## Tags

- about
- articles
- before-after
- categories
- contact
- dermatology
- facility
- featured-articles
- headshot
- hero
- home
- image
- locations
- medical-spa
- mission
- plastic-surgery
- procedure
- procedures
- service
- services
- single
- team
- testimonials
- treatments

## Usage Guidelines

### Naming Conventions

- Use descriptive names that reflect the content of the image
- Follow the pattern: `[section]-[description]-[variant]`
- Example: `dermatology-acne-treatment-before`

### Tag Usage

- Always include content type tags: `image` or `video`
- Use page and section tags to categorize assets
- Add functional tags like `featured`, `hero`, or `gallery` as needed

### Transformation Best Practices

- Use Cloudinary's transformation features instead of storing multiple versions
- Leverage `f_auto` and `q_auto` for automatic format and quality optimization
- Use responsive sizing with breakpoints for different devices

### Component Usage

```tsx
// Import the CloudinaryImage component
import { CloudinaryImage } from '@/lib/cloudinary';

// Basic usage
<CloudinaryImage 
  publicId="page/section/image-name" 
  alt="Description" 
/>

// With area (using predefined dimensions)
<CloudinaryImage 
  publicId="page/section/image-name" 
  area="hero" 
  alt="Hero image" 
/>

// With custom options
<CloudinaryImage 
  publicId="page/section/image-name" 
  alt="Custom image" 
  options={{ width: 500, height: 300, crop: 'fill' }} 
  expandOnHover
/>
```

### Organizing New Assets

1. Determine the appropriate folder based on the page and section where the asset will be used
2. Use descriptive public IDs following the naming convention
3. Apply relevant tags for better searchability and organization
4. Include proper alt text and context metadata

## Existing and New Structure Integration

The folder structure shown above has been integrated with your existing Cloudinary organization.
Any folders that already existed have been preserved, and new folders have been added where needed
