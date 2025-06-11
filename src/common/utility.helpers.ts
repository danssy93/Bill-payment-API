/* eslint-disable @typescript-eslint/no-explicit-any */
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID, createHmac } from 'crypto';
import moment from 'moment-timezone';
import { CONFIGURATION } from 'src/libs';

export class Helpers {
  /**
   * @param {string} algorithm - Hashing algorithm (e.g., 'sha256', 'sha512')
   * @param {string} requestBody - The request body to hash
   * @returns {string} - The computed HMAC hash
   */
  static calculateHMAC(
    algorithm: 'sha256' | 'sha512',
    message: any,
    key: string,
  ): string {
    return createHmac(algorithm, key).update(message, 'utf-8').digest('hex');
  }

  static generateRandomDigits(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join(
      '',
    );
  }

  static verifyHMAC(
    algorithm: 'sha256' | 'sha512',
    message: any,
    receivedHmac: string,
    key: string,
  ): boolean {
    const calculatedHmac = Helpers.calculateHMAC(algorithm, message, key);

    if (calculatedHmac === receivedHmac) {
      return true;
    }

    return false;
  }

  static generateOtpCode(length = 6) {
    if (CONFIGURATION.PROVIDER_MODE.OTP.toLowerCase() == 'sandbox') {
      return '123456';
    }

    const charset = '0123456789';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  static generateRequestId() {
    const watDate = new Date();
    const year = watDate.getFullYear().toString();
    const month = (watDate.getMonth() + 1).toString().padStart(2, '0');
    const day = watDate.getDate().toString().padStart(2, '0');
    const hours = watDate.getHours().toString().padStart(2, '0');
    const minutes = watDate.getMinutes().toString().padStart(2, '0');

    const randomValue = Math.floor(Math.random() * 9999999999);
    return `${year}${month}${day}${hours}${minutes}${randomValue}`;
  }

  static generatPaymentReference() {
    const paymentRef = `STSH-${randomUUID().replace(/-/g, '').toUpperCase()}-BX`;
    return paymentRef;
  }

  static getWATDateTimestamp(): string {
    const currentTime = moment().tz(CONFIGURATION.APP.TIMEZONE);
    return currentTime.format('YYYY-MM-DD HH:mm:ss');
  }

  static getDeviceInfo = (userAgent) => {
    if (!userAgent) return 'Unknown';

    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Macintosh')) return 'MacOS';
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('Android')) return 'Android';

    return 'Other';
  };

  static isDebtMeter(meterDebt: string | null | number): boolean {
    return !(
      meterDebt === 'N/A' ||
      meterDebt === '' ||
      meterDebt === null ||
      meterDebt === 0
    );
  }

  static sumAmountFormatter = (
    actualAmount: number,
    amountToBeAdded: number,
  ) => {
    const formattedActualAmountInKobo = Math.round(actualAmount * 100);

    const formattedAmountToBeAddedInKobo = Math.round(amountToBeAdded * 100);

    const totalAmountInKobo =
      formattedActualAmountInKobo + formattedAmountToBeAddedInKobo;

    const totalAmount = (totalAmountInKobo / 100).toFixed(2);

    return Number(totalAmount);
  };

  static subtractAmountFormatter = (
    actualAmount: number,
    deductableAmount: number,
  ) => {
    const formattedActualAmountInKobo = Math.round(actualAmount * 100);

    const formattedDeductableAmountInKobo = Math.round(deductableAmount * 100);

    const totalAmountInKobo =
      formattedActualAmountInKobo - formattedDeductableAmountInKobo;

    const totalAmount = (totalAmountInKobo / 100).toFixed(2);

    return Number(totalAmount);
  };

  static async fetchMockfile(filePath: string, fileName: string) {
    const originalFile = path.join(process.cwd(), filePath, fileName);

    const response = await fs.readFile(originalFile, 'utf-8');

    return JSON.parse(response);
  }

  static maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length <= 3) return accountNumber;
    const visible = accountNumber.slice(0, 3);
    const masked = '*'.repeat(accountNumber.length - 3);
    return visible + masked;
  }
}
