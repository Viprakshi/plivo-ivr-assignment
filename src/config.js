require("dotenv").config();

const requiredVariables = [
    "PLIVO_AUTH_ID",
    "PLIVO_AUTH_TOKEN",
    "PLIVO_NUMBER",
    "TARGET_NUMBER",
    "ASSOCIATE_NUMBER",
    "OTP",
    "BASE_URL"
];

for (const variable of requiredVariables) {
    if (!process.env[variable]) {
        console.warn(`Warning: ${variable} is not configured.`);
    }
}

module.exports = {
    port: process.env.PORT || 3000,

    plivoAuthId: process.env.PLIVO_AUTH_ID,
    plivoAuthToken: process.env.PLIVO_AUTH_TOKEN,

    plivoNumber: process.env.PLIVO_NUMBER,
    targetNumber: process.env.TARGET_NUMBER,
    associateNumber: process.env.ASSOCIATE_NUMBER,

    otp: process.env.OTP,

    baseUrl: process.env.BASE_URL
};