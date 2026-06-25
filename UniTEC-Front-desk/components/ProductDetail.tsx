import React, { useState, useEffect, useRef } from 'react';
import { Product, Language } from '../types';
import { UI_TRANSLATIONS } from '../constants';
import { ArrowLeft, ExternalLink, Tag, Package, Info, DollarSign, Calculator, Mail, CheckCircle2, Sparkles, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  language: Language;
  onBack: () => void;
  onConsult: (productName: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, language, onBack, onConsult }) => {
  const t = UI_TRANSLATIONS[language];

  // Quoting Calculator State
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [wallWidth, setWallWidth] = useState<number>(3);
  const [wallHeight, setWallHeight] = useState<number>(2.5);
  const [wasteFactor, setWasteFactor] = useState<number>(10);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isEmailing, setIsEmailing] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);

  // Visualizer State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0.75);
  const [blendMode, setBlendMode] = useState<GlobalCompositeOperation>('multiply');
  const [isGeneratingMockup, setIsGeneratingMockup] = useState<boolean>(false);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [mockupError, setMockupError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parse price utility
  const parsePrice = (priceStr: string): number => {
    let cleaned = priceStr.replace(/[^\d]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Parse items per box
  const getItemsPerBox = (itemsStr: any): number => {
    if (!itemsStr) return 1;
    const match = String(itemsStr).match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  // Calculations
  const wallArea = wallWidth * wallHeight;
  const neededArea = wallArea * (1 + wasteFactor / 100);
  
  let panelArea = 1;
  if (product.dimensions) {
    if (unitSystem === 'metric') {
      panelArea = (product.dimensions.latam.width_cm / 100) * (product.dimensions.latam.length_cm / 100);
    } else {
      panelArea = (product.dimensions.usa.width_in / 12) * product.dimensions.usa.length_ft;
    }
  }
  if (panelArea <= 0) panelArea = 1;

  const panelsNeeded = Math.ceil(neededArea / panelArea);
  const itemsPerBox = getItemsPerBox(product.items_per_box);
  const boxesNeeded = Math.ceil(panelsNeeded / itemsPerBox);
  const unitPrice = parsePrice(product.price);
  const baseCost = boxesNeeded * unitPrice;

  // Bulk discount
  const discountRate = neededArea >= (unitSystem === 'metric' ? 100 : 1000) ? 0.10 : neededArea >= (unitSystem === 'metric' ? 30 : 300) ? 0.05 : 0;
  const discountApplied = baseCost * discountRate;
  const finalCost = baseCost - discountApplied;

  // Instant Canvas Rendering logic
  useEffect(() => {
    if (!uploadedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const roomImg = new Image();
    roomImg.crossOrigin = 'anonymous';
    roomImg.src = uploadedImage;
    roomImg.onload = () => {
      // Scale canvas to fit image while keeping max width
      const maxWidth = 600;
      const scale = Math.min(1, maxWidth / roomImg.width);
      canvas.width = roomImg.width * scale;
      canvas.height = roomImg.height * scale;
      ctx.drawImage(roomImg, 0, 0, canvas.width, canvas.height);

      // Load texture image
      const textureImg = new Image();
      textureImg.crossOrigin = 'anonymous';
      textureImg.src = `https://picsum.photos/seed/${product.id}/150`;
      textureImg.onload = () => {
        const pattern = ctx.createPattern(textureImg, 'repeat');
        if (pattern) {
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.globalCompositeOperation = blendMode;
          ctx.fillStyle = pattern;
          // Overlay on simulated wall area (top 70% of canvas)
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(canvas.width, 0);
          ctx.lineTo(canvas.width, canvas.height * 0.7);
          ctx.lineTo(0, canvas.height * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      };
    };
  }, [uploadedImage, opacity, blendMode, product.id]);

  const handleEmailQuote = async () => {
    if (!customerEmail.trim()) return;
    setIsEmailing(true);
    setEmailSuccess(false);
    try {
        const { addCrmLog } = await import('../services/firestoreService');
        await addCrmLog({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            customerName: customerEmail.split('@')[0],
            summary: `Requested quotation for ${product.name}. Area: ${wallWidth}x${wallHeight} ${unitSystem === 'metric' ? 'm' : 'ft'} (${wallArea.toFixed(1)} ${unitSystem === 'metric' ? 'm²' : 'sq ft'}). Total Cost: $${finalCost.toLocaleString()}`,
            actionTaken: `Emailed quote to ${customerEmail}`,
            sentiment: 'Positive',
            provider: 'Internal'
        });

        const { syncLeadToEscala } = await import('../services/escalaService');
        await syncLeadToEscala({
            name: customerEmail.split('@')[0],
            email: customerEmail,
            message: `Requested quote for ${product.name}. Dimension: ${wallWidth}x${wallHeight} ${unitSystem === 'metric' ? 'm' : 'ft'}. Quote Cost: $${finalCost.toLocaleString()}`,
            tags: ['AI_PRODUCT_QUOTE']
        });

        setEmailSuccess(true);
        setTimeout(() => setEmailSuccess(false), 5000);
    } catch(e) {
        console.error("Failed to email quote:", e);
    } finally {
        setIsEmailing(false);
    }
  };

  const handleGenerateAiMockup = async () => {
    if (!uploadedImage) return;
    setIsGeneratingMockup(true);
    setMockupError(null);
    try {
        const { editImage } = await import('../services/imageService');
        const prompt = `Install the wood paneling texture of ${product.name} on the main wall in this room, matching perspective and shadows naturally.`;
        const result = await editImage(prompt, uploadedImage);
        if (result) {
            setMockupUrl(result);
        } else {
            setMockupError("AI failed to return a rendered mockup.");
        }
    } catch(e: any) {
        setMockupError(e.message || "Failed to generate AI render.");
    } finally {
        setIsGeneratingMockup(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 truncate">{product.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Hero Image */}
        <div className="h-64 bg-slate-100 relative">
          <img 
            src={`https://picsum.photos/seed/${product.id}/800/600`} 
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black text-brand-700 shadow-sm border border-white/20">
            {product.category}
          </div>
        </div>

        <div className="p-6 space-y-8 pb-20">
          {/* Title & Price */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <DollarSign size={18} />
                <span className="text-xl">{product.price || 'Contact for Price'}</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              product.stock_status.toLowerCase().includes('stock') || product.stock_status.toLowerCase().includes('disponible')
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {product.stock_status}
            </div>
          </div>

          {/* Technical Specs Grid */}
          {product.dimensions && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dimensions (LATAM)</p>
                <p className="text-slate-900 font-bold text-sm">
                  {product.dimensions.latam.width_cm} x {product.dimensions.latam.length_cm} cm
                </p>
                <p className="text-[10px] text-slate-500">{product.dimensions.latam.thickness_mm} mm thickness</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dimensions (USA)</p>
                <p className="text-slate-900 font-bold text-sm">
                  {product.dimensions.usa.width_in} in x {product.dimensions.usa.length_ft} ft
                </p>
                <p className="text-[10px] text-slate-500">{product.dimensions.usa.thickness_in} in thickness</p>
              </div>
            </div>
          )}

          {/* Quoting Calculator Engine */}
          <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200/60 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
              <Calculator size={18} className="text-brand-600" /> {t.quoteEstimate || "Calculate Quote"}
            </h3>
            
            <div className="flex gap-2">
              {(['metric', 'imperial'] as const).map(sys => (
                <button
                  key={sys}
                  onClick={() => setUnitSystem(sys)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${unitSystem === sys ? 'bg-brand-600 border-brand-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {sys === 'metric' ? 'Meters / m²' : 'Feet / sq ft'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Width ({unitSystem === 'metric' ? 'm' : 'ft'})</label>
                <input
                  type="number"
                  value={wallWidth}
                  onChange={e => setWallWidth(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Height ({unitSystem === 'metric' ? 'm' : 'ft'})</label>
                <input
                  type="number"
                  value={wallHeight}
                  onChange={e => setWallHeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Waste Margin</span>
                <span>{wasteFactor}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="5"
                value={wasteFactor}
                onChange={e => setWasteFactor(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            {/* Calculations Breakdown Receipt */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/50 text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Surface Area</span>
                <span className="font-bold text-slate-800">{wallArea.toFixed(2)} {unitSystem === 'metric' ? 'm²' : 'sq ft'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Panels Needed</span>
                <span className="font-bold text-slate-800">{panelsNeeded} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Boxes ({itemsPerBox} units/box)</span>
                <span className="font-bold text-slate-800">{boxesNeeded} Boxes</span>
              </div>
              {discountRate > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Bulk Discount ({discountRate * 100}%)</span>
                  <span>-${discountApplied.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>Estimated Cost</span>
                <span className="text-brand-700">${finalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Quoting Email Capture */}
            <div className="space-y-3 pt-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email Quote Sheet</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  onClick={handleEmailQuote}
                  disabled={isEmailing || !customerEmail.includes('@')}
                  className="px-4 bg-brand-900 hover:bg-brand-800 text-accent-500 font-bold rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  {isEmailing ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
                  Send
                </button>
              </div>
              {emailSuccess && (
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in duration-300">
                  <CheckCircle2 size={12} /> Quote emailed and synchronized to CRM!
                </div>
              )}
            </div>
          </div>

          {/* Interactive Room Visualizer */}
          <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200/60 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
              <ImageIcon size={18} className="text-brand-600" /> {t.visualizerTitle || "Room Visualizer"}
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-white hover:border-brand-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUploadedImage(reader.result as string);
                        setMockupUrl(null);
                        setMockupError(null);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  id="visualizer-upload"
                  className="hidden"
                />
                <label htmlFor="visualizer-upload" className="cursor-pointer text-center space-y-2 flex flex-col items-center">
                  <Upload size={24} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">{uploadedImage ? "Change Room Photo" : "Upload Room Photo"}</span>
                  <span className="text-[9px] text-slate-400">PNG, JPG up to 5MB</span>
                </label>
              </div>

              {uploadedImage && (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-2 bg-slate-200">
                    <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-sm" />
                    {mockupUrl && (
                      <div className="absolute inset-0 bg-white flex items-center justify-center p-2">
                        <img src={mockupUrl} alt="AI Render" className="max-w-full max-h-full rounded-lg shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Canvas Controls */}
                  {!mockupUrl && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-100">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                          <span>Overlay Opacity</span>
                          <span>{Math.round(opacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={opacity}
                          onChange={e => setOpacity(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Blending Mode</label>
                        <select
                          value={blendMode}
                          onChange={e => setBlendMode(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 outline-none"
                        >
                          <option value="multiply">Multiply (Wood Darken)</option>
                          <option value="overlay">Overlay (Reflections)</option>
                          <option value="source-over">Overlay Raw (Opaque)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* AI Mockup trigger */}
                  <div className="space-y-2">
                    <button
                      onClick={handleGenerateAiMockup}
                      disabled={isGeneratingMockup}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingMockup ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {mockupUrl ? "Re-Generate AI Render" : "Generate AI Render"}
                    </button>
                    {mockupUrl && (
                      <button
                        onClick={() => setMockupUrl(null)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider"
                      >
                        Reset to Canvas Template
                      </button>
                    )}
                    {mockupError && (
                      <p className="text-[10px] text-red-600 font-bold text-center">{mockupError}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-900">
              <Info size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">{t.description}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Style Tags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-900">
              <Tag size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">{t.styleTags}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.style_tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Technical Sheet */}
          {product.pdf_tech_sheet && (
            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center justify-between group cursor-pointer hover:bg-brand-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-900 text-accent-500 rounded-xl flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-brand-900 uppercase tracking-widest">{t.techSheet}</p>
                  <p className="text-[10px] text-brand-600">PDF Document • 2.4 MB</p>
                </div>
              </div>
              <ExternalLink size={18} className="text-brand-400 group-hover:text-brand-600 transition-colors" />
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            <button 
              onClick={() => onConsult(product.name)}
              className="w-full py-4 bg-brand-900 text-accent-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-800 transition-all active:scale-95 shadow-lg shadow-brand-900/20"
            >
              {language === 'en' ? 'Consult with AI Assistant' : 'Consultar con Asistente IA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
