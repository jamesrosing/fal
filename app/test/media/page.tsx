import { createClient } from '@/lib/supabase';
import UnifiedImage from '@/components/media/UnifiedImage';

async function getMediaPlaceholders() {
  const supabase = createClient();
  const { data } = await supabase
    .from('unified_media_placeholders')
    .select(`
      *,
      unified_media_mappings(
        *,
        media_assets(*)
      )
    `)
    .limit(10);
    
  return data || [];
}

export default async function TestMediaPage() {
  const placeholders = await getMediaPlaceholders();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Media System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placeholders.map(placeholder => (
          <div key={placeholder.id} className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">{placeholder.name}</h2>
            <p className="text-gray-500 mb-4">{placeholder.description || 'No description'}</p>
            
            {placeholder.unified_media_mappings && placeholder.unified_media_mappings.length > 0 ? (
              <div>
                <UnifiedImage
                  placeholderId={placeholder.name}
                  width={300}
                  height={200}
                  className="rounded"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Asset ID: {placeholder.unified_media_mappings[0].media_assets.id.substring(0, 8)}...
                </p>
              </div>
            ) : (
              <p className="text-amber-500">No media assigned</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 