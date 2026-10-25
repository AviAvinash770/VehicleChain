import QRCode from "qrcode";
import { config } from "../config/env";

export class QrService {
  /**
   * Generates a QR Code as a Data URL for public vehicle verification
   */
  static async generateVerificationQr(vehicleId: string): Promise<string> {
    const verificationUrl = `${config.clientUrl}/verify/${encodeURIComponent(vehicleId)}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      scale: 8,
      color: {
        dark: "#0f172a", // Dark slate
        light: "#ffffff",
      },
    });
    return qrDataUrl;
  }
}
