export default function StructuredData({ type, data }: { type: string; data: Record<string, any> }) {
const structuredData = {
'@context': 'https://schema.org',
'@type': type,
...data,
};

return (
<script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html: JSON.stringify(structuredData),
}}
/>
);
}