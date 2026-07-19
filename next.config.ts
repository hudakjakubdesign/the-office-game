import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryPath = "/Grayling";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubActions ? repositoryPath : "",
  assetPrefix: isGitHubActions ? repositoryPath : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
