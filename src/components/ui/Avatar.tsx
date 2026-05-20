import { useState, useEffect } from 'react';

interface AvatarProps {
  /** Avatar image URL (e.g. a Google profile photo or Cloudinary upload). */
  src?: string | null;
  /** Used for the initials fallback and img alt text. */
  name?: string;
  /** Sizing/positioning classes for the outer circle (e.g. "w-8 h-8"). */
  className?: string;
  /** Classes applied to the initials fallback text (e.g. "text-2xl font-bold text-accent"). */
  textClassName?: string;
}

/**
 * Round avatar that renders the user's photo when available and falls back to
 * their first initial otherwise. `referrerPolicy="no-referrer"` is important for
 * Google-hosted photos (lh3.googleusercontent.com), which 403 hotlink requests
 * that carry a referrer. Broken/blocked images fall back to the initial too.
 */
export function Avatar({ src, name, className = '', textClassName = '' }: AvatarProps) {
  const [broken, setBroken] = useState(false);

  // Reset the error state if the source changes (e.g. list re-renders).
  useEffect(() => {
    setBroken(false);
  }, [src]);

  const initial = name?.trim()?.[0]?.toUpperCase() || 'U';
  const showImage = Boolean(src) && !broken;

  return (
    <div
      className={`shrink-0 rounded-full bg-base border border-border-color overflow-hidden flex items-center justify-center ${className}`}
    >
      {showImage ? (
        <img
          src={src as string}
          alt={name || 'User avatar'}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={textClassName}>{initial}</span>
      )}
    </div>
  );
}
