# 📚 Next.js Web Application with Supabase & Cloudinary 

A modern, mobile-first, flat-design, SEO-optimized web application built with the latest Next.js (app router), Supabase, TailwindCSS, Framer Motion, and Cloudinary. Designed for dynamic image organization, advanced filtering, and efficient management of various medical Articles, as well as Galleries, Albums, Cases, and Images. Modern LLM trained chatbot for answering both general medical questions and specific queries pertaining to our practice and task completion, e.g., scheduling appointments. Users may create profiles where they can then schedule appointments, see appointment history, receive invitations to exclusive events and communicate vis chat with providers. 

## 🚀 Project Overview

### Goal
Build a web app focused on:

- Speed & Scalability
- SEO Optimization
- Seamless Mobile Experience
- Efficient Image Delivery via Cloudinary
- Metadata Management in Supabase
- A cutting-edge chatbot powered by a modern **Large Language Model (LLM)**
- Users can:
    - Read articles
    - Watch videos
    - View a gallery of images and video content
    - Bookmark content
    - Learn about the medical practice and provider details
    - Create a profile by logging in with:
        - First name
        - Last name
        - Email
        - Cell phone number
        - Password

### Key Features
- 📱 Mobile-First Design
- 🎨 Flat, Modern UI
- 📈 SEO Optimization: Includes meta tags, sitemap, and structured data.
- 📊 Dynamic Organization: Galleries → Albums → Cases → Images
- 🏷️ Tagging & Filtering System
- 🖼️ Bulk Image Uploads
- 🛡️ Admin Dashboard: Manage Galleries, Albums, Cases, and Images.
- 🚀 Fast Load Times with Cloudinary Image CDN
- Secure Auth System: Powered by Supabase Authentication.
- A cutting-edge chatbot powered by a modern **Large Language Model (LLM)**

## Feature Requirements

### Modern LLM-Trained Chatbot

#### Overview
A cutting-edge chatbot powered by a modern **Large Language Model (LLM)** designed to:
- Answer **general medical questions**.
- Handle **specific queries** related to:
  - Our practice.
  - Task completion (e.g., scheduling appointments).

#### Features
##### User Functionality
1. **Profile Creation**:
   - Users can create personalized profiles to access advanced features.

2. **Appointment Management**:
   - Schedule appointments directly through the chatbot.
   - View and manage **appointment history**.

3. **Exclusive Invitations**:
   - Receive personalized invitations to **exclusive events** hosted by our practice.

4. **Provider Communication**:
   - Chat with providers in real-time for:
     - Medical advice.
     - Updates on treatment plans.
     - General queries.

#### Benefits
- **Convenience**: Users can manage their healthcare interactions seamlessly.
- **Efficiency**: Automated scheduling and direct communication reduce wait times.
- **Personalized Experience**: Tailored responses and event invitations enhance user engagement.

This chatbot integrates modern LLM capabilities with practice-specific functionalities to provide a streamlined, user-friendly experience.


### Articles
- **Display Format**:
  - Articles are displayed in a **scrollable list format**.
  - Each article includes:
    - An image or short video at the top.
    - An engaging title.
    - A four-line brief snippet of the article.

- **Design and Layout**:
  - Article cards must match the layouts shown in:
    - `public/screenshots/header.png`
    - `public/screenshots/fonts.png`
    - `public/screenshots/home.png`
  - Fonts for titles and snippets should align with `public/screenshots/fonts.png` in terms of:
    - Font family
    - Font weight
    - Font size
  - A **consistent color palette** must be implemented.

- **Categorization**:
  - Articles are grouped into four main categories:
    - Plastic surgery
    - Dermatology
    - Medical spa
    - Functional medicine

- **Accessibility**:
  - Users can listen to articles via **text-to-speech** by clicking an audio icon.

#### Header
- **Examples**:
  - Reference `public/screenshots/header.png` for the general header design.
  - Reference `public/screenshots/header-with-section-menu-toggled.png` for the toggled navigation menu (hamburger icon).
- **Features**:
  - A **search icon** is available to open a search screen for finding articles, videos, images, and content.
  - Header design is consistent across all pages and screens.

#### Responsive Design
- **Mobile vs Desktop**:
  - On desktop:
    - Article images/videos are displayed on the right.
    - Titles and snippets are displayed on the left (split 50/50 layout).
  - On mobile:
    - Articles are presented in a vertically stacked layout.

