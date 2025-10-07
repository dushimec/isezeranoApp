
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error("Twilio environment variables not set");
}

const client = twilio(accountSid, authToken);

export const sendOtp = async (phoneNumber: string, otp: string) => {
  try {
    await client.messages.create({
      body: `Your OTP code is: ${otp}`,
      from: twilioPhoneNumber!,
      to: phoneNumber,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: "Failed to send OTP" };
  }
};
