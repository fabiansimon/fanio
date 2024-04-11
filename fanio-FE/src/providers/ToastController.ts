import {ToastType} from '../types';

export default class ToastController {
  static ref: any;
  static setRef = (ref: any) => (this.ref = ref);

  static showErrorToast = (title?: string, desciption?: string) =>
    this.ref.current?.showToast(ToastType.ERROR, title, desciption);

  static showSuccessToast = (title?: string, desciption?: string) =>
    this.ref.current?.showToast(ToastType.SUCCESS, title, desciption);

  static hideToast = () => this.ref.current?.hide();
}