### Gallery
- The gallery page integrates a beautiful, organized, mobile first, fast, gallery structure.
- Galleries are collections categorized by themes such as:
  - Plastic Surgery
  - Emsculpt
  - Injections
  - SylfirmX
  - Facials
- Dynamic routes include:
  - `/gallery/[id]/`: Displays a specific gallery collection.
  - `/album/[id]/`: Displays albums within a gallery collection.
  - `/case/[id]/`: Displays specific cases within an album.
- Admin features:
  - Dashboard for managing galleries, albums, and cases.
  - Upload page to add new images and content.
  - Settings page for configuration options.
  - CRUD APIs for galleries, albums, cases, and images.

### Admin Features
#### Login Screen
- Form includes:
  - Username field
  - Password field
- Buttons:
  - Submit button
  - "Forgot password" link
- Displays an error message if credentials are incorrect.
- **Successful login** redirects to the admin dashboard.

#### Dashboard
- **Tabs**:
  - Articles
  - Analytics
  - Media Library
  - Gallery
  - Marketing
  - User Data

- **Articles Tab**:
  - Displays a **grid of articles** with sorting and filtering options by:
    - Category
    - Tags
    - Keywords
  - Includes a **chat interface** for an AI content writer (reference `public/screenshots/chat-interface.png`) that allows:
    - Entering article ideas.
    - Finding relevant images or video clips.
    - Creating internal and external content links.
    - Receiving and refining article outlines.
    - Saving drafts and publishing final articles.

- **Analytics Tab**:
  - Displays detailed analytics data for the web application.

- **Media Library Tab**:
  - Provides a **grid view** of all images and videos.
  - Offers advanced search and filtering options.
  - UI is inspired by **Adobe Lightroom**.

- **Gallery Tab**:
  - Displays a **grid of collections** (e.g., plastic surgery, dermatology).
  - Each collection contains albums for individual procedure types (e.g., face, neck, ears, nose, eyelids, breast augmentation, breast lift, abdominoplasty, liposuction, etc.).
  - Each album contains **cases**, which include:
    - Cropped, side-by-side before-and-after images (typically 5 per case).
  - Allows admins to:
    - Edit, upload, delete, and manage images/videos.
    - Create and organize collections and albums.

- **Marketing Tab**:
  - Features tabs for managing:
    - Email campaigns
    - SMS campaigns
    - Social media campaigns
  - **Email Campaigns**:
    - View previous campaigns with relevant data.
    - Create, manage, and schedule new campaigns.
  - **SMS Campaigns**:
    - View previous SMS campaigns with relevant data.
    - Create, manage, and schedule new campaigns.
  - **Social Media Campaigns**:
    - Login interface for Instagram to manage content.
    - Tools include:
      - Content editor for creating/managing posts.
      - Content calendar for scheduling.
      - Insights tab for performance analytics.
  - AI chat integration:
    - Assists with content creation.
    - Provides scheduling suggestions based on analytics.

- **User Data Tab**:
  - Displays a grid of all users.
  - Allows admins to:
    - Edit, create, delete, categorize, tag, and publish user profiles.

### Standard User Features
#### Login Screen
- Form includes:
  - Username field
  - Password field
- Buttons:
  - Submit button
  - "Forgot password" link
- Displays an error message if credentials are incorrect.

#### Standard User Features
- **Login Screen**:
  - Form fields for username and password.
  - Submit button.
  - Error message displayed for incorrect credentials.
  - "Forgot password" link as a button.
- View and manage:
  - Bookmarked articles, videos, images, and content.
  - Profile page.
  - Appointment history.
- Book appointments.

### Public Access
- Public users can access:
  - Homepage articles.
  - Limited gallery videos/images.
  - Contact, About, Services, Providers, and Medical Practice pages.
  - Login, Signup, and Forgot Password pages.
- Other features/pages are restricted to logged-in users.

