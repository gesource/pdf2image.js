/* eslint-disable no-await-in-loop */
import PDFJS from 'pdfjs-dist';

class Pdf2Image {
  /**
   * @param {string} pdfUrl PDFのURL
   * @return {Pdf2Image} Pdf2Imageのインスタンスを返す
   */
  static async open(pdfUrl) {
    const pdfDoc = await PDFJS.getDocument({ url: pdfUrl }).promise;
    return new Pdf2Image(pdfDoc);
  }

  /**
   * @param {PDFJS.PDFDocumentProxy} pdfDoc
   */
  constructor(pdfDoc) {
    this.pdfDoc = pdfDoc;
  }

  /**
   * @return {Number} ページ数
   */
  numPages() {
    return this.pdfDoc.numPages;
  }

  /**
   * PDFの指定ページを画像にし、画像のDataUrlを返す
   * @param {Number} pageNo ページ番号(1〜)
   * @param {Object} option
   *                  {scale:画像の倍率}, 画像を指定した倍率で拡大する
   *                  {width:最大幅, height:最大高さ} 画像を指定した領域に収まるサイズにする
   *                  {image:'jpeg|webp|png|'} 画像フォーマット
   * @return {String} ページ画像のDataUrl
   */
  async getImageDataUrl(pageNo, option) {
    const page = await this.pdfDoc.getPage(pageNo);
    const scale = Pdf2Image.calcScale(page, option);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvasContext.height = viewport.height;
    canvasContext.width = viewport.width;

    const renderContext = {
      canvasContext,
      viewport,
    };
    await page.render(renderContext).promise;
    switch (option.image) {
      case 'jpeg':
        return canvas.toDataURL('image/jpeg');
      case 'webp':
        return canvas.toDataURL('image/webp');
      default:
        return canvas.toDataURL();
    }
  }

  /**
   *
   * @param {PDFJS.PDFPageProxy} page
   * @param {Object} option
   *                  {scale:画像の倍率}, 画像を指定した倍率で拡大する
   *                  {width:最大幅, height:最大高さ} 画像を指定した領域に収まるサイズにする
   * @return {Number} 倍率
   */
  static calcScale(page, option) {
    if (option.scale !== undefined) {
      return option.scale;
    }
    if (option.width === undefined || option.height === undefined) {
      return 1.0;
    }
    const viewport = page.getViewport({ scale: 1.0 });
    return Math.min(option.width / viewport.width, option.height / viewport.height);
  }

  /**
   * PDFのすべてのページを画像にし、画像のDataUrlを返す
   * @param {Object} option
   *                  {scale:画像の倍率}, 画像を指定した倍率で拡大する
   *                  {width:最大幅, height:最大高さ} 画像を指定した領域に収まるサイズにする
   * @return {String[]} ページ画像のDataUrl
   */
  async getAllImageDataUrl(option) {
    const pages = [];
    const numPages = this.numPages();
    for (let i = 1; i <= numPages; i += 1) {
      const img = await this.getImageDataUrl(i, option);
      pages.push(img);
    }
    return pages;
  }
}

export default Pdf2Image;
