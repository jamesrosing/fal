import VisualMediaManager from '@/components/VisualMediaManager';
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';


export const metadata = {
  title: 'Visual Media Editor - Admin',
  description: 'Easily manage media on your website without code',
};

export default function VisualEditorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <VisualMediaManager />
    </div>
  );
} 