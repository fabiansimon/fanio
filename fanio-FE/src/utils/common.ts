export class DateUtils {
  static formatDate(date: Date) {
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

    return `${readableDate} ${readableTime}`;
  }

  static formatTime(time: number, postfix?: string) {
    // const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(Math.floor(time % 60)).padStart(2, '0');
    const milliSeconds = String(Math.round((time % 1) * 1000)).padStart(3, '0');

    return `${seconds}:${milliSeconds} ${postfix}`;
  }
}
