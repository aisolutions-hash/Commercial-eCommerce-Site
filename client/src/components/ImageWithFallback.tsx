import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  fallbackIconClassName?: string;
  src?: string;
  alt?: string;
  className?: string;
}

export default function ImageWithFallback({ 
  containerClassName, 
  fallbackIconClassName,
  className,
  src,
  alt,
  ...props 
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted flex items-center justify-center", containerClassName)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-sm z-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground z-10">
          <ImageIcon className={cn("w-8 h-8 mb-2 opacity-30", fallbackIconClassName)} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn("transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100", className)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          {...props}
        />
      )}
    </div>
  );
}
