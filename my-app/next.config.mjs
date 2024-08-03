/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async function () {
    return [
      {
        source: "/api/:path*",
        destination: `http://localhost:3000/api/:path*`, // The :path parameter is used here so will not be automatically passed in the query
      },
    ];
  },
  images: {
    domains: ["picsum.photos"],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */

// const proxyURL = process.env.BACKEND_PROXY_URL;
// if (!proxyURL)
//   throw new Error("BACKEND_PROXY_URL environment variable is not set");

// const nextConfig = {
//   rewrites: async function () {
//     return [
//       {
//         source: "/api/:path*",
//         destination: `${proxyURL}/:path*`, // The :path parameter is used here so will not be automatically passed in the query
//       },
//     ];
//   },
//   images: {
//     domains: ["picsum.photos"],
//   },
// };

// module.exports = nextConfig;
