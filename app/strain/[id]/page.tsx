import StrainPageClient from './StrainPageClient';

interface StrainPageProps {
  params: Promise<{ id: string }>;
}

// Required for static export with dynamic routes
// Returns a placeholder that will be used for all IDs
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default async function StrainPage({ params }: StrainPageProps) {
  const { id } = await params;
  return <StrainPageClient id={id} />;
}
