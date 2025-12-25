/**
 * AI Natural Language Processing for Wine Search
 * Converts natural language queries into structured filter parameters
 */

export interface SearchFilters {
  ava?: string[];
  wineTypes?: string[];
  priceRange?: { min?: number; max?: number };
  timePreference?: string[];
  features?: string[];
  keywords?: string[];
}

export interface NLPResult {
  filters: SearchFilters;
  confidence: number;
  originalQuery: string;
  interpretation: string;
  suggestions?: string[];
}

// Wine-related keywords and mappings
const WINE_TYPE_KEYWORDS: { [key: string]: string } = {
  'red': 'Red',
  'reds': 'Red',
  'cabernet': 'Red',
  'merlot': 'Red',
  'pinot noir': 'Red',
  'zinfandel': 'Red',
  'syrah': 'Red',
  'white': 'White',
  'whites': 'White',
  'chardonnay': 'White',
  'sauvignon blanc': 'White',
  'riesling': 'White',
  'pinot grigio': 'White',
  'rosé': 'Rosé',
  'rose': 'Rosé',
  'pink': 'Rosé',
  'sparkling': 'Sparkling',
  'champagne': 'Sparkling',
  'prosecco': 'Sparkling',
  'dessert': 'Dessert',
  'port': 'Dessert',
  'sweet': 'Dessert',
};

const AVA_KEYWORDS: { [key: string]: string } = {
  'calistoga': 'Calistoga',
  'rutherford': 'Rutherford',
  'oakville': 'Oakville',
  'stags leap': "Stag's Leap District",
  'stag\'s leap': "Stag's Leap District",
  'yountville': 'Yountville',
  'howell mountain': 'Howell Mountain',
  'mount veeder': 'Mount Veeder',
  'diamond mountain': 'Diamond Mountain District',
  'spring mountain': 'Spring Mountain District',
  'atlas peak': 'Atlas Peak',
  'carneros': 'Los Carneros',
  'los carneros': 'Los Carneros',
  'oak knoll': 'Oak Knoll District',
  'coombsville': 'Coombsville',
  'st helena': 'St. Helena',
  'saint helena': 'St. Helena',
  'chiles valley': 'Chiles Valley District',
};

const FEATURE_KEYWORDS: { [key: string]: string } = {
  'tour': 'Tour Available',
  'tours': 'Tour Available',
  'pet friendly': 'Pet Friendly',
  'pets': 'Pet Friendly',
  'dog': 'Pet Friendly',
  'dogs': 'Pet Friendly',
  'handicap': 'Handicap Accessible',
  'accessible': 'Handicap Accessible',
  'wheelchair': 'Handicap Accessible',
  'cave': 'Cave Tours',
  'caves': 'Cave Tours',
  'estate': 'Estate Grown',
  'organic': 'Organic Wines',
  'biodynamic': 'Biodynamic',
  'food': 'Food Pairing Available',
  'cheese': 'Food Pairing Available',
  'waived': 'Tasting Waived with Bottle Purchase',
};

const TIME_KEYWORDS: { [key: string]: string } = {
  'morning': 'Morning',
  'afternoon': 'Afternoon',
  'evening': 'Evening',
  'early': 'Morning',
  'late': 'Evening',
  'noon': 'Afternoon',
  'lunch': 'Afternoon',
  'dinner': 'Evening',
};

const PRICE_KEYWORDS: { [key: string]: { min?: number; max?: number } } = {
  'cheap': { max: 30 },
  'affordable': { max: 50 },
  'budget': { max: 40 },
  'expensive': { min: 100 },
  'luxury': { min: 150 },
  'premium': { min: 100 },
  'moderate': { min: 40, max: 80 },
  'mid-range': { min: 40, max: 80 },
};

/**
 * Process natural language query and extract filters using traditional keyword matching.
 * This serves as a fallback if AI processing is unavailable or fails.
 */
