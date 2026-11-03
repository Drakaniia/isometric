import Gallery from '@/components/gallery/Gallery';

/** The gallery persists across /gallery/ and /gallery/[id]/ so opening a drawing never reloads the grid. */
export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="main">
      <Gallery />
      {children}
    </div>
  );
}
