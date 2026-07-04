export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/konto", "/kunden"],
      },
    ],
    sitemap: "https://www.feliixwxf.de/sitemap.xml",
  };
}
