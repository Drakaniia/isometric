import type { Metadata } from 'next';
import { library, byId } from '@kit';

export const dynamicParams = false;

export function generateStaticParams() {
  return library.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const d = byId(id);
  return d ? { title: d.name, description: d.description } : {};
}

/** The gallery layout reads the id from the path and opens the drawing. */
export default function DrawingPage() {
  return null;
}
