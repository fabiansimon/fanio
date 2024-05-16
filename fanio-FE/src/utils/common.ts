import clsx, {ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export class DateUtils {
  static formatDate(date: Date, ignoreTime: boolean = false) {
    const _date = new Date(date);
    const readableDate = _date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const readableTime = _date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    return `${readableDate} ${!ignoreTime ? readableTime : ''}`.trim();
  }

  static formatTime(time: number, postfix: string = '') {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(Math.floor(time % 60)).padStart(2, '0');
    const milliSeconds = String(Math.round((time % 1) * 1000)).padStart(3, '0');

    return `${minutes}:${seconds}:${milliSeconds} ${postfix}`;
  }

  static formatSeconds(seconds: number, postfix: string = '') {
    return `${new Date(seconds * 1000)
      .toISOString()
      .substring(14, 19)} ${postfix}`;
  }
}

export class UI {
  static cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }

  static formatNumber(number: number) {
    if (!number) return number;
    return number.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  static formatPoints(points: number, postfix = 'pts') {
    const formattedPoints = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(points);

    return `${formattedPoints} ${postfix}`;
  }

  static formatName({
    firstName = '',
    lastName = '',
    initals = false,
  }: {
    firstName?: string;
    lastName?: string;
    initals?: boolean;
  }) {
    return `${initals ? firstName[0] : firstName}${initals ? '' : ' '}${
      lastName[0]
    }${initals ? '' : '.'}`;
  }

  static addAlpha(color: string, opacity: number): string {
    const op = Math.round(opacity * 255);
    const hexOpacity = op.toString(16).padStart(2, '0').toUpperCase();
    return color + hexOpacity;
  }
}
