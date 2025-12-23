import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { parseExif } from './utils/exifHelper';
import { generateFinalImage } from './utils/canvasGenerator';
import PhotoFrame from './components/PhotoFrame';
import ControlPanel from './components/ControlPanel';
import { ExifData, FrameSettings } from './types';

const INITIAL_SETTINGS: FrameSettings = {
  showModel: true,
  showLens: false,
  showTechSpecs: true,
  showDate: true,
  showGps: true,
  showLogo: true,
  
  customModel: '',
  customLens: '',
  customFocalLength: '',
  customAperture: '',
  customShutterSpeed: '',
  customIso: '',
  customDateTime: '',
  customGps: '',
  
  selectedBrand: 'Auto',
  
  frameStyle: 'solid',
  frameColor: '#ffffff',
  textColor: '#000000',
  padding: 10,
  
  blurStrength: 30,
  glassOpacity: 20
};

const INITIAL_EXIF: ExifData = {
  make: '',
  model: 'Camera Model',
  lens: '',
  focalLength: '50mm',
  aperture: 'f/1.8',
  shutterSpeed: '1/100s',
  iso: 'ISO 100',
  dateTime: '2023.01.01 12:00',
  gps: '',
};

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifData>(INITIAL_EXIF);
  const [settings, setSettings] = useState<FrameSettings>(INITIAL_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setImageFile(file);
        
        // Parse Exif
        const data = await parseExif(file);
        setExif(data);
        
        // Auto-enable lens if detected
        setSettings(prev => ({
            ...prev,
            showLens: !!data.lens,
            showGps: !!data.gps
        }));

    } catch (err) {
        console.error("Error parsing file", err);
    }
  };

  const handleDownload = async () => {
    if (!imageFile && !imagePreview) return;
    
    setIsProcessing(true);
    try {
        // We use a small delay to allow UI to show processing state
        setTimeout(async () => {
            // Re-use the generation logic directly
            const dataUrl = await generateFinalImage(imageFile, imagePreview!, exif, settings);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `lensframe-${imageFile?.name || 'export.jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsProcessing(false);
        }, 100);
    } catch (error) {
        console.error(error);
        setIsProcessing(false);
    }
  };

  const handleReset = () => {
      setImageFile(null);
      setImagePreview(null);
      setExif(INITIAL_EXIF);
      setSettings(INITIAL_SETTINGS);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Header */}
      <header className="flex-none px-6 py-4 border-b border-gray-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-30">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center font-bold text-white text-lg">LF</div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">LensFrame</h1>
        </div>
        {imageFile && (
            <button 
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors"
            >
                <X size={16} /> Close File
            </button>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left: Preview Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0f172a] p-4 md:p-10 flex items-center justify-center relative">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {!imagePreview ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-xl h-64 md:h-96 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-900/50 transition-all group"
                >
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-blue-500" size={32} />
                    </div>
                    <p className="text-lg font-medium text-gray-300">Click to upload photo</p>
                    <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, HEIC</p>
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        className="hidden" 
                    />
                </div>
            ) : (
                <div className="w-full max-w-6xl h-full flex items-center justify-center">
                    <PhotoFrame 
                        imageSrc={imagePreview} 
                        exif={exif} 
                        settings={settings} 
                    />
                </div>
            )}
        </div>

        {/* Right: Controls (Sidebar on Desktop, Drawer on Mobile) */}
        {imagePreview && (
            <div className="flex-none w-full md:w-80 lg:w-[400px] bg-slate-900 border-l border-gray-800 z-20 h-1/2 md:h-full relative shadow-2xl">
                <ControlPanel 
                    settings={settings} 
                    setSettings={setSettings} 
                    onDownload={handleDownload}
                    isDownloading={isProcessing}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default App;