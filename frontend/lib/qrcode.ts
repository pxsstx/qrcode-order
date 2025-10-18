import QRCode from "qrcode";

/**
 * Generate a QR code data URL from any string (e.g. table code, order link)
 * @param text The text or URL to encode into a QR code
 * @returns Promise<string> base64 data URL for the QR image
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR code:", err);
    throw err;
  }
};
