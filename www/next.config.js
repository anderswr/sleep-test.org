/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en","ar","de","es","fr","hi","ja","ko","nb","pt-BR","ru","sk","zh"],
    defaultLocale: "en",
    localeDetection: true,
  },
  trailingSlash: false,
  // Sørger for at Next export fungerer bedre
  output: "standalone",
};

module.exports = nextConfig;

// 👇 Middleware matcher legges til i egen eksport
module.exports.middleware = {
  matcher: ["/"], // kun på rot, ikke på /api eller andre paths
};
