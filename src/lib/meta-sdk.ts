const FACEBOOK_SDK_ID = "facebook-jssdk";
const FACEBOOK_SDK_URL = "https://connect.facebook.net/en_US/sdk.js";

export interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: number | string;
  signedRequest: string;
  userID: string;
}

export interface FacebookLoginStatus {
  status: "connected" | "not_authorized" | "unknown" | string;
  authResponse?: FacebookAuthResponse;
}

interface FacebookSdkInitOptions {
  appId: string;
  version: string;
}

interface FacebookSdk {
  init: (options: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }) => void;
  getLoginStatus: (callback: (response: FacebookLoginStatus) => void) => void;
  login: (
    callback: (response: FacebookLoginStatus) => void,
    options?: { scope?: string; return_scopes?: boolean },
  ) => void;
  AppEvents?: {
    logPageView: () => void;
  };
}

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

let sdkLoadPromise: Promise<FacebookSdk> | null = null;

const ensureSdkScript = () => {
  const existingScript = document.getElementById(FACEBOOK_SDK_ID);
  if (existingScript) return;

  const script = document.createElement("script");
  script.id = FACEBOOK_SDK_ID;
  script.async = true;
  script.defer = true;
  script.crossOrigin = "anonymous";
  script.src = FACEBOOK_SDK_URL;
  document.body.appendChild(script);
};

export const loadFacebookSdk = ({ appId, version }: FacebookSdkInitOptions) => {
  if (!appId) {
    return Promise.reject(new Error("Facebook app id is required"));
  }

  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<FacebookSdk>((resolve, reject) => {
    window.fbAsyncInit = () => {
      if (!window.FB) {
        reject(new Error("Facebook SDK did not initialize correctly"));
        return;
      }

      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version,
      });

      window.FB.AppEvents?.logPageView?.();
      resolve(window.FB);
    };

    ensureSdkScript();

    const watchdog = window.setTimeout(() => {
      reject(new Error("Facebook SDK load timed out"));
    }, 15000);

    const originalInit = window.fbAsyncInit;
    window.fbAsyncInit = () => {
      window.clearTimeout(watchdog);
      originalInit?.();
    };
  });

  return sdkLoadPromise;
};

export const initializeFacebookSdk = async () => {
  const appId = import.meta.env.VITE_FB_APP_ID;
  const version = import.meta.env.VITE_FB_API_VERSION || "v22.0";

  if (!appId) return null;

  return loadFacebookSdk({ appId, version });
};

export const getFacebookLoginStatus = async () => {
  const sdk = await initializeFacebookSdk();

  if (!sdk) return null;

  return new Promise<FacebookLoginStatus>((resolve) => {
    sdk.getLoginStatus((response) => resolve(response));
  });
};

export const loginWithFacebook = async (scopes: string[] = []) => {
  const sdk = await initializeFacebookSdk();

  if (!sdk) return null;

  return new Promise<FacebookLoginStatus>((resolve) => {
    sdk.login(
      (response) => resolve(response),
      {
        scope: scopes.join(","),
        return_scopes: true,
      },
    );
  });
};
