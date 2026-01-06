export interface MaterialProperties {
  reflectivity: number; // 0.0 (matte) to 1.0 (mirror)
  texture: string; // e.g., 'smooth enamel', 'hammered gold', 'faceted diamond'
  opacity: number; // 0.0 (transparent) to 1.0 (opaque)
}

export interface ColorAdjustment {
  hue: number; // -50 to 50
  saturation: number; // -50 to 50
}

export interface MaterialAdjustment {
  reflectivity: number; // 0.0 to 1.0
  texture: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'whitening' | 'crowns' | 'veneers' | 'cosmetic' | 'ortho' | 'restorative' | 'periodontal';
  aiPrompt: string; // The prompt sent to Gemini to visualize this
  materialProperties?: MaterialProperties;
  stlFileUrl?: string; // Optional CAD path for biometric precision
  model3DUrl?: string; // Optional visual reference for 3D topology
}

export interface CartItem extends Product {
  quantity: number;
}

export type ViewState = 'landing' | 'camera' | 'editor' | 'cart';

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  originalImage: string | null; // Base64
  generatedImage: string | null; // Base64
}