export function processNaturalLanguage(query: string): NLPResult {
  const lowerQuery = query.toLowerCase();
  const filters: SearchFilters = {};
  const keywords: string[] = [];
  let confidence = 0.5; // Base confidence
  let interpretation = "";

  // Extract wine types
  const wineTypes = new Set<string>();
  for (const [keyword, wineType] of Object.entries(WINE_TYPE_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      wineTypes.add(wineType);
      confidence += 0.1;
    }
  }
  if (wineTypes.size > 0) {
    filters.wineTypes = Array.from(wineTypes);
  }

  // Extract AVAs (regions)
  const avas = new Set<string>();
  for (const [keyword, ava] of Object.entries(AVA_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      avas.add(ava);
      confidence += 0.15;
    }
  }
  if (avas.size > 0) {
    filters.ava = Array.from(avas);
  }

  // Extract features
  const features = new Set<string>();
  for (const [keyword, feature] of Object.entries(FEATURE_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      features.add(feature);
      confidence += 0.1;
    }
  }
  if (features.size > 0) {
    filters.features = Array.from(features);
  }

  // Extract time preferences
  const times = new Set<string>();
  for (const [keyword, time] of Object.entries(TIME_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      times.add(time);
      confidence += 0.05;
    }
  }
  if (times.size > 0) {
    filters.timePreference = Array.from(times);
  }

  // Extract price range
  for (const [keyword, priceRange] of Object.entries(PRICE_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      filters.priceRange = priceRange;
      confidence += 0.1;
      break;
    }
  }

  // Extract numeric price range (e.g., "under 50" or "between 40 and 80")
  const underMatch = lowerQuery.match(/(?:under|below|less than)\s+\$?(\d+)/);
  if (underMatch) {
    filters.priceRange = { max: parseInt(underMatch[1]) };
    confidence += 0.15;
  }

  const overMatch = lowerQuery.match(/(?:over|above|more than)\s+\$?(\d+)/);
  if (overMatch) {
    filters.priceRange = { min: parseInt(overMatch[1]) };
    confidence += 0.15;
  }

  const betweenMatch = lowerQuery.match(/between\s+\$?(\d+)\s+(?:and|to)\s+\$?(\d+)/);
  if (betweenMatch) {
    filters.priceRange = {
      min: parseInt(betweenMatch[1]),
      max: parseInt(betweenMatch[2])
    };
    confidence += 0.2;
  }

  // Extract general keywords for text search
  const commonWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'want', 'need', 'like', 'find', 'looking',
    'for', 'to', 'with', 'in', 'at', 'near', 'around', 'some', 'any', 'me',
    'i', 'my', 'we', 'our', 'you', 'your'
  ]);

  const words = lowerQuery.split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
      // Check if it's not already captured by other filters
      const isAlreadyCaptured =
        Object.keys(WINE_TYPE_KEYWORDS).includes(cleanWord) ||
        Object.keys(AVA_KEYWORDS).includes(cleanWord) ||
        Object.keys(FEATURE_KEYWORDS).includes(cleanWord) ||
        Object.keys(TIME_KEYWORDS).includes(cleanWord) ||
        Object.keys(PRICE_KEYWORDS).includes(cleanWord);

      if (!isAlreadyCaptured) {
        keywords.push(cleanWord);
      }
    }
  }

  if (keywords.length > 0) {
    filters.keywords = keywords;
  }

  // Cap confidence at 1.0
  confidence = Math.min(confidence, 1.0);

  // Generate human-readable interpretation
  interpretation = generateInterpretation(filters);

  // Generate suggestions if confidence is low
  const suggestions = confidence < 0.6 ? generateSuggestions() : undefined;

  return {
    filters,
    confidence,
    originalQuery: query,
    interpretation,
    suggestions
  };
}

function generateInterpretation(filters: SearchFilters): string {
  const parts: string[] = [];

  if (filters.wineTypes && filters.wineTypes.length > 0) {
    parts.push(`${filters.wineTypes.join(' or ')} wines`);
  }

  if (filters.ava && filters.ava.length > 0) {
    parts.push(`in ${filters.ava.join(' or ')}`);
  }

  if (filters.features && filters.features.length > 0) {
    parts.push(`with ${filters.features.join(', ')}`);
  }

  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    if (min && max) {
      parts.push(`priced between $${min}-$${max}`);
    } else if (max) {
      parts.push(`under $${max}`);
    } else if (min) {
      parts.push(`over $${min}`);
    }
  }

  if (filters.timePreference && filters.timePreference.length > 0) {
    parts.push(`for ${filters.timePreference.join(' or ')} visits`);
  }

  if (parts.length === 0) {
    return "Searching all wineries";
  }

  return `Looking for ${parts.join(' ')}`;
}

