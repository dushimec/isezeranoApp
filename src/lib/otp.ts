
// For demonstration purposes, we'll store OTPs in memory.
// In a production environment, you should use a more persistent storage like Redis.
const otpStore: { [key: string]: { code: string; expires: number } } = {};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOtp = (phoneNumber: string, code: string) => {
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
  otpStore[phoneNumber] = { code, expires };
};

export const verifyOtp = (phoneNumber: string, code: string) => {
  const storedOtp = otpStore[phoneNumber];
  if (!storedOtp) {
    return false;
  }

  if (Date.now() > storedOtp.expires) {
    delete otpStore[phoneNumber];
    return false;
  }

  if (storedOtp.code !== code) {
    return false;
  }

  delete otpStore[phoneNumber];
  return true;
};
