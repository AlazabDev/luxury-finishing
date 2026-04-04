/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_ELEVENLABS_AGENT_ID?: string;
  readonly VITE_FB_APP_ID?: string;
  readonly VITE_FB_API_VERSION?: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  readonly VITE_CLOUDINARY_ASSET_FOLDER?: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string;
  readonly VITE_CLOUDINARY_USE_ASSET_FOLDER_PREFIX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
