/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/pokemon-logo.svg",
                headers: [
                    {
                        key: "Link",
                        value: "</pokemon-logo.svg>; rel=preload; as=image",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