function generateSuggestions(): string[] {
  return [
    "Try: 'Red wines in Oakville with tours'",
    "Try: 'Affordable sparkling wines in Carneros'",
    "Try: 'Pet friendly wineries with cave tours'",
    "Try: 'Luxury Cabernet in Rutherford'",
    "Try: 'Morning tastings under $50'",
  ];
}

/**
 * AI-powered winery recommendations based on user preferences
 */
export interface WineryScore {
  wineryId: string;
  score: number;
  reasons: string[];
}

export function generateWineryRecommendations(
  wineries: any[],
  userQuery: string,
  filters: SearchFilters
): WineryScore[] {
  const recommendations: WineryScore[] = [];

  for (const winery of wineries) {
    let score = 0;
    const reasons: string[] = [];

    // Score based on wine types
    if (filters.wineTypes && filters.wineTypes.length > 0) {
      const wineryWineTypes = winery.tasting_info?.wine_types || [];
      const matchingTypes = filters.wineTypes.filter(type =>
        wineryWineTypes.includes(type)
      );
      if (matchingTypes.length > 0) {
        score += 20 * matchingTypes.length;
        reasons.push(`Offers ${matchingTypes.join(', ')}`);
      }
    }

    // Score based on AVA
    if (filters.ava && filters.ava.length > 0) {
      const wineryAva = winery.tasting_info?.ava;
      if (wineryAva && filters.ava.includes(wineryAva)) {
        score += 30;
        reasons.push(`Located in ${wineryAva}`);
      }
    }

    // Score based on features
    if (filters.features && filters.features.length > 0) {
      const wineryFeatures = winery.tasting_info?.special_features || [];
      const matchingFeatures = filters.features.filter(feature =>
        wineryFeatures.includes(feature)
      );
      if (matchingFeatures.length > 0) {
        score += 15 * matchingFeatures.length;
        reasons.push(`Has ${matchingFeatures.join(', ')}`);
      }
    }

    // Score based on price range
    if (filters.priceRange) {
      const wineryPrice = winery.tasting_info?.tasting_price || 0;
      const { min, max } = filters.priceRange;

      let priceMatch = true;
      if (min && wineryPrice < min) priceMatch = false;
      if (max && wineryPrice > max) priceMatch = false;

      if (priceMatch) {
        score += 25;
        reasons.push(`Price: $${wineryPrice}`);
      }
    }

    // Score based on time availability
    if (filters.timePreference && filters.timePreference.length > 0) {
      const wineryTimes = winery.tasting_info?.available_times || [];
      const matchingTimes = filters.timePreference.filter(time =>
        wineryTimes.includes(time)
      );
      if (matchingTimes.length > 0) {
        score += 10 * matchingTimes.length;
        reasons.push(`Available ${matchingTimes.join(', ')}`);
      }
    }

    // Score based on keywords in name or description
    if (filters.keywords && filters.keywords.length > 0) {
      const searchableText = `${winery.name} ${winery.description}`.toLowerCase();
      const matchingKeywords = filters.keywords.filter(keyword =>
        searchableText.includes(keyword)
      );
      if (matchingKeywords.length > 0) {
        score += 5 * matchingKeywords.length;
      }
    }

    // Add base popularity score (based on user reviews if available)
    const reviewCount = winery.user_reviews?.length || 0;
    if (reviewCount > 0) {
      score += Math.min(reviewCount * 2, 10); // Max 10 points from reviews
      reasons.push(`${reviewCount} reviews`);
    }

    if (score > 0) {
      recommendations.push({
        wineryId: winery._id,
        score,
        reasons
      });
    }
  }

  // Sort by score (highest first)
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

export async function processNaturalLanguageAI(query: string): Promise<NLPResult> {
  try {
    const response = await fetch('/api/ai-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`AI Search API returned ${response.status}`);
    }

    const data = await response.json();

    // Map the API response back to the NLPResult format
    return {
      filters: {
        ava: data.filters.ava,
        wineTypes: data.filters.wineTypes,
        priceRange: data.filters.priceRange,
        features: data.filters.features,
      },
      confidence: 0.95, // AI provided this
      originalQuery: query,
      interpretation: data.filters.interpretation,
      suggestions: data.count === 0 ? ["Try widening your search area or price range."] : undefined
    };
  } catch (error) {
    console.error("AI NLP processing failed, falling back to keywords:", error);
    return processNaturalLanguage(query);
  }
}

export default {
  processNaturalLanguage,
  processNaturalLanguageAI,
  generateWineryRecommendations
};
