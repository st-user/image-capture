import { CustomEventNamesFactory } from 'vncho-lib';

const CustomEventNames = CustomEventNamesFactory.createNames();
const CustomEventContextNames = CustomEventNamesFactory.createNames();

CustomEventNames
    .set('IMAGE_CAPTURE__TOGGLE_EXPLANATIONS', 'image-capture/toggle-explanations')
    .set('IMAGE_CAPTURE__START_CAPTURING', 'image-capture/start-capturing')
    .set('IMAGE_CAPTURE__IMAGE_DATA_LOADED', 'image-capture/image-data-loaded')
    .set('IMAGE_CAPTURE__PAUSE_CAPTURING', 'image-capture/pause-capturing')
    .set('IMAGE_CAPTURE__RESUME_CAPTURING', 'image-capture/resume-capturing')
    .set('IMAGE_CAPTURE__STOP_CAPTURING', 'image-capture/stop-capturing')
    .set('IMAGE_CAPTURE__TOGGLE_SIZE_SETTING_AREA', 'image-capture/toggle-size-setting-area')
    .set('IMAGE_CAPTURE__CHANGE_CAPTURED_SCREEN_SIZE', 'image-capture/change-captured-screen-size')

    .set('IMAGE_CAPTURE__START_CUTTING', 'image-capture/start-cutting')
    .set('IMAGE_CAPTURE__DO_CUTTING', 'image-capture/do-cutting')
    .set('IMAGE_CAPTURE__END_CUTTING', 'image-capture/end-cutting')

    .set('IMAGE_CAPTURE__TOGGLE_CONTEXT_MENU', 'image-capture/toggle-context-menu')
    .set('IMAGE_CAPTURE__DELETE_PARTIAL_IMAGE', 'image-capture/delete-partial-image')
    .set('IMAGE_CAPTURE__DOWNLOAD_PARTIAL_IMAGE', 'image-capture/download-partial-image')
    .set('IMAGE_CAPTURE__TOGGLE_PARTIAL_IMAGE_SIZE', 'image-capture/toggle-partial-image-size')


;

export { CustomEventNames, CustomEventContextNames };
