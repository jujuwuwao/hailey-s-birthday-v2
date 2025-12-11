export const PHOTO_URLS = [
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/c7ab685ce07d86d540047a034b898bdec8564bdf/352a25b60095496747cbb095916ebbfa.jpg",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/c7ab685ce07d86d540047a034b898bdec8564bdf/3a33fa691d794fa59cb859fdea44f236.jpg",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/c7ab685ce07d86d540047a034b898bdec8564bdf/5ab519305b00d8d536a3c40535cc496a.jpg",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/c7ab685ce07d86d540047a034b898bdec8564bdf/72e8cf1940a5e75e7cd2c958e75ba057.jpg",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/c7ab685ce07d86d540047a034b898bdec8564bdf/7cf4bcb0df1d8eae3c39ceb37958250e.jpg",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/c7ab685ce07d86d540047a034b898bdec8564bdf/a5bc88cfeea18e59f22446e62199eb09.jpg",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/c7ab685ce07d86d540047a034b898bdec8564bdf/be0af833d6d39c1e7e2bf33bcd45e691.jpg",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/c7ab685ce07d86d540047a034b898bdec8564bdf/c8052674a79b97923d42dd2384470875.jpg",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/c7ab685ce07d86d540047a034b898bdec8564bdf/cb930a308c8ee9b5f6ebf40c6678bbcc.jpg"
];

export const AUDIO_RECORDINGS = [
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/main/2025%E5%B9%B412%E6%9C%8811%E6%97%A5%2015%E7%82%B954%E5%88%86(3).m4a",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/main/%E6%96%B0%E5%BD%95%E9%9F%B3%208.m4a",
  "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/main/%E6%96%B0%E5%BD%95%E9%9F%B3.m4a"
];

export const BGM_URL = "https://raw.githubusercontent.com/jujuwuwao/hailey-s-birthday/main/obj_w5rDlsOJwrLDjj7CmsOj_44954434807_c3e2_f508_0585_ea5d95f942969c2851e9604246e4b250.m4a";

export const ORNAMENT_COLORS = [
  "#D4AF37", // Retro Gold
  "#800020", // Burgundy
  "#778899", // Grey Blue
  "#B76E79", // Rose Pink
  "#F7E7CE"  // Champagne
];

// Generate 24 photos by repeating the list
export const FULL_PHOTO_LIST = Array(24).fill(null).map((_, i) => PHOTO_URLS[i % PHOTO_URLS.length]);
