
import { CommonEventDispatcher } from 'vncho-lib';

import { CustomEventNames } from '../common/CustomEventNames.js';
import ImageHandler from './ImageHandler.js';

const WorkspaceState  = {
    BEFORE_CAPTURING: 0,
    CAPTURING: 1,
    PAUSING: 2,
};

export default class WorkspaceModel {

    #state;
    #imageHandler;

    #startCuttingXY;
    #endCuttingXY;
    #isCutting;

    #cutImageDataInfo;

    constructor() {
        this.#state = WorkspaceState.BEFORE_CAPTURING;
        this.#imageHandler = new ImageHandler();

        this.#isCutting = false;
    }

    async startCapturing() {
        const beforeState = this.#state;
        this.#state = WorkspaceState.CAPTURING;
        const canCapture = await this.#imageHandler.startCapturing();

        if (canCapture) {
            CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__START_CAPTURING);
        } else {
            this.#state = beforeState;
        }
    }

    pauseCapturing(retainState) {
        if (this.isPauseBtnDisabled()) {
            return;
        }

        if (!retainState) {
            this.#state = WorkspaceState.PAUSING;
        }
        this.#imageHandler.pauseCapturing();
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__PAUSE_CAPTURING);
    }

    resumeCapturing(ignoreState) {
        if (!ignoreState && this.isResumeBtnDisabled()) {
            return;
        }
        this.#state = WorkspaceState.CAPTURING;
        this.#imageHandler.resumeCapturing();
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__RESUME_CAPTURING);
    }

    stopCapturing() {
        if (this.isStopBtnDisabled()) {
            return;
        }
        this.#state = WorkspaceState.BEFORE_CAPTURING;
        this.#imageHandler.stopCapturing();
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__STOP_CAPTURING);
    }

    changeCapturedScreenSize(value) {
        this.#imageHandler.changeCapturedScreenSize(value);
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__CHANGE_CAPTURED_SCREEN_SIZE);
    }

    startCutting(x, y) {

        this.#startCuttingXY = { x, y };
        this.#isCutting = true;
        this.pauseCapturing(true);
        
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__START_CUTTING);
    }

    doCutting(x, y) {
        if (!this.#isCutting) {
            return;
        }
        this.#endCuttingXY = { x, y };
        this.#drawRect();
    }

    endCutting(x, y) {
        if (!this.#isCutting) {
            return;
        }
        this.#isCutting = false;
        this.#endCuttingXY = { x, y };
        this.#imageHandler.restoreImage();

        this.#cutImageDataInfo = this.#retoreImageData();
        if (this.#state === WorkspaceState.CAPTURING) {
            this.resumeCapturing(true);
        }

        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__END_CUTTING);
    }

    getSelectedImageData() {
        const ret = this.#cutImageDataInfo;
        this.#cutImageDataInfo = undefined;
        return ret;
    }

    getSelectedCoordinates() {
        if (!this.#startCuttingXY || !this.#endCuttingXY) {
            return;   
        }
        const _sx = this.#startCuttingXY.x;
        const _sy = this.#startCuttingXY.y;
        const _ex = this.#endCuttingXY.x;
        const _ey = this.#endCuttingXY.y;

        const sx = Math.min(_sx, _ex);
        const sy = Math.min(_sy, _ey);
        const ex = Math.max(_sx, _ex);
        const ey = Math.max(_sy, _ey);

        return {
            sx, sy,
            width: (ex - sx),
            height: (ey - sy)
        };
    }

    doesWorkspaceContentExist() {
        return this.#state !== WorkspaceState.BEFORE_CAPTURING;
    }

    getVideoCanvas() {
        return this.#imageHandler.getVideoCanvas();
    }

    resize() {
        return this.#imageHandler.resize();
    }

    isPauseBtnDisabled() {
        return this.#state === WorkspaceState.BEFORE_CAPTURING || this.#state === WorkspaceState.PAUSING;
    }

    isResumeBtnDisabled() {
        return this.#state === WorkspaceState.BEFORE_CAPTURING || this.#state !== WorkspaceState.PAUSING;
    }

    isStopBtnDisabled() {
        return this.#state === WorkspaceState.BEFORE_CAPTURING;
    }

    #retoreImageData() {
        const cood = this.getSelectedCoordinates();
        if (!cood) {
            return;
        }
        const { sx, sy, width, height } = cood;
        return this.#imageHandler.getSelectedImageData(
            sx, sy, width, height
        );
    }

    #drawRect() {
        const cood = this.getSelectedCoordinates();
        if (!cood) {
            return;
        }
        const { sx, sy, width, height } = cood;
        this.#imageHandler.drawRect(
            sx, sy, width, height
        );
    }
}