import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["userId"], //track based on clerk userId
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 10,
            interval: 2400,
            capacity: 10,
        }),
    ],
});

export default aj;