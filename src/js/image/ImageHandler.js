import { CommonEventDispatcher, DOM } from 'vncho-lib';

import { CustomEventNames } from '../common/CustomEventNames.js';

const CHECH_IF_SOURCE_STREAM_TRACK_RESIZED_INTERVAL = 300;

export default class ImageHandler {

    #stream;
    #resizeTimer;
    #requestAnimationFrameId;

    #$baseVideo;
    #videoSnapshot;
    #$videoCanvas;

    #cssWidth;
    #cssHeight;

    #capturedScreenSize;

    async startCapturing() {

        try {

            if (this.#stream) {
                this.#stream.getTracks().forEach(t => {
                    t.stop();
                    this.#endTrack();
                });
            }

            this.#stream = await navigator.mediaDevices.getDisplayMedia({
                audio: false,
                video: true
            });
            let currentSetting = this.#stream.getTracks()[0].getSettings();

            this.#stream.getTracks().forEach(t => {
                t.addEventListener('ended', () => {
                    this.#endTrack();
                    CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__STOP_CAPTURING);
                });
            });


            this.#$baseVideo = document.createElement('video');
            this.#$baseVideo.autoplay = true;
            this.#$baseVideo.playsinline = false;
            this.#$baseVideo.srcObject = this.#stream;
    
            const checkSourceStreamTrackResized = () => {
                const _currentSettings = this.#stream.getTracks()[0].getSettings();
                if(currentSetting.width !== _currentSettings.width || currentSetting.height !== _currentSettings.height) {
                    this.#$baseVideo.srcObject = this.#stream;
                }
                currentSetting = _currentSettings;
                this.#resizeTimer = setTimeout(checkSourceStreamTrackResized, CHECH_IF_SOURCE_STREAM_TRACK_RESIZED_INTERVAL);
            };
            clearTimeout(this.#resizeTimer);
            checkSourceStreamTrackResized();

            this.#$videoCanvas = document.createElement('canvas');
            this.#$videoCanvas.classList.add('workspace__main-image');
    
            this.#$baseVideo.onloadedmetadata = () => {
                this.#setCssSize();
                this.#applySize();
                this.resumeCapturing();
                
                CommonEventDispatcher.dispatch(CustomEventNames.IMAGE_CAPTURE__IMAGE_DATA_LOADED);
            };
        } catch(e) {
            this.#endTrack();
            alert('画面の撮影(共有)がキャンセルされました。または、画面の共有がブロックされている可能性があります。');
            console.error(e);
            return false;
        }

        return true;
    }

    pauseCapturing() {
        cancelAnimationFrame(this.#requestAnimationFrameId);
        const ctx = this.#$videoCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, this.#$videoCanvas.width, this.#$videoCanvas.height);
        this.#videoSnapshot = imageData;
    }

    resumeCapturing() {
        cancelAnimationFrame(this.#requestAnimationFrameId);
        this.#videoSnapshot = undefined;
        this.#renderVideo();
    }

    stopCapturing() {
        if (this.#stream) {
            this.#stream.getTracks().forEach(t => t.stop());
        }
        this.#endTrack();
    }

    getVideoCanvas() {
        return this.#$videoCanvas;
    }

    getSelectedImageData(_sx, _sy, _width, _height) {
        if (!this.#$baseVideo || !this.#$videoCanvas) {
            return;
        }

        const { sx, sy, width, height, mag } = this.#getImageDataWindowInfo(
            _sx, _sy, _width, _height
        );

        // console.log(`orig  sx: ${_sx}, sy: ${_sy}, width: ${_width}, height: ${_height}`);
        // console.log(`result  sx: ${sx}, sy: ${sy}, width: ${width}, height: ${height}`);

        const ctx = this.#$videoCanvas.getContext('2d');
        const imageData = ctx.getImageData(sx, sy, width, height);
        return {
            imageData,
            mag
        };
    }

    showImage() {
        this.#clear();
        this.#drawImage();
    }

    restoreImage() {
        this.#clear();
        this.#restoreSnapshot();
    }

    drawRect(_sx, _sy, _width, _height) {
        if (!this.#$baseVideo || !this.#$videoCanvas || !this.#videoSnapshot) {
            return;
        }

        const { sx, sy, width, height } = this.#getImageDataWindowInfo(
            _sx, _sy, _width, _height
        );

        
        this.#clear();
        this.#restoreSnapshot();
        const ctx = this.#$videoCanvas.getContext('2d');
        ctx.strokeStyle = 'white';
        ctx.strokeRect(sx, sy, width, height);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(sx - 1, sy - 1, width + 2, height + 2);
    }

    resize() {
        if (!this.#$baseVideo || !this.#$videoCanvas) {
            return;
        }

        this.#clear();
        this.#setCssSize();
        this.#applySize();
        this.#drawImage();

        return {
            mag: this.#$baseVideo.videoWidth / this.#cssWidth
        };
    }

    changeCapturedScreenSize(value) {
        this.#capturedScreenSize = value;
    }

    #renderVideo() {
        const render = () => {
            this.#drawImage();
            this.#requestAnimationFrameId = requestAnimationFrame(render);
        };
        render();
    }

    #getImageDataWindowInfo(_sx, _sy, _width, _height) {
        const canvasPos = DOM.getElementPosition(this.#$videoCanvas);
        const canvasLeft = !canvasPos ? 0 : canvasPos.left;
        const canvasTop = !canvasPos ? 0 : canvasPos.top;

        const videoWidth = this.#$baseVideo.videoWidth;
        const videoHeight = this.#$baseVideo.videoHeight;

        const mag = this.#$baseVideo.videoWidth / this.#cssWidth;
        const sx = Math.max((_sx - canvasLeft) * mag, 0);
        const sy = Math.max((_sy - canvasTop) * mag, 0);

        let width = Math.min(_width * mag, videoWidth - sx);
        let height = Math.min(_height * mag, videoHeight - sy);
        width = Math.max(width, 1);
        height = Math.max(height, 1);

        return { sx, sy, width, height, mag };
    }

    #restoreSnapshot() {
        const ctx = this.#$videoCanvas.getContext('2d');
        ctx.putImageData(this.#videoSnapshot, 0, 0);
    }

    #clear() {
        if (!this.#$videoCanvas) {
            return;
        }
        const ctx = this.#$videoCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.#$videoCanvas.width, this.#$videoCanvas.height);
    }

    #drawImage() {
        if (!this.#$baseVideo || !this.#$videoCanvas) {
            return;
        }
        const videoWidth = this.#$baseVideo.videoWidth;
        const videoHeight = this.#$baseVideo.videoHeight;

        const ctx = this.#$videoCanvas.getContext('2d');
        ctx.drawImage(this.#$baseVideo, 0, 0, videoWidth, videoHeight);
    }

    #setCssSize() {
        if (!this.#$baseVideo || !this.#$videoCanvas) {
            return;
        }

        const videoWidth = this.#$baseVideo.videoWidth;
        const videoHeight = this.#$baseVideo.videoHeight;
        const aspectRatio = videoWidth / videoHeight;

        if (this.#capturedScreenSize === 'original') {
            this.#cssWidth = videoWidth;
        } else {
            this.#cssWidth = Math.min(window.innerWidth * 0.95, videoWidth);
        }
        
        this.#cssHeight = this.#cssWidth * (1 / aspectRatio);
    }

    #applySize() {
        if (!this.#$baseVideo || !this.#$videoCanvas || !this.#cssWidth || !this.#cssHeight) {
            return;
        }
        this.#$videoCanvas.width = this.#$baseVideo.videoWidth;
        this.#$videoCanvas.height = this.#$baseVideo.videoHeight;

        this.#$videoCanvas.style.width = `${this.#cssWidth}px`;
        this.#$videoCanvas.style.height = `${this.#cssHeight}px`;
    }

    #endTrack() {
        clearTimeout(this.#resizeTimer);
        this.#stream = undefined;
        
        if(this.#$baseVideo) {
            this.#$baseVideo.remove();
            this.#$baseVideo = undefined;
        }
        if(this.#$videoCanvas) {
            this.#$videoCanvas.remove();
            this.#$videoCanvas = undefined;
        }
        this.#videoSnapshot = undefined;
        cancelAnimationFrame(this.#requestAnimationFrameId);      
    }
}