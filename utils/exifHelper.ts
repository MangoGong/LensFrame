import ExifReader from 'exifreader';
import { ExifData } from '../types';
import { MAKER_MAP } from '../constants';

export const parseExif = async (file: File): Promise<ExifData> => {
  const tags = await ExifReader.load(file);
  
  // Helpers
  const getTag = (name: string) => tags[name]?.description || '';
  
  // Date formatting (YYYY.MM.DD HH:mm)
  let dateTime = getTag('DateTimeOriginal') || getTag('DateTime');
  if (dateTime) {
    // Standard Exif is YYYY:MM:DD HH:MM:SS
    const parts = dateTime.split(' ');
    if (parts.length >= 2) {
      const datePart = parts[0].replace(/:/g, '.');
      const timePart = parts[1].substring(0, 5); // HH:MM
      dateTime = `${datePart} ${timePart}`;
    }
  } else {
    // Fallback to file date
    const d = new Date(file.lastModified);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    dateTime = `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  }

  // Model & Make
  let make = getTag('Make').toLowerCase();
  let model = getTag('Model');
  
  // Clean up model name if it repeats the make (e.g. "Canon Canon EOS R5")
  if (model.toLowerCase().startsWith(make)) {
    model = model.substring(make.length).trim();
  }

  // GPS Logic
  let gps = '';
  if (tags['GPSLatitude'] && tags['GPSLongitude']) {
     // ExifReader returns array of numbers for coordinates
     const lat = tags['GPSLatitude'].description; // e.g., 34.5
     const lng = tags['GPSLongitude'].description;
     // Simple formatting, could be enhanced to DMS
     gps = `${Number(lat).toFixed(4)}°N ${Number(lng).toFixed(4)}°E`;
  }

  // Shutter Speed formatting
  let shutter = getTag('ExposureTime');
  if (shutter && !shutter.includes('/')) {
     const val = parseFloat(shutter);
     if (val < 1 && val > 0) {
        shutter = `1/${Math.round(1/val)}`;
     }
  }
  // Remove "seconds" suffix if present
  shutter = shutter.replace(' seconds', 's');
  if (!shutter.endsWith('s')) shutter += 's';

  // Aperture
  let aperture = getTag('FNumber');
  if (aperture && !aperture.toLowerCase().startsWith('f/')) {
    aperture = `f/${aperture}`;
  }

  // Focal Length
  let focal = getTag('FocalLength');
  // Remove "mm" to re-add consistently
  focal = focal.replace(' mm', '').replace('mm', '');
  if (focal) focal += 'mm';
  
  // 35mm equivalent often better
  const focal35 = getTag('FocalLengthIn35mmFilm');
  if (focal35) focal = `${focal35}mm`;

  return {
    make: make,
    model: model || 'Unknown Camera',
    lens: getTag('LensModel') || '',
    focalLength: focal,
    aperture: aperture,
    shutterSpeed: shutter,
    iso: getTag('ISOSpeedRatings') ? `ISO${getTag('ISOSpeedRatings')}` : '',
    dateTime: dateTime,
    gps: gps,
  };
};

export const getBrandFromMake = (make: string): string => {
  const cleanMake = make.trim().toLowerCase();
  for (const [key, value] of Object.entries(MAKER_MAP)) {
    if (cleanMake.includes(key)) {
      return value;
    }
  }
  return 'Generic';
};