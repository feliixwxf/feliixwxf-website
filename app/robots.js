export default function robots() {
  return {
    rules: [
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/konto", "/kunden"],
      },
    ],
    sitemap: "https://www.feliixwxf.de/sitemap.xml",
  };
}
