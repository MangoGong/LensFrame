import React from 'react';
import { FrameSettings, SUPPORTED_BRANDS, FrameStyle } from '../types';
import { Settings2, Type, Aperture, MapPin, Calendar, Camera, Palette, Droplet } from 'lucide-react';

interface ControlPanelProps {
  settings: FrameSettings;
  setSettings: React.Dispatch<React.SetStateAction<FrameSettings>>;
  onDownload: () => void;
  isDownloading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ settings, setSettings, onDownload, isDownloading }) => {
  
  const updateSetting = (key: keyof FrameSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const Toggle = ({ label, field, icon: Icon }: { label: string, field: keyof FrameSettings, icon: any }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-800">
      <div className="flex items-center gap-2 text-gray-300">
        <Icon size={16} className="text-gray-400" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <button 
        onClick={() => updateSetting(field, !settings[field])}
        className={`w-10 h-5 rounded-full relative transition-colors ${settings[field] ? 'bg-blue-600' : 'bg-gray-700'}`}
      >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings[field] ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );

  const Input = ({ label, field, placeholder }: { label: string, field: keyof FrameSettings, placeholder?: string }) => (
     <div className="py-2 animate-in fade-in slide-in-from-top-1 duration-200">
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1.5">{label}</label>
        <input 
            type="text"
            className="w-full bg-slate-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            value={settings[field] as string}
            onChange={(e) => updateSetting(field, e.target.value)}
            placeholder={placeholder}
        />
     </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-gray-800 overflow-y-auto">
      <div className="p-5 border-b border-gray-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Settings2 size={20} className="text-blue-500" /> Editor
        </h2>
      </div>

      <div className="flex-1 p-5 space-y-8">
        
        {/* Style Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} className="text-blue-500" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Style & Theme</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
             <button 
               onClick={() => { 
                   updateSetting('frameStyle', 'solid');
                   updateSetting('frameColor', '#ffffff'); 
                   updateSetting('textColor', '#000000'); 
               }}
               className={`group relative p-3 rounded-xl border transition-all ${
                   settings.frameStyle === 'solid' && settings.frameColor === '#ffffff' 
                   ? 'border-blue-500 bg-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                   : 'border-gray-800 bg-slate-900 hover:border-gray-700'
               }`}
             >
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 bg-white rounded-full shadow-sm"></div>
                 <span className="text-xs font-medium text-gray-300">White</span>
               </div>
             </button>

             <button 
               onClick={() => { 
                   updateSetting('frameStyle', 'solid');
                   updateSetting('frameColor', '#000000'); 
                   updateSetting('textColor', '#ffffff'); 
               }}
               className={`group relative p-3 rounded-xl border transition-all ${
                   settings.frameStyle === 'solid' && settings.frameColor === '#000000' 
                   ? 'border-blue-500 bg-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                   : 'border-gray-800 bg-slate-900 hover:border-gray-700'
               }`}
             >
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 bg-black border border-gray-700 rounded-full"></div>
                 <span className="text-xs font-medium text-gray-300">Black</span>
               </div>
             </button>

             <button 
               onClick={() => { 
                   updateSetting('frameStyle', 'glass');
                   updateSetting('frameColor', '#ffffff'); // Base tint
                   updateSetting('textColor', '#000000'); 
                   updateSetting('glassOpacity', 30);
               }}
               className={`group relative p-3 rounded-xl border transition-all ${
                   settings.frameStyle === 'glass' && settings.frameColor === '#ffffff' 
                   ? 'border-blue-500 bg-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                   : 'border-gray-800 bg-slate-900 hover:border-gray-700'
               }`}
             >
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 backdrop-blur-sm"></div>
                 <span className="text-xs font-medium text-gray-300">Glass Light</span>
               </div>
             </button>

             <button 
               onClick={() => { 
                   updateSetting('frameStyle', 'glass');
                   updateSetting('frameColor', '#000000'); // Base tint
                   updateSetting('textColor', '#ffffff'); 
                   updateSetting('glassOpacity', 40);
               }}
               className={`group relative p-3 rounded-xl border transition-all ${
                   settings.frameStyle === 'glass' && settings.frameColor === '#000000' 
                   ? 'border-blue-500 bg-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                   : 'border-gray-800 bg-slate-900 hover:border-gray-700'
               }`}
             >
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-black/40 to-black/10 border border-white/10 backdrop-blur-sm"></div>
                 <span className="text-xs font-medium text-gray-300">Glass Dark</span>
               </div>
             </button>
          </div>

          {/* Blur Controls (Only for Glass) */}
          {settings.frameStyle === 'glass' && (
              <div className="bg-slate-900/50 rounded-lg p-3 border border-gray-800 mb-4 animate-in fade-in slide-in-from-top-2">
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                        <label className="text-xs text-gray-400 font-medium">Blur Strength</label>
                        <span className="text-xs text-blue-400">{settings.blurStrength}px</span>
                    </div>
                    <input 
                        type="range" min="0" max="100" step="1"
                        value={settings.blurStrength}
                        onChange={(e) => updateSetting('blurStrength', parseInt(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-xs text-gray-400 font-medium">Tint Opacity</label>
                        <span className="text-xs text-blue-400">{settings.glassOpacity}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="90" step="1"
                        value={settings.glassOpacity}
                        onChange={(e) => updateSetting('glassOpacity', parseInt(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
              </div>
          )}
          
          <div className="space-y-4">
            <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-2">Camera Brand</label>
                <div className="relative">
                    <select 
                        value={settings.selectedBrand}
                        onChange={(e) => updateSetting('selectedBrand', e.target.value)}
                        className="w-full bg-slate-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-blue-500"
                    >
                        <option value="Auto">✨ Auto Detect</option>
                        <option disabled>──────────</option>
                        {SUPPORTED_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                        <option disabled>──────────</option>
                        <option value="Generic">Generic / None</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>

            <div>
                 <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Padding</label>
                    <span className="text-xs text-gray-400">{settings.padding}%</span>
                 </div>
                 <input 
                   type="range" min="5" max="25" step="1" 
                   value={settings.padding}
                   onChange={(e) => updateSetting('padding', parseInt(e.target.value))}
                   className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                 />
            </div>
          </div>
        </section>

        {/* Visibility Toggles */}
        <section>
            <div className="flex items-center gap-2 mb-4">
                <Type size={16} className="text-blue-500" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content & Data</h3>
            </div>
            
            <Toggle label="Show Model Name" field="showModel" icon={Camera} />
            {settings.showModel && <Input label="Custom Model" field="customModel" placeholder="e.g. iPhone 15 Pro" />}
            
            <Toggle label="Show Lens Info" field="showLens" icon={Aperture} />
            {settings.showLens && <Input label="Custom Lens" field="customLens" placeholder="e.g. 24mm f/1.4" />}
            
            <Toggle label="Show Date & Time" field="showDate" icon={Calendar} />
            {settings.showDate && <Input label="Custom Date" field="customDateTime" placeholder="YYYY.MM.DD HH:mm" />}
            
            <Toggle label="Show Tech Specs" field="showTechSpecs" icon={Settings2} />
            {settings.showTechSpecs && (
                <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input label="Focal Length" field="customFocalLength" placeholder="23mm" />
                    <Input label="Aperture" field="customAperture" placeholder="f/2.8" />
                    <Input label="Shutter Speed" field="customShutterSpeed" placeholder="1/100s" />
                    <Input label="ISO" field="customIso" placeholder="ISO 400" />
                </div>
            )}

            <Toggle label="Show Coordinates" field="showGps" icon={MapPin} />
            {settings.showGps && <Input label="Custom GPS" field="customGps" placeholder="XX°N XX°E" />}
        </section>

      </div>
      
      <div className="p-5 border-t border-gray-800 bg-slate-900 sticky bottom-0 z-20">
        <button 
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            'Save Final Image'
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;