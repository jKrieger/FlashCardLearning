import { useEffect } from 'react';

const BASE_TITLE = 'Karteikarten';

export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
