import * as qrcode from "qrcode";

export const generateQR = async (text: string) => {
  try {
    const result = await qrcode.toDataURL(text);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};
