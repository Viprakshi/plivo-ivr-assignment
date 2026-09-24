const plivo = require("plivo");
const config = require("./config");

/*
 * Step 1:
 * Call is answered and caller is asked for OTP.
 */
function answerXml() {
    const response = plivo.Response();

    const getDigits = response.addGetDigits({
        action: `${config.baseUrl}/verify-otp`,
        method: "POST",
        numDigits: 4,
        timeout: 10,
        digitTimeout: 3,
        finishOnKey: ""
    });

    getDigits.addSpeak(
        "Welcome to InspireWorks. " +
        "Please enter your four digit OTP."
    );

    response.addSpeak(
        "We did not receive your OTP. Please try again."
    );

    response.addRedirect(`${config.baseUrl}/answer`);

    return response.toXML();
}


/*
 * Step 2:
 * Verify OTP.
 */
function verifyOtpXml(digits) {
    const response = plivo.Response();

    if (digits === config.otp) {

        response.addSpeak(
            "Your identity has been successfully verified."
        );

        const getDigits = response.addGetDigits({
            action: `${config.baseUrl}/language`,
            method: "POST",
            numDigits: 1,
            timeout: 10,
            digitTimeout: 3,
            finishOnKey: ""
        });

        getDigits.addSpeak(
            "Please select your language. " +
            "Press 1 for English. " +
            "Press 2 for Spanish."
        );

        response.addSpeak(
            "We did not receive a valid selection."
        );

        response.addRedirect(`${config.baseUrl}/language`);

    } else {

        response.addSpeak(
            "The OTP you entered is incorrect. " +
            "Please try again."
        );

        const getDigits = response.addGetDigits({
            action: `${config.baseUrl}/verify-otp`,
            method: "POST",
            numDigits: 4,
            timeout: 10,
            digitTimeout: 3,
            finishOnKey: ""
        });

        getDigits.addSpeak(
            "Please enter your four digit OTP."
        );
    }

    return response.toXML();
}


/*
 * Step 3:
 * Language selection.
 */
function languageXml(digits) {

    if (digits === "1") {
        return levelTwoXml("en");
    }

    if (digits === "2") {
        return levelTwoXml("es");
    }

    const response = plivo.Response();

    response.addSpeak(
        "Invalid selection. Please try again."
    );

    const getDigits = response.addGetDigits({
        action: `${config.baseUrl}/language`,
        method: "POST",
        numDigits: 1,
        timeout: 10,
        digitTimeout: 3,
        finishOnKey: ""
    });

    getDigits.addSpeak(
        "Please select your language. " +
        "Press 1 for English. " +
        "Press 2 for Spanish."
    );

    return response.toXML();
}


/*
 * Step 4:
 * Level 2 menu.
 */
function levelTwoXml(language) {

    const response = plivo.Response();

    const getDigits = response.addGetDigits({
        action: `${config.baseUrl}/action?language=${language}`,
        method: "POST",
        numDigits: 1,
        timeout: 10,
        digitTimeout: 3,
        finishOnKey: ""
    });

    if (language === "es") {

        getDigits.addSpeak(
            "Para escuchar nuestro mensaje, presione 1. " +
            "Para hablar con un asociado, presione 2."
        );

    } else {

        getDigits.addSpeak(
            "Press 1 to hear a short message. " +
            "Press 2 to speak to a live associate."
        );
    }

    return response.toXML();
}


/*
 * Step 5:
 * Level 2 action.
 */
function actionXml(digits, language) {

    const response = plivo.Response();

    const isSpanish = language === "es";

    /*
     * Press 1 -> Audio
     */
    if (digits === "1") {

        response.addSpeak(
            isSpanish
                ? "Gracias por llamar a InspireWorks."
                : "Thank you for calling InspireWorks."
        );

        response.addPlay(
            "https://s3.amazonaws.com/plivocloud/Trumpet.mp3"
        );

        response.addSpeak(
            isSpanish
                ? "Gracias. Adios."
                : "Thank you. Goodbye."
        );

        response.addHangup();

        return response.toXML();
    }


    /*
     * Press 2 -> Live associate
     */
    if (digits === "2") {

        response.addSpeak(
            isSpanish
                ? "Conectando con un asociado en vivo."
                : "Please hold while we connect you to a live associate."
        );

        const dial = response.addDial({
            callerId: config.plivoNumber
        });

        dial.addNumber(config.associateNumber);

        return response.toXML();
    }


    /*
     * Invalid input
     */
    response.addSpeak(
        isSpanish
            ? "Seleccion no valida. Intentelo de nuevo."
            : "Invalid selection. Please try again."
    );

    return levelTwoXml(language);
}


module.exports = {
    answerXml,
    verifyOtpXml,
    languageXml,
    actionXml
};