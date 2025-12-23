import { ExifData, FrameSettings, SUPPORTED_BRANDS } from '../types';
import { getBrandFromMake } from './exifHelper';
import { LOGO_SVGS } from '../constants';

const loadLogo = async (brand: string, color: string): Promise<HTMLImageElement> => {
    let svgString = LOGO_SVGS[brand] || LOGO_SVGS['Generic'];
    
    // Replace placeholder with color for monochrome logos
    svgString = svgString.replace(/{{FILL}}/g, color);
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
            URL.revokeObjectURL(url); // Clean up
        };
        img.onerror = reject;
        img.src = url;
    });
};

export const generateFinalImage = async (
  imageFile: File | null, 
  imageSrc: string,
  exif: ExifData,
  settings: FrameSettings
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false }); // Optimizes for opaque
      if (!ctx) {
        reject('No context');
        return;
      }

      const originalWidth = img.width;
      const originalHeight = img.height;
      const bottomBarHeight = Math.round(originalHeight * (settings.padding / 100)); 
      
      canvas.width = originalWidth;
      canvas.height = originalHeight + bottomBarHeight;

      // --- Draw Background ---
      
      if (settings.frameStyle === 'glass') {
          // Glass Effect:
          // 1. Draw the main image normally
          ctx.drawImage(img, 0, 0);
          
          // 2. Create the "Glass" bottom bar
          // We take the bottom slice of the original image, mirror it vertically (reflection effect), 
          // or just clamp stretch it, then blur it.
          // A nice effect is to take the bottom-most part of the image and scale it up into the bar area with heavy blur.
          
          const sourceY = originalHeight - bottomBarHeight;
          const sourceH = bottomBarHeight;
          
          // Save state for clipping/filtering
          ctx.save();
          
          // We draw the bottom slice of the image into the footer area
          // To make it look like "Glass" over a background, we actually fill the footer with a blurred version of the image's bottom
          
          // Option A: Just extend the image pixels down (Clamp style) then blur
          // Option B: Reflection style (flip vertically)
          
          // Let's use a "Zoomed Blur" of the bottom area to create a nice abstract background
          ctx.filter = `blur(${settings.blurStrength}px)`;
          
          // Draw the bottom 10% of the image stretched into the footer
          // We use a safe crop from the bottom
          const cropH = Math.min(originalHeight * 0.15, originalHeight); 
          
          // Draw into the footer area
          ctx.drawImage(img, 
              0, originalHeight - cropH, originalWidth, cropH, // Source: Bottom strip
              0, originalHeight, originalWidth, bottomBarHeight // Dest: Footer
          );
          
          ctx.restore(); // Remove blur for subsequent operations
          
          // 3. Add Tint Overlay
          ctx.fillStyle = settings.frameColor; // Expecting rgba or hex
          // If frameColor is hex, we need to apply opacity. 
          // Actually, let's assume frameColor is just the base color (black/white) and we apply opacity.
          ctx.globalAlpha = settings.glassOpacity / 100;
          ctx.fillRect(0, originalHeight, originalWidth, bottomBarHeight);
          ctx.globalAlpha = 1.0;
          
      } else {
          // Solid Color
          ctx.fillStyle = settings.frameColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
      }

      // --- Draw Text & Graphics ---
      
      const footerY = originalHeight;
      const marginX = originalWidth * 0.04;
      const centerY = footerY + (bottomBarHeight / 2);
      
      const fontSizeLarge = bottomBarHeight * 0.35;
      const fontSizeSmall = bottomBarHeight * 0.22;
      
      ctx.fillStyle = settings.textColor;
      ctx.textBaseline = 'middle';
      
      // Calculate font weights based on standard Inter
      const fontBold = `600 ${fontSizeLarge}px 'Inter', sans-serif`;
      const fontRegular = `400 ${fontSizeSmall}px 'Inter', sans-serif`;
      const fontMono = `500 ${fontSizeSmall}px 'JetBrains Mono', 'Inter', monospace`;
      
      // --- LEFT SIDE ---
      let leftCursorY = centerY;
      
      if (settings.showModel) {
        const text = settings.customModel || exif.model;
        ctx.font = fontBold;
        ctx.textAlign = 'left';
        
        if (settings.showDate) {
            leftCursorY = centerY - (fontSizeSmall * 0.7);
        }
        
        ctx.fillText(text, marginX, leftCursorY);
        
        if (settings.showLens && (settings.customLens || exif.lens)) {
             const modelWidth = ctx.measureText(text).width;
             const lensText = ` | ${settings.customLens || exif.lens}`;
             
             ctx.font = `400 ${fontSizeLarge}px 'Inter', sans-serif`;
             ctx.fillStyle = settings.textColor; // Could be dimmer?
             ctx.globalAlpha = 0.8;
             ctx.fillText(lensText, marginX + modelWidth, leftCursorY);
             ctx.globalAlpha = 1.0;
        }
      }
      
      if (settings.showDate) {
        const dateText = settings.customDateTime || exif.dateTime;
        ctx.font = fontRegular;
        ctx.fillStyle = settings.textColor;
        ctx.globalAlpha = 0.6;
        const dateY = settings.showModel ? centerY + (fontSizeLarge * 0.6) : centerY;
        ctx.fillText(dateText, marginX, dateY);
        ctx.globalAlpha = 1.0;
      }

      // --- RIGHT SIDE ---
      const rightEdge = canvas.width - marginX;
      let rightCursorY = centerY;
      
      // 1. Calculate Specs Text
      let specs = "";
      if (settings.showTechSpecs) {
          const focal = settings.customFocalLength || exif.focalLength;
          const ap = settings.customAperture || exif.aperture;
          const shutter = settings.customShutterSpeed || exif.shutterSpeed;
          const iso = settings.customIso || exif.iso;
          specs = `${focal} ${ap} ${shutter} ${iso}`.trim();
      }
      
      // 2. Measure widths to position logo
      ctx.font = `600 ${fontSizeLarge}px 'JetBrains Mono', 'Inter', monospace`; // Use Mono for specs
      const specsWidth = ctx.measureText(specs).width;
      
      ctx.font = fontRegular;
      const gpsText = settings.customGps || exif.gps;
      const gpsWidth = ctx.measureText(gpsText).width;
      
      const maxTextWidth = Math.max(specsWidth, gpsWidth);
      
      // 3. Draw Specs
      if (settings.showTechSpecs) {
          if (settings.showGps) rightCursorY = centerY - (fontSizeSmall * 0.7);
          
          ctx.font = `600 ${fontSizeLarge}px 'JetBrains Mono', 'Inter', monospace`;
          ctx.fillStyle = settings.textColor;
          ctx.textAlign = 'right';
          ctx.fillText(specs, rightEdge, rightCursorY);
      }
      
      if (settings.showGps) {
          const gpsY = settings.showTechSpecs ? centerY + (fontSizeLarge * 0.6) : centerY;
          ctx.font = fontRegular;
          ctx.fillStyle = settings.textColor;
          ctx.globalAlpha = 0.6;
          ctx.textAlign = 'right';
          ctx.fillText(gpsText, rightEdge, gpsY);
          ctx.globalAlpha = 1.0;
      }

      // --- LOGO ---
      if (settings.showLogo) {
          const logoBrand = settings.selectedBrand === 'Auto' ? getBrandFromMake(exif.make) : settings.selectedBrand;
          const logoImg = await loadLogo(logoBrand, settings.textColor);
          
          // Logo sizing
          // Maintain aspect ratio
          const logoAspect = logoImg.width / logoImg.height;
          const targetHeight = bottomBarHeight * 0.5; // 50% of bar height
          const targetWidth = targetHeight * logoAspect;
          
          // Position: Left of the specs block
          const spacing = bottomBarHeight * 0.4;
          const dividerSpacing = bottomBarHeight * 0.4;
          
          // X Position logic: RightEdge - TextWidth - Divider - Spacing - LogoWidth
          const textBlockWidth = maxTextWidth > 0 ? maxTextWidth + spacing : 0;
          
          // Divider logic
          // Only draw divider if we have text on the right
          let dividerX = 0;
          if (textBlockWidth > 0) {
              dividerX = rightEdge - textBlockWidth;
              
              ctx.beginPath();
              ctx.moveTo(dividerX, centerY - (targetHeight * 0.6));
              ctx.lineTo(dividerX, centerY + (targetHeight * 0.6));
              ctx.lineWidth = 1.5; // px, maybe scale this?
              // Scale line width
              ctx.lineWidth = Math.max(1, originalHeight * 0.0015);
              ctx.strokeStyle = settings.textColor;
              ctx.globalAlpha = 0.3;
              ctx.stroke();
              ctx.globalAlpha = 1.0;
          }
          
          // Logo X
          const logoX = textBlockWidth > 0 
              ? dividerX - dividerSpacing - targetWidth
              : rightEdge - targetWidth;
              
          const logoY = centerY - (targetHeight / 2);
          
          ctx.drawImage(logoImg, logoX, logoY, targetWidth, targetHeight);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = reject;
    // If passed a file, use object URL, else use string (for data urls)
    if (imageFile) {
        img.src = URL.createObjectURL(imageFile);
    } else {
        img.src = imageSrc;
    }
  });
};