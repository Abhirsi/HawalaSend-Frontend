import { useEffect } from 'react';

export default function Head({ title, description }) {
  useEffect(() => {
    document.title = title || 'Your App Name';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (description && metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}