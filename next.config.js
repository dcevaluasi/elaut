/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {

  },
  // async redirects() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
  //       destination: "https://elaut-bppsdm.kkp.go.id/:path*",
  //       permanent: true,
  //     },
  //   ];
  // },
}

module.exports = nextConfig
