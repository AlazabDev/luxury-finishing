export interface CloudinaryConfig {
  cloudName: string;
  assetFolder: string;
  uploadPreset?: string;
  useAssetFolderAsPublicIdPrefix: boolean;
}

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  aspectRatio?: string;
  quality?: string;
  format?: string;
  dpr?: string;
  effects?: string[];
  flags?: string[];
}

export interface ResponsiveImageDescriptor {
  src: string;
  srcSet: string;
  sizes: string;
}

export interface ResponsiveImageOptions {
  widths: number[];
  sizes: string;
  transform?: CloudinaryTransformOptions;
}

const env = import.meta.env;

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (!value) return fallback;
  return value.trim().toLowerCase() !== "false";
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

export const cloudinaryConfig: CloudinaryConfig = {
  cloudName: env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || "dn4ne1ep1",
  assetFolder: trimSlashes(env.VITE_CLOUDINARY_ASSET_FOLDER?.trim() || "luxury-finishing"),
  uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim(),
  useAssetFolderAsPublicIdPrefix: toBoolean(env.VITE_CLOUDINARY_USE_ASSET_FOLDER_PREFIX, true),
};

export const cloudinaryUploadDefaults = Object.freeze({
  overwrite: false,
  useFilename: true,
  uniqueFilename: false,
  useAssetFolderAsPublicIdPrefix: true,
  assetFolder: cloudinaryConfig.assetFolder,
});

export const resolveCloudinaryPublicId = (
  publicId: string,
  config: CloudinaryConfig = cloudinaryConfig,
) => {
  const normalized = trimSlashes(publicId);

  if (!normalized) {
    throw new Error("Cloudinary public ID is required.");
  }

  if (!config.useAssetFolderAsPublicIdPrefix || !config.assetFolder) {
    return normalized;
  }

  if (normalized.startsWith(`${config.assetFolder}/`) || normalized === config.assetFolder) {
    return normalized;
  }

  return `${config.assetFolder}/${normalized}`;
};

const buildTransformString = (options: CloudinaryTransformOptions = {}) => {
  const {
    width,
    height,
    crop,
    gravity,
    aspectRatio,
    quality = "auto:good",
    format = "auto",
    dpr = "auto",
    effects = [],
    flags = [],
  } = options;

  const transforms = [
    format ? `f_${format}` : null,
    quality ? `q_${quality}` : null,
    dpr ? `dpr_${dpr}` : null,
    crop ? `c_${crop}` : null,
    gravity ? `g_${gravity}` : null,
    aspectRatio ? `ar_${aspectRatio}` : null,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    ...effects.filter(Boolean).map((effect) => `e_${effect}`),
    ...flags.filter(Boolean).map((flag) => `fl_${flag}`),
  ].filter(Boolean);

  return transforms.join(",");
};

export const createCloudinaryUrl = (
  publicId: string,
  options: CloudinaryTransformOptions = {},
  config: CloudinaryConfig = cloudinaryConfig,
) => {
  const transforms = buildTransformString(options);
  const assetPath = resolveCloudinaryPublicId(publicId, config);
  const baseUrl = `https://res.cloudinary.com/${config.cloudName}/image/upload`;

  return transforms ? `${baseUrl}/${transforms}/${assetPath}` : `${baseUrl}/${assetPath}`;
};

export const createResponsiveImage = (
  publicId: string,
  { widths, sizes, transform = {} }: ResponsiveImageOptions,
): ResponsiveImageDescriptor => {
  const normalizedWidths = [...new Set(widths)].sort((left, right) => left - right);
  const largestWidth = normalizedWidths[normalizedWidths.length - 1];

  return {
    src: createCloudinaryUrl(publicId, { ...transform, width: largestWidth }),
    srcSet: normalizedWidths
      .map((width) => `${createCloudinaryUrl(publicId, { ...transform, width })} ${width}w`)
      .join(", "),
    sizes,
  };
};

