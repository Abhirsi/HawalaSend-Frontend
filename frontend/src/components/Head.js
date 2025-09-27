import { useEffect } from 'react';

export default function Head({ title, description }) {
  useEffect(() => {
    document.title = title || 'HawalaSend';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (description && metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}