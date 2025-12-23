export interface ExifData {
  make: string;
  model: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  dateTime: string;
  gps: string;
}

export type FrameStyle = 'solid' | 'glass';

export interface FrameSettings {
  showModel: boolean;
  showLens: boolean;
  showTechSpecs: boolean;
  showDate: boolean;
  showGps: boolean;
  showLogo: boolean;
  
  // Data Overrides
  customModel: string;
  customLens: string;
  customFocalLength: string;
  customAperture: string;
  customShutterSpeed: string;
  customIso: string;
  customDateTime: string;
  customGps: string;
  selectedBrand: string;
  
  // Style Config
  frameStyle: FrameStyle;
  frameColor: string; // Background color for solid, Tint color for glass
  textColor: string;
  padding: number; // percentage of image height
  
  // Glass Specific
  blurStrength: number; // 0-100
  glassOpacity: number; // 0-100 (Tint opacity)
}

export const SUPPORTED_BRANDS = [
  'Leica', 'Xiaomi', 'Sony', 'Canon', 'Nikon', 'Fujifilm', 'Apple', 'Hasselblad', 'Olympus', 'Panasonic', 'Samsung', 'Google', 'DJI'
] as const;

export type SupportedBrand = typeof SUPPORTED_BRANDS[number];