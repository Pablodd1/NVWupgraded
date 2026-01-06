import React from 'react';
import { Product } from '../types';
import { Sparkles, Crown, Palette, Activity, Gem, Ruler, Scissors, Beaker, Coins, BoxSelect, Grid3x3, Anchor } from 'lucide-react';

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Chromatic Brightening',
    description: 'Target VITA OM1 high-value brilliance.',
    price: 450,
    category: 'whitening',
    aiPrompt: 'Perform a professional enamel bleaching simulation. Target VITA OM1. Preserve natural perikymata texture and incisal translucency.',
    materialProperties: { reflectivity: 0.65, texture: 'enamel with subtle perikymata', opacity: 0.95 }
  },
  {
    id: 'minimalist-lumineers',
    name: 'Ceramic Lumineers',
    description: 'Ultra-thin 0.2mm contact-lens porcelain.',
    price: 1800,
    category: 'veneers',
    aiPrompt: 'Simulate ultra-thin contact-lens lumineers. Show high-gloss glaze and subtle porcelain grain.',
    materialProperties: { reflectivity: 0.7, texture: 'highly polished porcelain', opacity: 0.8 }
  },
  {
    id: 'full-contour-veneers',
    name: 'Porcelain Artistry',
    description: 'Anatomical shape correction restorations.',
    price: 1600,
    category: 'veneers',
    aiPrompt: 'Apply full-contour cosmetic veneers. Sculpt ideal tooth morphology with micro-surface characterization.',
    materialProperties: { reflectivity: 0.72, texture: 'hand-layered ceramic', opacity: 0.95 }
  },
  {
    id: 'gold-full',
    name: 'High-Noble Gold Cap',
    description: 'Full-cast 18K gold biocompatible crown.',
    price: 1250,
    category: 'restorative',
    aiPrompt: 'Simulate high-noble 18K gold crown with micro-brushed surface and sharp specular highlights.',
    materialProperties: { reflectivity: 0.95, texture: 'fine brushed gold', opacity: 1.0 }
  },
  {
    id: 'composite-bonding',
    name: 'Cosmetic Bonding',
    description: 'Direct resin layering for micro-repair.',
    price: 600,
    category: 'cosmetic',
    aiPrompt: 'Simulate clinical composite resin bonding. Match adjacent tooth texture and luster.',
    materialProperties: { reflectivity: 0.55, texture: 'polished composite resin', opacity: 0.9 }
  },
  {
    id: 'dental-implant',
    name: 'Ceramic Implant',
    description: 'Zirconia post & anatomical crown.',
    price: 4500,
    category: 'restorative',
    aiPrompt: 'Simulate full dental implant restoration. Focus on natural gingival emergence and zirconia crown texture.',
    materialProperties: { reflectivity: 0.68, texture: 'high-translucency zirconia', opacity: 1.0 }
  }
];

interface ProductCatalogProps {
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onSelect, onAddToCart }) => {
  const getIcon = (category: string, id: string) => {
    if (id.startsWith('gold')) return <Coins className="w-5 h-5 text-amber-600/70" strokeWidth={1.5} />;
    if (id === 'dental-implant') return <Anchor className="w-5 h-5 text-slate-500" strokeWidth={1.5} />;
    switch (category) {
      case 'whitening': return <Beaker className="w-5 h-5 text-slate-500" strokeWidth={1.5} />;
      case 'crowns': return <Crown className="w-5 h-5 text-slate-500" strokeWidth={1.5} />;
      case 'veneers': return <Palette className="w-5 h-5 text-slate-500" strokeWidth={1.5} />;
      case 'restorative': return <Activity className="w-5 h-5 text-slate-500" strokeWidth={1.5} />;
      case 'ortho': return <Ruler className="w-5 h-5 text-slate-500" strokeWidth={1.5} />;
      case 'periodontal': return <Scissors className="w-5 h-5 text-slate-500" strokeWidth={1.5} />;
      default: return <Gem className="w-5 h-5 text-slate-500" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 lg:p-10 pb-32">
      {PRODUCTS.map((product) => (
        <div key={product.id} className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col group overflow-hidden">
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                {getIcon(product.category, product.id)}
              </div>
              <div>
                <h3 className="font-serif text-slate-900 text-sm leading-tight font-bold">{product.name}</h3>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black block mt-1">
                  {product.category}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mb-6 leading-relaxed flex-1 italic">{product.description}</p>
            <div className="mb-6 flex justify-between items-center border-t border-slate-50 pt-4">
              <span className="font-mono text-slate-800 font-bold text-xs">${product.price.toLocaleString()}</span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-100"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-100"></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onSelect(product)}
                className="flex-1 bg-slate-800 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all rounded-xl shadow-lg"
              >
                Visualize
              </button>
              <button
                onClick={() => onAddToCart(product)}
                className="px-4 border-2 border-slate-100 text-slate-400 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all rounded-xl"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};