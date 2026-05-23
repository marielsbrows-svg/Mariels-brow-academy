import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageWithFallback = ({ src, alt, className = '' }: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`bg-linen flex items-center justify-center ${className}`}>
        <div className="text-mocha-dark text-sm">{alt}</div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};
