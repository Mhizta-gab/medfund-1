import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Enable WebAssembly support needed for Lucid/Cardano libraries
  webpack: (config) => {
    // Enable loading WebAssembly modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Add rule to handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    // Provide fallbacks for Node.js modules that might be imported in browser context
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      querystring: false,
    };

    return config;
  },
};

export default nextConfig;
