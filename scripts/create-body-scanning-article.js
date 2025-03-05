/**
 * Script to create a 3D Body Scanning article
 * 
 * This script demonstrates how to:
 * 1. Upload an image to Cloudinary
 * 2. Create an article with the uploaded image as the featured image
 * 
 * Usage:
 * - Make sure to have an image file ready to upload
 * - Run this script in the browser console on the admin/articles page
 */

// 1. First, prepare the article content
const articleContent = [
  {
    "type": "paragraph",
    "content": "In the ever-evolving world of aesthetic medicine, precision and measurable results have become essential factors for both practitioners and patients. Enter 3D body scanning technology—a revolutionary approach to body assessment that is changing how we plan treatments, track progress, and visualize results."
  },
  {
    "type": "heading",
    "content": "What is 3D Body Scanning?"
  },
  {
    "type": "paragraph",
    "content": "3D body scanning uses advanced optical technology to create detailed, three-dimensional models of a patient's body. Unlike traditional measurement methods that rely on tape measures or calipers, these high-tech scanners capture thousands of data points in seconds, creating a comprehensive digital model that allows for precise measurements from any angle."
  },
  {
    "type": "paragraph",
    "content": "Modern 3D scanners, like the one shown in the image, are becoming increasingly compact and user-friendly. Many can be used in the privacy of a patient's home or in a clinical setting, making the technology accessible for ongoing progress tracking without requiring frequent in-office visits."
  },
  {
    "type": "heading",
    "content": "Applications in Aesthetic Medicine"
  },
  {
    "type": "paragraph",
    "content": "The applications of 3D body scanning in aesthetic medicine are extensive and transformative:"
  },
  {
    "type": "paragraph",
    "content": "1. Treatment Planning: Practitioners can use detailed 3D models to identify areas for improvement with unprecedented precision, allowing for customized treatment plans tailored to each patient's unique body structure."
  },
  {
    "type": "paragraph",
    "content": "2. Before and After Comparisons: Perhaps the most valuable application is the ability to make objective, side-by-side comparisons of a patient's body before and after procedures. This visual evidence demonstrates the efficacy of treatments like body contouring, fat reduction, and muscle toning with scientific accuracy."
  },
  {
    "type": "paragraph",
    "content": "3. Patient Education: 3D models provide an intuitive visual aid that helps patients understand proposed treatments and set realistic expectations. Seeing a 360-degree view of their body often helps patients identify concerns they may not have noticed in mirror reflections or photographs."
  },
  {
    "type": "paragraph",
    "content": "4. Progress Tracking: For treatments that deliver gradual results over time, such as EMSculpt Neo or CoolSculpting, 3D scanning allows for precise tracking of subtle changes in body composition and circumference measurements."
  },
  {
    "type": "heading",
    "content": "Benefits for Patients and Practitioners"
  },
  {
    "type": "paragraph",
    "content": "For patients, 3D body scanning offers several significant advantages:"
  },
  {
    "type": "paragraph",
    "content": "• Objective Assessment: Removes the subjective nature of visual assessment, providing data-driven measurements of changes in body composition."
  },
  {
    "type": "paragraph",
    "content": "• Enhanced Motivation: Seeing even small changes can motivate patients to maintain lifestyle modifications that complement their aesthetic treatments."
  },
  {
    "type": "paragraph",
    "content": "• Privacy and Comfort: Many modern scanners, like the one pictured, can be used at home or in private settings, reducing the discomfort some patients feel during manual measurements."
  },
  {
    "type": "paragraph",
    "content": "For practitioners, the technology offers equally compelling benefits:"
  },
  {
    "type": "paragraph",
    "content": "• Enhanced Consultation Process: The detailed visual information helps practitioners recommend the most appropriate treatments."
  },
  {
    "type": "paragraph",
    "content": "• Treatment Validation: Objective measurements provide concrete evidence of treatment efficacy, which is valuable for both patient satisfaction and marketing."
  },
  {
    "type": "paragraph",
    "content": "• Reduced Risk: Precise measurements and visualizations can help practitioners avoid overtreatment or undertreatment."
  },
  {
    "type": "heading",
    "content": "Integration with Other Technologies"
  },
  {
    "type": "paragraph",
    "content": "What makes 3D body scanning particularly powerful is its ability to integrate with other technologies. Many systems now combine 3D scanning with:  "
  },
  {
    "type": "paragraph",
    "content": "• AI Analysis: Artificial intelligence can analyze scan data to recommend optimal treatment areas and predict potential outcomes."
  },
  {
    "type": "paragraph",
    "content": "• Virtual Reality: Patients can visualize potential results through virtual reality simulations based on their actual body scans."
  },
  {
    "type": "paragraph",
    "content": "• Treatment Tracking Apps: Mobile applications allow patients to view their progress over time, enhancing engagement with their treatment plan."
  },
  {
    "type": "heading",
    "content": "The Future of Body Assessment"
  },
  {
    "type": "paragraph",
    "content": "As 3D scanning technology continues to advance, we can expect even more sophisticated applications in aesthetic medicine. Future developments may include:"
  },
  {
    "type": "paragraph",
    "content": "• Integration with at-home fitness systems for comprehensive body transformation tracking"
  },
  {
    "type": "paragraph",
    "content": "• Enhanced AI capabilities for more accurate prediction of treatment outcomes"
  },
  {
    "type": "paragraph",
    "content": "• Combination with genetic and metabolic analysis for truly personalized treatment planning"
  },
  {
    "type": "heading",
    "content": "Experience the Difference at Our Practice"
  },
  {
    "type": "paragraph",
    "content": "At our practice, we've embraced 3D body scanning technology as part of our commitment to providing state-of-the-art aesthetic treatments with measurable results. By incorporating this advanced technology into our treatment protocols, we offer our patients an unprecedented level of precision in treatment planning and results verification."
  },
  {
    "type": "paragraph",
    "content": "Whether you're considering body contouring, fat reduction, or muscle enhancement treatments, our 3D scanning capability ensures that you'll have objective evidence of your transformation journey."
  },
  {
    "type": "paragraph",
    "content": "Contact us today to learn more about how 3D body scanning can enhance your aesthetic treatment experience and help you achieve your body confidence goals with scientific precision."
  }
];

