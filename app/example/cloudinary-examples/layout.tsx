import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cloudinary Examples - next-cloudinary migration',
  description: 'Examples of using next-cloudinary components with custom wrappers',
};

export default function CloudinaryExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 