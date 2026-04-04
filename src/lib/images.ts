const buildImageSequence = (
  prefix: string,
  count: number,
  options: {
    pad?: number;
    separator?: string;
    exclude?: number[];
  } = {},
) => {
  const {
    pad = 0,
    separator = "-",
    exclude = [],
  } = options;

  const excluded = new Set(exclude);

  return Array.from({ length: count }, (_, index) => index + 1)
    .filter((value) => !excluded.has(value))
    .map((value) => {
      const suffix = pad ? String(value).padStart(pad, "0") : String(value);
      return `${prefix}${separator}${suffix}`;
    });
};

export interface GalleryProject {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  coverImageId: string;
  imageIds: string[];
  description: string;
}

const retailImageIds = buildImageSequence("retail-interiors/retail-interiors", 389, {
  pad: 3,
  exclude: [57, 78, 79, 224],
});

const shopsImageIds = buildImageSequence("shops/shops", 151, {
  pad: 3,
});

const abuaufImageIds = buildImageSequence("abuauf/abuauf_", 49, {
  separator: "",
  exclude: [5],
});

export const ABOUT_HERO_ID = "about/about-18";
export const CTA_IMAGE_ID = "retail-interiors/retail-interiors-020";

export const galleryProjects: GalleryProject[] = [
  {
    id: "retail-1",
    title: "تشطيبات سكنية فاخرة - المجموعة الأولى",
    category: "تشطيبات سكنية",
    location: "القاهرة الكبرى",
    year: "2024",
    coverImageId: retailImageIds[0],
    imageIds: retailImageIds.slice(0, 50),
    description: "مجموعة متنوعة من مشاريع التشطيبات السكنية الفاخرة تشمل صالات معيشة وغرف نوم ومطابخ عصرية.",
  },
  {
    id: "retail-2",
    title: "تشطيبات سكنية فاخرة - المجموعة الثانية",
    category: "تشطيبات سكنية",
    location: "التجمع الخامس",
    year: "2024",
    coverImageId: retailImageIds[50],
    imageIds: retailImageIds.slice(50, 120),
    description: "مشاريع تشطيب راقية تتضمن أرضيات رخام وأسقف جبس بورد وإضاءة مخفية.",
  },
  {
    id: "retail-3",
    title: "تشطيبات سكنية فاخرة - المجموعة الثالثة",
    category: "تشطيبات سكنية",
    location: "الشيخ زايد",
    year: "2023",
    coverImageId: retailImageIds[120],
    imageIds: retailImageIds.slice(120, 200),
    description: "مشاريع فلل ودوبلكس بتصميمات عصرية وخامات أوروبية.",
  },
  {
    id: "retail-4",
    title: "تشطيبات سكنية فاخرة - المجموعة الرابعة",
    category: "تشطيبات سكنية",
    location: "المعادي والرحاب",
    year: "2023",
    coverImageId: retailImageIds[200],
    imageIds: retailImageIds.slice(200, 290),
    description: "تشطيبات داخلية عالية الجودة لشقق فاخرة وبنتهاوس.",
  },
  {
    id: "retail-5",
    title: "تشطيبات سكنية فاخرة - المجموعة الخامسة",
    category: "تشطيبات سكنية",
    location: "مدينة نصر والمهندسين",
    year: "2022",
    coverImageId: retailImageIds[290],
    imageIds: retailImageIds.slice(290),
    description: "أحدث مشاريعنا في التصميم الداخلي والتشطيبات المعمارية.",
  },
  {
    id: "shops-1",
    title: "تجهيز محلات تجارية - المجموعة الأولى",
    category: "محلات تجارية",
    location: "مواقع متعددة",
    year: "2024",
    coverImageId: shopsImageIds[0],
    imageIds: shopsImageIds.slice(0, 50),
    description: "تجهيز وتشطيب محلات تجارية بتصميمات جذابة وعصرية.",
  },
  {
    id: "shops-2",
    title: "تجهيز محلات تجارية - المجموعة الثانية",
    category: "محلات تجارية",
    location: "مولات ومراكز تجارية",
    year: "2023",
    coverImageId: shopsImageIds[50],
    imageIds: shopsImageIds.slice(50, 100),
    description: "تشطيبات محلات تجارية مع واجهات زجاجية وتصميمات داخلية مميزة.",
  },
  {
    id: "shops-3",
    title: "تجهيز محلات تجارية - المجموعة الثالثة",
    category: "محلات تجارية",
    location: "مناطق تجارية",
    year: "2023",
    coverImageId: shopsImageIds[100],
    imageIds: shopsImageIds.slice(100),
    description: "تجهيزات تجارية متكاملة من التصميم إلى التسليم.",
  },
  {
    id: "abuauf",
    title: "مشروع أبو عوف",
    category: "مشاريع خاصة",
    location: "فروع متعددة",
    year: "2024",
    coverImageId: abuaufImageIds[0],
    imageIds: abuaufImageIds,
    description: "تجهيز وتشطيب فروع أبو عوف بتصميمات مميزة تعكس هوية العلامة التجارية.",
  },
];

export const galleryCategories = ["الكل", "تشطيبات سكنية", "محلات تجارية", "مشاريع خاصة"];

export const totalImageCount =
  retailImageIds.length + shopsImageIds.length + abuaufImageIds.length;

export const HERO_IMAGE_ID = retailImageIds[0];
export const PROJECT_IMAGE_IDS = [
  retailImageIds[10],
  retailImageIds[60],
  retailImageIds[120],
  retailImageIds[200],
];
export const SERVICE_IMAGE_IDS = [
  retailImageIds[30],
  retailImageIds[80],
  retailImageIds[140],
  retailImageIds[180],
  retailImageIds[250],
];
export const BLOG_IMAGE_IDS = [
  retailImageIds[50],
  retailImageIds[100],
  retailImageIds[150],
];
export const ABOUT_IMAGE_IDS = [
  retailImageIds[5],
  retailImageIds[15],
  retailImageIds[25],
];
