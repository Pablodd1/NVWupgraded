import { GoogleGenAI } from "@google/genai";
import { ColorAdjustment, MaterialAdjustment } from "../types.ts";

/**
 * Edits an image using Gemini 3 Pro Image (High Fidelity) based on a text prompt.
 * Focuses on high-fidelity dental textures and realistic material rendering.
 */
export const editDentalImage = async (
  base64Image: string, 
  prompt: string, 
  selectedTeeth: number[] = [],
  colorAdjustment: ColorAdjustment = { hue: 0, saturation: 0 },
  materialAdjustment?: MaterialAdjustment
): Promise<string> => {
  // Ensure we get the latest key from the process shim
  const apiKey = (window as any).process?.env?.API_KEY || "";
  if (!apiKey) {
    throw new Error("Clinical API Key is not configured. Please select an API key.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    let toothTargetingInstruction = "";
    if (selectedTeeth.length > 0) {
        toothTargetingInstruction = `
        TARGET SPECIFICITY (Universal Numbering System):
        - Apply treatment EXCLUSIVELY to teeth: ${selectedTeeth.join(', ')}.
        - Maintain pixel-perfect margins at the gingiva (gum line).
        - Ensure interproximal spaces (gaps) are realistically rendered without blending adjacent teeth.
        `;
    } else {
        toothTargetingInstruction = 'TARGET: Focus on the aesthetic maxillary and mandibular "Smile Zone" visible in the capture.';
    }

    let colorInstruction = "";
    if (colorAdjustment.hue !== 0 || colorAdjustment.saturation !== 0) {
        const hueDesc = colorAdjustment.hue > 0 
            ? "Shift to warmer VITA A3/A4 natural shades." 
            : "Shift to cooler, high-value VITA B1/Bleach shades.";
            
        const satDesc = colorAdjustment.saturation > 0 
            ? "Increase internal chroma depth." 
            : "Minimize chroma for a brighter, high-translucency look.";

        colorInstruction = `
        CHROMATIC CALIBRATION:
        - Value/Hue: ${colorAdjustment.hue !== 0 ? hueDesc : 'Maintain natural base shade'}.
        - Saturation: ${colorAdjustment.saturation !== 0 ? satDesc : 'Balanced'}.
        `;
    }

    const textureType = materialAdjustment?.texture || "enamel with subtle perikymata";
    const reflectivityVal = materialAdjustment?.reflectivity || 0.6;
    
    // Explicit instructions for micro-surface topology
    let microTextureDetail = "";
    if (textureType.toLowerCase().includes("enamel")) {
      microTextureDetail = "Simulate fine horizontal perikymata lines and imbrication lines for hyper-realism. Add slight surface irregularities that catch grazing light naturally.";
    } else if (textureType.toLowerCase().includes("gold") || textureType.toLowerCase().includes("metal")) {
      microTextureDetail = "Add a fine, micro-brushed grain pattern. Ensure specular highlights show linear anisotropic reflection typical of polished noble metals.";
    } else if (textureType.toLowerCase().includes("porcelain") || textureType.toLowerCase().includes("zirconia")) {
      microTextureDetail = "Apply subtle orange-peel macro-texture and glaze firing variations. Ensure high internal light scattering at the incisal edge for depth.";
    }

    const materialInstruction = `
       MATERIAL AUTHENTICITY:
       - Base Material: "${textureType}".
       - Micro-Surface Topology: ${microTextureDetail}
       - Light Diffusion: Use high-fidelity subsurface scattering (SSS) for ceramic depth.
       - Specular Highlights: ${reflectivityVal > 0.8 ? "Sharp high-gloss reflections" : "Soft, diffused satin luster"}.
       - Incisal Translucency: Add 1.5mm of gradual blue/gray incisal halo for a youthful, natural appearance.
       `;

    const fullPrompt = `
      CONTEXT: Professional Clinical Virtual Try-On (VTON) for a premium dental showroom.
      OBJECTIVE: "${prompt}"

      ${toothTargetingInstruction}
      ${colorInstruction}
      ${materialInstruction}

      STRICT CLINICAL QUALITY GUIDELINES:
      1. NO HALLUCINATIONS: Do not alter facial structure, skin texture, or lip morphology.
      2. PHOTOREALISM: The material must exhibit realistic light absorption, bounce, and Fresnel effect.
      3. SURFACE DETAIL: Prioritize visible macro and micro textures (8k texture resolution target).
      4. GINGIVAL BLENDING: No visible seams or "floating" artifacts at the periodontal margin.
      5. SYMMETRY: Maintain anatomical midline consistency.

      Return ONLY the modified high-fidelity image as base64 data.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } },
          { text: fullPrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    let generatedImageBase64 = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageBase64 = part.inlineData.data;
          break; 
        }
      }
    }

    if (!generatedImageBase64) {
      throw new Error("Clinical visualization failed. Check API key status and network connection.");
    }
    
    return `data:image/jpeg;base64,${generatedImageBase64}`;

  } catch (error: any) {
    console.error("Clinical Imaging Error:", error);
    if (error?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    throw error;
  }
};
