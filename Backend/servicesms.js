require("dotenv").config();
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (toPhone, message) => {
  try {
    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER,
      to: toPhone
    });

    console.log("SMS sent! SID:", msg.sid);
    return msg.sid;
  } catch (error) {
    console.error("Full Twilio error:", error);           // ← more detailed
    console.error("Status:", error.status);               // usually 401
    console.error("Code:", error.code);                   // usually 20003
    console.error("Message:", error.message);             // "Authenticate"
    throw error;
  }
};

module.exports = sendSMS;