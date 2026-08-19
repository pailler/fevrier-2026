export const PHOTOBOOTH_PRODUCT_NAME = 'Photobooth';
export const PHOTOBOOTH_MODULE_TITLE = 'Photobooth IA';

export function getPhotoboothModuleDisplayTitle(module?: { title?: string; id?: string }): string {
  if (module?.title) {
    return module.title;
  }
  return PHOTOBOOTH_MODULE_TITLE;
}
