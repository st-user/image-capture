import { CommonEventDispatcher, DOM } from 'vncho-lib';
import { CustomEventNames } from '../common/CustomEventNames';

export default class PartialImageContextMenuView {

    #partialImageContextMenuModel;

    #$partialImageContextMenu;
    #$deletePartialImage;
    #$downloadPartialImage;

    constructor(partialImageContextMenuModel) {
        this.#partialImageContextMenuModel = partialImageContextMenuModel;

        this.#$partialImageContextMenu = DOM.query('#partialImageContextMenu');
        this.#$deletePartialImage = DOM.query('#deletePartialImage');
        this.#$downloadPartialImage = DOM.query('#downloadPartialImage');
    }

    setUpEvents() {
        DOM.click(this.#$partialImageContextMenu, event => event.stopPropagation());
        DOM.click(this.#$deletePartialImage, event => {
            event.preventDefault();
            this.#partialImageContextMenuModel.deletePartialImage(); 
        });
        DOM.click(this.#$downloadPartialImage, event => {
            event.preventDefault();
            this.#partialImageContextMenuModel.downloadPartialImage();
        });

        DOM.click(window, () => {
            this.#partialImageContextMenuModel.hideContextMenu();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__TOGGLE_CONTEXT_MENU, () => {
            this.#render();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__DELETE_PARTIAL_IMAGE, () => {
            this.#render();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__DOWNLOAD_PARTIAL_IMAGE, () => {
            this.#render();
        });

        this.#render();
    }

    #render() {
        DOM.display(this.#$partialImageContextMenu, this.#partialImageContextMenuModel.isContextMenuVisible());
        if (this.#partialImageContextMenuModel.isContextMenuVisible()) {
            const { x, y } = this.#partialImageContextMenuModel.getSelectedImageXY();
            this.#$partialImageContextMenu.style.top = `${y}px`;
            this.#$partialImageContextMenu.style.left = `${x}px`;
            this.#$partialImageContextMenu.style['z-index'] = this.#partialImageContextMenuModel.getZIndex();
        }
    }
}