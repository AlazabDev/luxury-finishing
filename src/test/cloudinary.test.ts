import {
  createCloudinaryUrl,
  resolveCloudinaryPublicId,
  cloudinaryUploadDefaults,
} from "@/lib/cloudinary";

describe("cloudinary helpers", () => {
  it("prefixes the asset folder once", () => {
    expect(
      resolveCloudinaryPublicId("shops/shops-001", {
        cloudName: "demo",
        assetFolder: "luxury-finishing",
        uploadPreset: "demo-preset",
        useAssetFolderAsPublicIdPrefix: true,
      }),
    ).toBe("luxury-finishing/shops/shops-001");

    expect(
      resolveCloudinaryPublicId("luxury-finishing/shops/shops-001", {
        cloudName: "demo",
        assetFolder: "luxury-finishing",
        uploadPreset: "demo-preset",
        useAssetFolderAsPublicIdPrefix: true,
      }),
    ).toBe("luxury-finishing/shops/shops-001");
  });

  it("builds secure transformed delivery URLs", () => {
    expect(
      createCloudinaryUrl(
        "retail-interiors/retail-interiors-001",
        {
          width: 960,
          crop: "fill",
          gravity: "auto",
          aspectRatio: "4:3",
        },
        {
          cloudName: "demo",
          assetFolder: "luxury-finishing",
          uploadPreset: "demo-preset",
          useAssetFolderAsPublicIdPrefix: true,
        },
      ),
    ).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto:good,dpr_auto,c_fill,g_auto,ar_4:3,w_960/luxury-finishing/retail-interiors/retail-interiors-001",
    );
  });

  it("matches the requested upload defaults", () => {
    expect(cloudinaryUploadDefaults).toMatchObject({
      overwrite: false,
      useFilename: true,
      uniqueFilename: false,
      useAssetFolderAsPublicIdPrefix: true,
      assetFolder: "luxury-finishing",
    });
  });
});
