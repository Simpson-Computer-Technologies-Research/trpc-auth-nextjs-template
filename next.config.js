/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /*
    experimental: {
      ppr: true,
      optimizePackageImports: ["three", "react-three"],
    },
    */
  images: {
    remotePatterns: [{ hostname: "lh3.googleusercontent.com" }],
  },

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

module.exports = config;
