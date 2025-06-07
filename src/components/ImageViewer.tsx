
import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImageViewerProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

const ImageViewer = ({ src, alt, children }: ImageViewerProps) => {
  const isMobile = useIsMobile();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] w-full h-[90vh]' : 'max-w-[90vw] max-h-[90vh] w-auto h-auto'} p-0`}>
        <div className={`relative w-full h-full flex items-center justify-center bg-black ${isMobile ? '' : 'min-h-[60vh]'}`}>
          <img
            src={src}
            alt={alt}
            className={`${isMobile ? 'max-w-full max-h-full' : 'max-w-[85vw] max-h-[85vh]'} object-contain`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
