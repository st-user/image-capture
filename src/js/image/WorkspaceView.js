import { CommonEventDispatcher, debounce, DOM, HoverWindowView } from 'vncho-lib';

import { CustomEventNames } from '../common/CustomEventNames.js';
import PartialImageView from './PartialImageView.js';


export default class WorkspaceView {

    #workspaceModel;
    #partialImageContextMenuModel;

    #$workspace;

    #$workspaceNoContent;
    
    #$workspaceControls;
    #$startCapturing;
    #$pauseCapturing;
    #$resumeCapturing;
    #$stopCapturing;
    #$capturedScreenSize;
    #capturedScreenSizeView;

    #$videoCanvas;
    #partialImages;

    constructor(workspaceModel, partialImageContextMenuModel) {

        this.#workspaceModel = workspaceModel;
        this.#partialImageContextMenuModel = partialImageContextMenuModel;

        this.#$workspace = DOM.query('#workspace');

        this.#$workspaceNoContent = DOM.query('#workspaceNoContent');

        this.#$workspaceControls = DOM.query('#workspaceControls');
        this.#$startCapturing = DOM.query('#startCapturing');
        this.#$pauseCapturing = DOM.query('#pauseCapturing');
        this.#$resumeCapturing = DOM.query('#resumeCapturing');
        this.#$stopCapturing = DOM.query('#stopCapturing');
        this.#$capturedScreenSize = DOM.all('input[name="capturedSceenSize"]', this.#$workspaceControls);

        this.#capturedScreenSizeView = new HoverWindowView(
            CustomEventNames.IMAGE_CAPTURE__TOGGLE_SIZE_SETTING_AREA,
            '#toggleSizeSttingArea',
            '#sizeSttingArea'
        );

        this.#partialImages = new Map();
    }

    setUpEvents() {

        DOM.click(this.#$startCapturing, event => {
            event.preventDefault();
            this.#workspaceModel.startCapturing();
        });

        DOM.click(this.#$pauseCapturing, event => {
            event.preventDefault();
            this.#workspaceModel.pauseCapturing();
        });

        DOM.click(this.#$resumeCapturing, event => {
            event.preventDefault();
            this.#workspaceModel.resumeCapturing();
        });

        DOM.click(this.#$stopCapturing, event => {
            event.preventDefault();
            this.#workspaceModel.stopCapturing();
        });

        const changeCapturedScreenSize = $elem => {
            const value = $elem.value;
            this.#workspaceModel.changeCapturedScreenSize(value);
        };
        this.#$capturedScreenSize.forEach(
            $elem => DOM.change($elem, () => changeCapturedScreenSize($elem))
        );

        DOM.mousemove(document, event => {
            event.preventDefault();
            this.#workspaceModel.doCutting(event.pageX, event.pageY);
        });
        DOM.mouseup(document, event => {
            event.preventDefault();
            this.#workspaceModel.endCutting(event.pageX, event.pageY);
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__START_CAPTURING, () => {
            this.#render();
            this.#renderVideo();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__IMAGE_DATA_LOADED, () => {
            this.#resize();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__PAUSE_CAPTURING, () => {
            this.#render();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__RESUME_CAPTURING, () => {
            this.#render();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__STOP_CAPTURING, () => {
            this.#workspaceModel.stopCapturing();
            this.#render();
            this.#renderVideo();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__END_CUTTING, () => {
            this.#renderCutImage();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__CHANGE_CAPTURED_SCREEN_SIZE, () => {
            this.#resize();
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__DELETE_PARTIAL_IMAGE, event => {
            const { id } = event.detail;
            this.#removeParitalImage(id);
        });

        CommonEventDispatcher.on(CustomEventNames.IMAGE_CAPTURE__DOWNLOAD_PARTIAL_IMAGE, event => {
            const { id } = event.detail;
            this.#downloadParitalImage(id);
        });

        window.addEventListener('resize', debounce(() => {
            this.#resize();
        }, 500));

        this.#capturedScreenSizeView.setUpEvents();

        this.#$capturedScreenSize.forEach($elem => {
            if ($elem.checked) {
                this.#workspaceModel.changeCapturedScreenSize($elem.value);
            }
        });
        this.#render();
    }

    #render() {
        DOM.display(this.#$workspaceNoContent, !this.#workspaceModel.doesWorkspaceContentExist());

        this.#disableButton(this.#$startCapturing, false);
        this.#disableButton(this.#$pauseCapturing, this.#workspaceModel.isPauseBtnDisabled());
        this.#disableButton(this.#$resumeCapturing, this.#workspaceModel.isResumeBtnDisabled());
        this.#disableButton(this.#$stopCapturing, this.#workspaceModel.isStopBtnDisabled());
    }

    #resize() {
        if (!this.#$videoCanvas) {
            return;
        }
        const { mag } = this.#workspaceModel.resize();
        this.#partialImages.forEach(view => view.applyMagnitude(mag));

        this.#partialImageContextMenuModel.hideContextMenu();
    }

    #renderVideo() {
        if (this.#$videoCanvas) {
            this.#$videoCanvas.remove();
            this.#$videoCanvas = undefined;
        }
        if (!this.#workspaceModel.doesWorkspaceContentExist()) {
            return;
        }
        this.#$videoCanvas = this.#workspaceModel.getVideoCanvas();
        DOM.mousedown(this.#$videoCanvas, event => {
            event.preventDefault();
            event.stopPropagation();
            this.#workspaceModel.startCutting(event.pageX, event.pageY);
        });

        this.#$workspace.appendChild(this.#$videoCanvas);
    }

    #renderCutImage() {
        const imageDataInfo = this.#workspaceModel.getSelectedImageData();
        if (!imageDataInfo) {
            return;
        }
        const { imageData, mag } = imageDataInfo;
        const xy = this.#workspaceModel.getCuttingStartCoord();
        const leftTop = DOM.getElementPosition(this.#$workspace);
        const workspaceLeft = !leftTop ? 0 : leftTop.left;
        const workspaceTop = !leftTop ? 0 : leftTop.top;

        const view = new PartialImageView(
            this.#partialImageContextMenuModel, imageData, mag,
            xy.x - workspaceLeft, xy.y - workspaceTop
        );
        view.setUpEvents();
        
        this.#partialImages.set(view.getId(), view);
        this.#$workspace.appendChild(view.getEl());
    }

    #removeParitalImage(id) {
        const view = this.#partialImages.get(id);
        if (!view) {
            return;
        }
        view.getEl().remove();
        this.#partialImages.delete(id);
    }

    #downloadParitalImage(id) {
        if (!this.#partialImages.has(id)) {
            return;
        }
        this.#partialImages.get(id).download();
    }

    #disableButton($button, isDisabled) {
        $button.classList.remove('is-active');
        $button.classList.remove('is-disabled');

        if (isDisabled) {
            $button.classList.add('is-disabled');
        } else {
            $button.classList.add('is-active');
        }
    }
}