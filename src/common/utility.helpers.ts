/* eslint-disable @typescript-eslint/no-explicit-any */
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';
import moment from 'moment-timezone';
import { CONFIGURATION } from 'src/libs';

export class Helpers {
  static generatReference() {
    const paymentRef = `${randomUUID().replace(/-/g, '').toUpperCase()}`;
    return paymentRef;
  }

  static getWATDateTimestamp(): string {
    const currentTime = moment().tz(CONFIGURATION.APP.TIMEZONE);
    return currentTime.format('YYYY-MM-DD HH:mm:ss');
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
}
