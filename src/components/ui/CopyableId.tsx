import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CopyableIdProps {
  value?: string | null;
  className?: string;
}

/**
 * Monospace identifier (e.g. SAMKIEL ID) that copies to the clipboard on click.
 * Stops event propagation so it works inside clickable table rows.
 */
export function CopyableId({ value, className }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  if (!value) return <span className="text-secondary">—</span>;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy"
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-xs text-secondary hover:text-accent transition-colors',
        className,
      )}
    >
      {value}
      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}
