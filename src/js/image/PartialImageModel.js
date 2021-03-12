import { CommonEventDispatcher } from 'vncho-lib';

import { CustomEventNames } from '../common/CustomEventNames.js';

const MINIMIZED_WIDTH = 80;

export default class PartialImageModel {

    #id;
    #workspaceLeft;
    #workspaceTop;

    #clickedXy;
    #magnitude;
    #isMinimized;

    constructor(id, workspaceLeft ,workspaceTop) {
        this.#id = id;
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
        }, this.#id);
    }

    toggleSize(x, y) {       
        this.#clickedXy = { x, y };
        this.#isMinimized = !this.#isMinimized;
        CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__TOGGLE_PARTIAL_IMAGE_SIZE, {
            resetPosition: true
        }, this.#id);
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
            top: Math.max((y - height / 2) - this.#workspaceTop, this.#workspaceTop),
            left: Math.max((x - width / 2) - this.#workspaceLeft, this.#workspaceLeft)
        };
    }
}