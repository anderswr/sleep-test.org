/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    // Engelsk øverst, deretter alfabetisk. pt-BR beholdes som egen kode.
    locales: ["en","ar","de","es","fr","hi","ja","ko","nb","pt-BR","ru","sk","zh"],
    defaultLocale: "en",
    localeDetection: true,
  },
  trailingSlash: false,
};

module.exports = nextConfig;
