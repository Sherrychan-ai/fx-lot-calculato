import type { NextConfig } from "next";

/**
 * 静的サイトとして書き出す（GitHub Pages / 任意の静的ホスティングに配置可能）。
 * サブパス配下に置く場合は NEXT_PUBLIC_BASE_PATH（例: /20260426_test）を指定する。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