## Theming
- **Theme**: Modern, flat, and minimalistic.
- **Color Palette**: 
  - Shadcn/ui gray palette (see documentation at [shadcn/ui colors](https://ui.shadcn.com/colors)).
  - Refer to `public/screenshots/colors.png` for examples.
- **Typography**: Modern, flat, and minimalistic.

## 🛠️ Tech Stack

### Frontend:
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + Radix UI Components
- **Animations**: Framer Motion
- **SEO**: Next.js Metadata API
- **Image Optimization**: Cloudinary Image Delivery via CDN

### Backend / Database:
- **CMS & Database**: Supabase
- **Authentication**: Supabase Auth
- **Chatbot Integration**: OpenAI-powered LLM chatbot for real-time communication and task automation.
- **AI Features**:
  - **AI-Based Image Tagging**: Automatically categorize and tag images in the media library for efficient management and search.
  - **AI Treatment Recommendations**: Generate personalized treatment plans for users based on profile data and medical history.
  - **AI Image Transformation**: Allow users to:
    - Upload a photo.
    - Use interactive controls to simulate potential outcomes of procedures offered by the practice.

### Deployment:
- **Platform**: Vercel
- **CDN**: Cloudinary for image delivery

### Integration Support:
- **APIs**: RESTful APIs with Next.js API Routes
- **Custom Hooks**: Reusable hooks for data fetching
- **LLM Chatbot**: Integrated OpenAI API for handling user queries, profile management, appointment scheduling, and event invitations.
- **AI Services**: Cloud-based APIs for image tagging, treatment recommendations, and photo transformations.


## 📂 Project Structure

```plaintext
allure-md/
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── articles/
│   │   ├── [category]/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── gallery/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── album/[id]/
│   │   │   └── page.tsx
│   │   ├── case/[id]/
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── medical-practice/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── providers/
│   │   └── page.tsx
│   ├── search/
│   │   └── page.tsx
│   ├── services/
│   │   ├── dermatology/
│   │   │   └── page.tsx
│   │   ├── functional-medicine/
│   │   │   └── page.tsx
│   │   ├── medical-spa/
│   │   │   └── page.tsx
│   │   └── plastic-surgery/
│   │       └── page.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   │   ├── Analytics.tsx
│   │   ├── ArticleManagement.tsx
│   │   └── MediaManagement.tsx
│   ├── Gallery/
│   │   ├── GalleryItem.tsx
│   │   ├── GalleryGrid.tsx
│   │   ├── AlbumGrid.tsx
│   │   ├── CaseGrid.tsx
│   │   ├── ImageGrid.tsx
│   ├── Admin/
│   │   ├── ImageUploadForm.tsx
│   │   ├── ImageManager.tsx
│   │   └── Filter.tsx
│   ├── UI/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   ├── Sidebar/
│   │   ├── AppSidebar.tsx
│   │   ├── NavMain.tsx
│   │   ├── NavGalleries.tsx
│   │   ├── NavUser.tsx
│   │   ├── TeamSwitcher.tsx
├── lib/
│   ├── database.types.ts
│   ├── supabase.ts
│   ├── cloudinary.ts
│   ├── imageUtils.ts
│   └── seo.ts
├── public/
│   ├── images/
│   ├── videos/
│   └── screenshots/
│       ├── header.png
│       └── header-with-section-menu-toggled.png
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
├── .env.local
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
## 🗂️ Database Schema

### 1. Gallery (collection)
- id: Unique identifier
- title: Gallery name (e.g., plastic surgery, emsculpt, sylfirmX, facials)
- description: Description of the gallery collection
- created_at: Timestamp

### 2. Album
- id: Unique identifier
- gallery_id: Reference to a gallery
- title: Album name (e.g., gallery plastic surgery album names: eyelids, ears, face, neck, nose, breast-augmentation, breast-lift, breast-reduction, breast-revision, breast-nipple-areolar-complex, abdominoplasty, mini-abdominoplasty, liposuction, arm-lift, thigh-lift. gallery emsculpt album names: abdomen, buttocks, arms, calves)
- description: Description of the album
- created_at: Timestamp

### 3. Case
- id: Unique identifier
- album_id: Reference to an album
- title: Case number (e.g., 1, 2, 3, 4, 5)
- description: Procedure description
- metadata: JSON metadata (e.g., procedure type, surgeon name, details)
- created_at: Timestamp

### 4. Image
- id: Unique identifier
- case_id: Reference to a case
- cloudinary_url: Direct Cloudinary URL to the image
- caption: Image description
- tags: Array (e.g., gallery name, album name, case number)
- created_at: Timestamp

## 🔑 Authentication
- Admin authentication via Supabase Auth.
- Admin Dashboard is secured and requires login.

### Admin Features:
- Create/Edit/Delete Galleries
- Add/Edit/Delete Albums
- Manage Cases
- Bulk Image Upload
- Tag and Organize Images

## 🖥 Cloudinary Organization

### Folder Structure
```plaintext
gallery/
├── collection-name (e.g., plastic-surgery)/
│   ├── album-name (e.g., face)/
│   │   ├── case-number (e.g., 1)/
│   │   │   ├── results-1.jpg  # First image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   │   │   ├── results-2.jpg  # Second image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   │   │   ├── results-3.jpg  # Third image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   │   │   ├── results-4.jpg  # Fourth image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   │   │   └── results-5.jpg  # Fifth image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   │   └── case-number (e.g., 2)/
│   │       ├── results-1.jpg  # First image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   │   │   ├── results-2.jpg  # Second image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   │   │   ├── results-3.jpg  # Third image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   │   │   ├── results-4.jpg  # Fourth image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   │   │   └── results-5.jpg  # Fifth image in sequence where each before-after-image is a composite of before and after cropped side-by-side.
│   └── album-name (e.g., breast-augmentation)/
│       └── ...
├── collection-name (e.g., emsculpt)/
│   └── ...
├── collection-name (e.g., facials)/
│   └── ...
└── collection-name (e.g., sylfirm)/
    └── ...
```

### Image Metadata Structure
Each image should have the following custom metadata in Cloudinary:
```json
{
  "custom": {
    "collection": "Collection name",
    "album": "Album name",
    "case_number": "1",
    "sequence": "results-1, results-2"  // results-1 through results-5, representing single image files of a composite before-after cropped side-by-side
  }
}
```

### Naming Convention
- Collections: `collection-{name}`
- Albums: `album-{name}`
- Cases: `case-{number}`
- Images: `results-{1-5}`

## 🖥️ How to Set Up Locally

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/gallery-app.git
cd gallery-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create .env.local:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

### 4. Initialize TailwindCSS
```bash
npx tailwindcss init -p
```

Update tailwind.config.ts:
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};
export default config;
```

### 5. Start the Development Server
```bash
npm run dev
```
Visit http://localhost:3000.

## 🔧 API Routes

### 1. Fetch Metadata by Case
app/api/metadata/[caseId]/route.ts:
```ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { caseId } = Object.fromEntries(new URL(req.url).searchParams);

  const { data, error } = await supabase
    .from('cases')
    .select('metadata')
    .eq('id', caseId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ metadata: data });
}
```

### 2. Render Images via Cloudinary
Images are delivered directly using Cloudinary URLs specified in the database: (changing this to use public ID)
```tsx
<Image
  src="https://res.cloudinary.com/your_cloudinary_account/image/upload/v12345/sample.jpg"
  alt="Example Image"
  width={400}
  height={300}
/>
```

## 🛡️ Admin Dashboard
- Create/Edit/Delete Galleries
- Add/Edit/Delete Albums
- Manage Cases
- Bulk Upload Images to Cloudinary
- Store Metadata in Supabase

## 📊 SEO Checklist
- Dynamic meta tags
- Alt attributes for every image
- JSON-LD structured data
- Canonical URLs
- Sitemap generation

## 🚀 Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel Dashboard
4. Deploy

## 📝 Future Enhancements
- Advanced Search Functionality
- AI-based Image Tagging
- Role-Based Access Control

## Rules

### Components
- Add new components to `/components`.
- Name components following the format: `example-component.tsx` (unless otherwise specified).

### Pages
- Add new pages to `/app/page.tsx` (unless otherwise specified).

### API
- Add new API routes and handlers to `/app/api/route.ts`.
- Name API handlers following the format: `example-handler.ts` (unless otherwise specified).

## Advanced Features

### AI Integration
- Use **Vercel AI SDK** for streaming chat interfaces.
- Handle rate limiting, errors, and model fallbacks gracefully.
- Store sensitive information in **environment variables**.

---

### Next Cloudinary Implementation
1. **Recursive Fetching**: Use the Cloudinary Admin API to list folders and subfolders.
2. **API Route**: Create an API at `app/api/cloudinary/fetch-assets/route.js` to fetch assets recursively.

```javascript
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

async function fetchFolderAssets(folderPath = '') {
  const assets = [];
  const resources = await cloudinary.api.resources({ type: 'upload', prefix: folderPath });
  assets.push(...resources.resources);

  const subfolders = await cloudinary.api.sub_folders(folderPath);
  for (const subfolder of subfolders.folders) {
    const subfolderAssets = await fetchFolderAssets(subfolder.path);
    assets.push(...subfolderAssets);
  }
  return assets;
}

export async function GET(request) {
  const folderPath = new URL(request.url).searchParams.get('folder') || '';
  try {
    const assets = await fetchFolderAssets(folderPath);
    return NextResponse.json({ success: true, assets });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch assets' }, { status: 500 });
  }
}
## React Server Component

### Fetch and Display Assets in a React Server Component
Use React Server Components (RSC) to fetch data from your API route and pass it to a client component for rendering.

### Advanced Next Cloudinary Features
#### Front-End Application Integration

In the front-end application, refactor the existing media display components to fetch the media public IDs from Supabase based on placeholder IDs, either at build time using static generation, at runtime using server-side rendering, or client-side fetching, depending on your needs. For example:
- For images:
  ```jsx
  "use client";
  import { CldImage } from 'next-cloudinary';
  import { getMediaById } from '../utils/database';

  const HeroSection = async ({ placeholderId }) => {
    const mediaId = await getMediaById(placeholderId); // Fetch from Supabase
    return <CldImage src={mediaId} width={1200} height={600} alt="Hero Image" />;
  };
  ```
- For videos:
  ```jsx
  import { CldVideo } from 'next-cloudinary';

  const VideoSection = async ({ placeholderId }) => {
    const mediaId = await getMediaById(placeholderId);
    return <CldVideo src={mediaId} width={800} height={450} />;
  };
  ```

For efficiency, consider fetching all mappings at once using a function like `getMediaMappings()` that returns an object with all placeholder IDs as keys and their corresponding media public IDs as values:
```tsx
import { getMediaMappings } from '../utils/database';

export default async function Home() {
  const mappings = await getMediaMappings();
  const heroImageId = mappings['home-hero-image'];
  const backgroundImageId = mappings['home-background-image'];

  return (
    <div>
      <CldImage src={heroImageId} width={1200} height={600} alt="Hero Image" />
      <CldImage src={backgroundImageId} width={1200} height={600} alt="Background Image" />
    </div>
  );
}
```

This reduces the number of database queries and improves performance, especially for pages with multiple media placeholders. Ensure the components are in client components if they require client-side rendering, and consider responsive sizing with the `sizes` prop for images to adapt to different screen widths.

#### Advanced Considerations

While the basic setup covers most needs, consider:
- **Validation:** Ensure media types match placeholder expectations (e.g., only images for image placeholders). Store media type in Supabase and validate during assignment.
- **Transformations:** Allow specifying transformations (e.g., cropping, resizing) for each placeholder in the configuration, stored in Supabase. Use these in `CldImage` or `CldVideo` props, e.g., `<CldImage src={mediaId} width={400} height={300} crop="fill" />`.
- **Performance:** Leverage Cloudinary's CDN for media delivery, reducing latency by serving assets from the closest server to the user. Use lazy loading for images and videos to improve page load times.
- **Security:** For uploads, use signed URLs if needed, ensuring `CldUploadButton` or `CldUploadWidget` is configured with appropriate presets and credentials, kept secure on the server side.
- **User Experience:** Enhance the admin interface with search functionality to find specific placeholders or media, and provide previews of media assignments to avoid errors.
---








## Testing and Deployment

### Testing
- **Unit Tests**: Test utility functions and custom hooks.
- **Integration Tests**: Validate the behavior of complex components.
- **End-to-End Tests**: Ensure critical user flows work seamlessly.

### Performance Optimization
- Use **Lighthouse** to measure and improve key metrics:  
  - Largest Contentful Paint (LCP)  
  - Cumulative Layout Shift (CLS)  
  - First Input Delay (FID)
- Deploy on **Vercel** with caching strategies for improved scalability.

---

## Accessibility

- Ensure interfaces are **keyboard navigable**.
- Use **semantic HTML** for structure.
- Add **ARIA labels** and maintain **WCAG-compliant** color contrast ratios.

