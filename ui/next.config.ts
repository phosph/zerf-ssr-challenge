import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* I disabled strict Mode here due to double render issue with Shift4. */
  reactStrictMode: false,
};

export default nextConfig;
