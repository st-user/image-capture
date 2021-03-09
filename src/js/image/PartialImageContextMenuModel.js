import { CommonEventDispatcher } from 'vncho-lib';

import { CustomEventNames } from '../common/CustomEventNames.js';

export default class PartialImageContextMenuModel {

    #selectedImageId;
    #selectedImageXY;
    #expectedZIndex;

    showContextMenu(selectedImageId, x, y, zIndex) {
        this.#selectedImageId = selectedImageId;
        this.#selectedImageXY = { x, y };
        this.#expectedZIndex = zIndex;
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__TOGGLE_CONTEXT_MENU);
    }

    deletePartialImage() {
        const id = this.#selectedImageId;
        this.#clearInfo();
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__DELETE_PARTIAL_IMAGE, {
            id
        });
    }

    downloadPartialImage() {
        const id = this.#selectedImageId;
        this.#clearInfo();
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__DOWNLOAD_PARTIAL_IMAGE, {
            id
        });
    }

    hideContextMenu() {
        if (!this.isContextMenuVisible()) {
            return;
        }
        this.#clearInfo();
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__TOGGLE_CONTEXT_MENU);
    }

    isContextMenuVisible() {
        return !!this.#selectedImageId;
    }

    getSelectedImageId() {
        return this.#selectedImageId;
    }

    getSelectedImageXY() {
        return this.#selectedImageXY;
    }

    getZIndex() {
        return this.#expectedZIndex;
    }

    #clearInfo() {
        this.#selectedImageId = undefined;
        this.#selectedImageXY = undefined;
        this.#expectedZIndex = 0;
    }
}