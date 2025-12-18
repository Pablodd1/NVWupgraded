export const regions = [
  "Calistoga",
  "Diamond Mountain",
  "St. Helena",
  "Rutherford",
  "Oakville",
  "Los Carneros (Carneros)",
  "Howell Mountain",
  "Wild Horse Valley",
  "Stags Leap District",
  "Mt. Veeder",
  "Atlas Peak",
  "Spring Mountain District",
  "Chiles Valley",
  "Yountville",
  "Oak Knoll District of Napa Valley",
  "Coombsville",
  "Crystal Springs of Napa Valley",
];

export const wineTypes = ["Red", "Rosé", "White", "Sparkling", "Dessert"];

export const specialFeatures = ["Tasting Waived with Bottle Purchase", "Tour Available", "Food Available", "Family-Friendly", "Pet Friendly", "Organic", "Walk-ins Welcome"];

export const timeOptions = ["Morning", "Afternoon", "Evening"];

// Ordered AVAs (north-to-south, with mountain districts grouped)
export const avaOrder: string[] = [
  "Calistoga",
  "Diamond Mountain",
  "Spring Mountain District",
  "Howell Mountain",
  "St. Helena",
  "Rutherford",
  "Oakville",
  "Yountville",
  "Stags Leap District",
  "Oak Knoll District of Napa Valley",
  "Mt. Veeder",
  "Atlas Peak",
  "Chiles Valley",
  "Coombsville",
  "Wild Horse Valley",
  "Los Carneros (Carneros)",
];

// AVA information (fill in with authoritative copy from the Word document)
export const avaInfo: Record<string, string> = {
  "Calistoga": "Known for warm climate; bold Cabernet Sauvignon and Zinfandel.",
  "Diamond Mountain": "Mountain AVA; structured Cabernet with firm tannins.",
  "Spring Mountain District": "High-elevation vineyards; elegant, age-worthy reds.",
  "Howell Mountain": "Cool nights; intense Cabernets with notable acidity.",
  "St. Helena": "Historic heart of Napa; balanced reds and whites.",
  "Rutherford": "Famous ‘Rutherford dust’; classic Cabernet terroir.",
  "Oakville": "Benchmark Cabernets; gravelly alluvial fans.",
  "Yountville": "Moderate climate; Merlot and Cabernet blends.",
  "Stags Leap District": "Silky tannins; perfumed Cabernets.",
  "Oak Knoll District of Napa Valley": "Cooler AVA; Chardonnay and Merlot shine.",
  "Mt. Veeder": "Steep slopes; powerful, structured reds.",
  "Atlas Peak": "High elevation; concentrated fruit and acidity.",
  "Chiles Valley": "Higher, cooler; Zinfandel and Cabernet.",
  "Coombsville": "Volcanic soils; elegant, cooler-climate Cabernets.",
  "Wild Horse Valley": "Cool and windy; Pinot Noir and Chardonnay.",
  "Los Carneros (Carneros)": "Coolest AVA; Pinot Noir and Chardonnay.",
};

// Mountain AVAs for the Mountain Location filter
export const mountainAVAs: string[] = [
  "Diamond Mountain",
  "Howell Mountain",
  "Mt. Veeder",
  "Atlas Peak",
  "Spring Mountain District",
];