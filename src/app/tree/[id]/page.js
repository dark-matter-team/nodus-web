import TreeViewer from '@/components/TreeViewer';

export default async function TreePage({ params }) {
  const { id } = await params;

  return (
    <main>
      <TreeViewer roadmapId={id} />
    </main>
  );
}