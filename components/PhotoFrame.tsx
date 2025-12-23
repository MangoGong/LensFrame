import React, { useEffect, useState } from 'react';
import { ExifData, FrameSettings } from '../types';
import { generateFinalImage } from '../utils/canvasGenerator';

interface PhotoFrameProps {
  imageSrc: string; // The original uploaded image
  exif: ExifData;
  settings: FrameSettings;
}

const PhotoFrame: React.FC<PhotoFrameProps> = ({ imageSrc, exif, settings }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Debounce the generation to avoid lagging on slider changes
  useEffect(() => {
    const generate = async () => {
        setIsGenerating(true);
        try {
            // Generate a preview. In a real app we might downscale the input image first for speed
            // but for now, the canvas generator handles it reasonably fast for standard photos.
            const url = await generateFinalImage(null, imageSrc, exif, settings);
            setPreviewUrl(url);
        } catch (e) {
            console.error("Preview generation failed", e);
        } finally {
            setIsGenerating(false);
        }
    };

    const timeout = setTimeout(generate, 50); // 50ms debounce

    return () => clearTimeout(timeout);
  }, [imageSrc, exif, settings]); // Re-run when any data changes

  if (!previewUrl && !imageSrc) return null;

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div className={`relative transition-opacity duration-200 ${isGenerating ? 'opacity-90' : 'opacity-100'} shadow-2xl`}>
            {previewUrl ? (
                <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-[80vh] w-auto h-auto rounded-sm object-contain"
                />
            ) : (
                <div className="flex items-center justify-center p-20 text-white">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    </div>
  );
};

export default PhotoFrame;