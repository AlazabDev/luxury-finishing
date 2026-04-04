import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

const LazyImage = ({ src, alt, className, placeholderClassName, ...props }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", placeholderClassName)}>
      {/* Static placeholder — no pulse */}
      <div
        className={cn(
          "absolute inset-0 bg-muted transition-opacity duration-500",
          loaded ? "opacity-0" : "opacity-100"
        )}
      />
      {inView && (
        <img
          src={src}
          alt={alt}
          className={cn("transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0", className)}
          onLoad={() => setLoaded(true)}
          loading={props.loading ?? "lazy"}
          decoding={props.decoding ?? "async"}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
