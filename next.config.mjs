/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "5mb"
        },
        serverComponentsExternalPackages: ["@prisma/client"],

    }
};

export default nextConfig;