// 2. Prepare the article metadata
const articleMetadata = {
  title: "3D Body Scanning: The Future of Body Measurement in Aesthetic Medicine",
  subtitle: "How advanced scanning technology is revolutionizing treatment planning and results tracking",
  excerpt: "3D body scanning technology offers unparalleled precision in body measurements and treatment tracking. Learn how this innovative technology is transforming aesthetic medicine with objective before-and-after comparisons and enhanced treatment planning.",
  status: "published",
  category_id: "", // This will be set dynamically
  tags: ["3D body scanning", "body measurement", "aesthetic medicine", "treatment planning", "body contouring", "technology", "before and after"],
  meta_keywords: ["3D body scanning", "aesthetic medicine technology", "body measurement", "treatment planning", "before and after comparison", "body contouring assessment", "medical spa technology"]
};

// 3. Helper function to extract the category ID
async function getCategoryId(categoryName) {
  try {
    const response = await fetch('/api/articles/categories');
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const categories = await response.json();
    const category = categories.find(c => 
      c.name.toLowerCase().includes(categoryName.toLowerCase()) || 
      c.slug.toLowerCase().includes(categoryName.toLowerCase())
    );
    
    if (!category) {
      console.error(`Category not found with name: ${categoryName}`);
      return null;
    }
    
    return category.id;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return null;
  }
}

// 4. Function to create article after image upload
async function createArticleWithImage(imagePublicId) {
  try {
    // Get medical spa category ID
    const categoryId = await getCategoryId('medical-spa');
    if (!categoryId) {
      alert('Failed to find the medical-spa category. Please check console for details.');
      return;
    }
    
    // Prepare the article data
    const articleData = {
      ...articleMetadata,
      category_id: categoryId,
      featured_image: imagePublicId,
      content: articleContent
    };
    
    // Create the article
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articleData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const newArticle = await response.json();
    console.log('Article created successfully:', newArticle);
    alert(`Article "${articleData.title}" created successfully!`);
    
    // Refresh the page to show the new article
    window.location.reload();
    
    return newArticle;
  } catch (error) {
    console.error('Error creating article:', error);
    alert(`Failed to create article: ${error.message}`);
    return null;
  }
}

// 5. Instructions for manual execution
console.log(`
To create the 3D Body Scanning article:

1. Go to the admin/media page and upload the 3D body scanning image using CloudinaryUploader
   - Use the area "article"
   - Use the folder "articles/technology"
   - Add tags: "3D-scanning", "technology", "body-measurement"

2. Once the image is uploaded, copy the publicId of the image

3. Then, come back to the admin/articles page and run the following in the console:
   createArticleWithImage("PASTE_PUBLIC_ID_HERE");

4. The article will be created and the page will refresh to show it in the list
`); 