export const getHeroBackgroundImage = (publicId: string) =>
  createCloudinaryUrl(publicId, {
    width: 1920,
    height: 1280,
    crop: "fill",
    gravity: "auto",
    quality: "auto:best",
  });

export const getCtaBackgroundImage = (publicId: string) =>
  createCloudinaryUrl(publicId, {
    width: 1600,
    height: 900,
    crop: "fill",
    gravity: "auto",
    quality: "auto:best",
  });

export const getProjectCoverImage = (publicId: string) =>
  createResponsiveImage(publicId, {
    widths: [480, 768, 960, 1280],
    sizes: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
    transform: {
      crop: "fill",
      gravity: "auto",
      aspectRatio: "4:3",
    },
  });

export const getProjectPreviewThumb = (publicId: string) =>
  createResponsiveImage(publicId, {
    widths: [128, 256],
    sizes: "56px",
    transform: {
      crop: "fill",
      gravity: "auto",
      aspectRatio: "1:1",
    },
  });

export const getGalleryImage = (publicId: string) =>
  createResponsiveImage(publicId, {
    widths: [480, 768, 960, 1280],
    sizes: "(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
    transform: {
      crop: "limit",
      quality: "auto:good",
    },
  });

export const getArticleCardImage = (publicId: string) =>
  createResponsiveImage(publicId, {
    widths: [480, 768, 1024],
    sizes: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
    transform: {
      crop: "fill",
      gravity: "auto",
      aspectRatio: "16:9",
    },
  });

export const getEditorialImage = (publicId: string) =>
  createResponsiveImage(publicId, {
    widths: [480, 768, 1024],
    sizes: "(min-width: 1024px) 50vw, 100vw",
    transform: {
      crop: "fill",
      gravity: "auto",
      aspectRatio: "5:4",
    },
  });

export const getPortraitImage = (publicId: string) =>
  createResponsiveImage(publicId, {
    widths: [320, 480, 640],
    sizes: "(min-width: 768px) 33vw, 100vw",
    transform: {
      crop: "fill",
      gravity: "auto",
      aspectRatio: "3:2",
    },
  });

export const getServiceImage = (publicId: string) =>
  createResponsiveImage(publicId, {
    widths: [480, 768, 1024],
    sizes: "(min-width: 1024px) 50vw, 100vw",
    transform: {
      crop: "fill",
      gravity: "auto",
      aspectRatio: "16:9",
    },
  });

export const getLightboxImage = (publicId: string) =>
  createResponsiveImage(publicId, {
    widths: [960, 1440, 1920],
    sizes: "100vw",
    transform: {
      crop: "limit",
      quality: "auto:best",
    },
  });

export const getLightboxThumbnail = (publicId: string) =>
  createResponsiveImage(publicId, {
    widths: [128, 256],
    sizes: "64px",
    transform: {
      crop: "fill",
      gravity: "auto",
      aspectRatio: "1:1",
    },
  });

export const getDownloadImage = (publicId: string) =>
  createCloudinaryUrl(publicId, {
    quality: "auto:best",
  });

export const uploadToCloudinary = async (
  file: File,
  options: {
    publicId?: string;
    assetFolder?: string;
    uploadPreset?: string;
    tags?: string[];
    signal?: AbortSignal;
  } = {},
) => {
  const uploadPreset = options.uploadPreset || cloudinaryConfig.uploadPreset;

  if (!uploadPreset) {
    throw new Error("Missing Cloudinary upload preset. Set VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("asset_folder", options.assetFolder || cloudinaryConfig.assetFolder);
  formData.append("overwrite", String(cloudinaryUploadDefaults.overwrite));
  formData.append("use_filename", String(cloudinaryUploadDefaults.useFilename));
  formData.append("unique_filename", String(cloudinaryUploadDefaults.uniqueFilename));

  if (options.publicId) {
    formData.append("public_id", trimSlashes(options.publicId));
  }

  if (options.tags?.length) {
    formData.append("tags", options.tags.join(","));
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
      signal: options.signal,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  return response.json();
};
