import { DOM } from 'vncho-lib';


const draggable = params => {
    let origX = 0, origY = 0, destX = 0, destY = 0;

    const { $element, ondragstart, ondrag, ondragend } = params;
    const $handle = !params.$handle ? $element : params.$handle;
    const $container = !params.$container ? document : params.$container;
    
    const dragStart = event => {
        event.preventDefault();

        destX = event.clientX;
        destY = event.clientY;

        $container.addEventListener('mouseup', dragEnd);
        $container.addEventListener('mousemove', drag);

        if (ondragstart) {
            ondragstart(event);
        }
    };

    const drag = event => {

        origX = destX - event.clientX;
        origY = destY - event.clientY;
        destX = event.clientX;
        destY = event.clientY;

        $element.style.top = `${$element.offsetTop - origY}px`;
        $element.style.left = `${$element.offsetLeft - origX}px`;

        if (ondrag) {
            ondrag(event);
        }
    };

    const dragEnd = event => {

        $container.removeEventListener('mouseup', dragEnd);
        $container.removeEventListener('mousemove', drag);

        if (ondragend) {
            ondragend(event);
        }
    };

    $handle.addEventListener('mousedown', dragStart);
    
};

const idPref = 'workspace-partial-image-';
let idCounter = 0;
let zIndexCounter = 10;

export default class PartialImageView {

    #partialImageContextMenuModel;

    #id;
    #$canvas;

    constructor(partialImageContextMenuModel, imageData, mag, x, y) {

        this.#partialImageContextMenuModel = partialImageContextMenuModel;

        this.#$canvas = document.createElement('canvas');
        this.#$canvas.width = imageData.width;
        this.#$canvas.height = imageData.height;     
        this.#$canvas.getContext('2d').putImageData(imageData, 0, 0);
        this.#$canvas.classList.add('workspace__partial-image');

        this.#id = `${idPref}${idCounter}`;
        this.#$canvas.setAttribute('id', this.#id);
        this.#$canvas.style['z-index'] = zIndexCounter;
        this.#$canvas.style.top = `${y}px`;
        this.#$canvas.style.left = `${x}px`;
        idCounter++;

        this.applyMagnitude(mag);
    }

    applyMagnitude(mag) {
        this.#$canvas.style.width = `${this.#$canvas.width / mag}px`;
        this.#$canvas.style.height = `${this.#$canvas.height / mag}px`;
    }

    setUpEvents() {
        draggable({
            $element: this.#$canvas,
            ondragstart: () => {
                zIndexCounter++;
                this.#$canvas.style['z-index'] = zIndexCounter;
                this.#$canvas.classList.add('is-dragged');
                this.#partialImageContextMenuModel.hideContextMenu();
            },
            ondragend: () => this.#$canvas.classList.remove('is-dragged')
        });

        DOM.contextmenu(this.#$canvas, event => {
            event.preventDefault();
            event.stopPropagation();
            this.#partialImageContextMenuModel.showContextMenu(
                this.#id, event.pageX, event.pageY, zIndexCounter + 1
            );
        });
    }

    getEl() {
        return this.#$canvas;
    }

    getId() {
        return this.#id;
    }

    download() {
        const anchor = document.createElement('a');
        anchor.href = this.#$canvas.toDataURL('image/png');
        anchor.download = 'iamge.png';
        anchor.click();
    }
}