const express = require("express");
const plivo = require("plivo");

const config = require("./config");

const {
    answerXml,
    verifyOtpXml,
    languageXml,
    actionXml
} = require("./ivr");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


/*
 * Health check
 */
app.get("/", (req, res) => {
    res.json({
        service: "Plivo IVR",
        status: "running"
    });
});


/*
 * Start outbound call
 */
app.post("/call", async (req, res) => {

    try {

        const targetNumber =
            req.body?.targetNumber || config.targetNumber;

        if (!targetNumber) {
            return res.status(400).json({
                success: false,
                error: "Target phone number is required."
            });
        }

        const client = new plivo.Client(
            config.plivoAuthId,
            config.plivoAuthToken
        );

        console.log(
            `Initiating call to ${targetNumber}`
        );

        const response = await client.calls.create(
            config.plivoNumber,
            targetNumber,
            `${config.baseUrl}/answer`,
            {
                answerMethod: "GET"
            }
        );

        console.log("Outbound call initiated.");

        res.json({
            success: true,
            message: "Outbound call initiated successfully.",
            requestUuid: response.requestUuid || null
        });

    } catch (error) {

        console.error(
            "Call failed:",
            error.message
        );

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


/*
 * Call answered
 */
app.all("/answer", (req, res) => {

    console.log("Call answered.");

    res.type("text/xml");

    res.send(answerXml());
});


/*
 * OTP verification
 */
app.all("/verify-otp", (req, res) => {

    const digits =
        req.body.Digits ||
        req.query.Digits ||
        "";

    console.log(
        `OTP received (${digits.length} digits)`
    );

    res.type("text/xml");

    res.send(
        verifyOtpXml(digits)
    );
});


/*
 * Language selection
 */
app.all("/language", (req, res) => {

    const digits =
        req.body.Digits ||
        req.query.Digits ||
        "";

    console.log(
        `Language selection: ${digits}`
    );

    res.type("text/xml");

    res.send(
        languageXml(digits)
    );
});


/*
 * Level 2 action
 */
app.all("/action", (req, res) => {

    const digits =
        req.body.Digits ||
        req.query.Digits ||
        "";

    const language =
        req.query.language || "en";

    console.log(
        `Action: ${digits}, Language: ${language}`
    );

    res.type("text/xml");

    res.send(
        actionXml(digits, language)
    );
});


/*
 * 404 handler
 */
app.use((req, res) => {

    res.status(404).json({
        success: false,
        error: "Endpoint not found."
    });
});


/*
 * Start server
 */
app.listen(config.port, () => {

    console.log("--------------------------------");
    console.log("       PLIVO IVR SERVER");
    console.log("--------------------------------");
    console.log(
        `Server: http://localhost:${config.port}`
    );
    console.log("--------------------------------");
});