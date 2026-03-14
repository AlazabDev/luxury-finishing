const BASE = "https://objectstorage.me-jeddah-1.oraclecloud.com/n/axwmiwn72of7/b/alazab-media/o/retail-interiors/retail-interiors-";

export const img = (n: number) => `${BASE}${String(n).padStart(3, "0")}.jpg`;

// Curated selections
export const HERO_IMAGE = img(1);
export const PROJECT_IMAGES = [img(10), img(20), img(30), img(40)];
export const SERVICE_IMAGES = [img(50), img(60), img(70), img(80), img(90)];
export const BLOG_IMAGES = [img(100), img(110), img(120)];
export const ABOUT_IMAGES = [img(5), img(15), img(25)];
export const GALLERY_IMAGES = Array.from({ length: 20 }, (_, i) => img(i * 3 + 1));
export const TESTIMONIAL_AVATARS = [img(130), img(140), img(150)];
