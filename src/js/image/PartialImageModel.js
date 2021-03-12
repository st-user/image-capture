import { CommonEventDispatcher } from 'vncho-lib';

import { CustomEventNames } from '../common/CustomEventNames.js';

const MINIMIZED_WIDTH = 80;

export default class PartialImageModel {

    #workspaceLeft;
    #workspaceTop;

    #clickedXy;
    #magnitude;
    #isMinimized;

    constructor(workspaceLeft ,workspaceTop) {
        this.#workspaceLeft = workspaceLeft;
        this.#workspaceTop = workspaceTop;
        this.#clickedXy = { x: 0, y: 0 };
        this.#magnitude = 1;
        this.#isMinimized = false;
    }

    setMagnitude(mag) {
        this.#magnitude = mag;
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__TOGGLE_PARTIAL_IMAGE_SIZE, {
            resetPosition: false
        });
    }

    toggleSize(x, y) {       
        this.#clickedXy = { x, y };
        this.#isMinimized = !this.#isMinimized;
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__TOGGLE_PARTIAL_IMAGE_SIZE, {
            resetPosition: true
        });
    }

    calcSizes(canvasWidth, canvasHeight) {
        const aspectRatio = canvasWidth / canvasHeight;
        const cssWidth = canvasWidth / this.#magnitude;
        const cssHeight = canvasHeight / this.#magnitude;
        let width = cssWidth;
        let height = cssHeight;
        if (this.#isMinimized) {
            width = Math.min(cssWidth, MINIMIZED_WIDTH);
            height = width / aspectRatio;

        }
        const { x, y} = this.#clickedXy;
        return {
            width, height,
            top: (y - height / 2) - this.#workspaceTop,
            left: (x - width / 2) - this.#workspaceLeft
        };
    }
}