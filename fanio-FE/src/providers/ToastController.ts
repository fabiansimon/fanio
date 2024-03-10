export default class ToastController {
  static ref: any;
  static setRef = (ref: any) => (this.ref = ref);
  static showErrorToast = (title?: string, desciption?: string) =>
    this.ref.current?.showErrorToast(title, desciption);
  static hideToast = () => this.ref.current?.hide();
}
