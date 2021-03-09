import { HeaderView, ExplanationsView } from 'vncho-lib';

import { CustomEventNames } from './common/CustomEventNames.js';
import PartialImageContextMenuModel from './image/PartialImageContextMenuModel.js';
import PartialImageContextMenuView from './image/PartialImageContextMenuView.js';
import WorkspaceModel from './image/WorkspaceModel.js';
import WorkspaceView from './image/WorkspaceView.js';

const headerConfig  = {
    containerSelector: '#headerArea',
    title: '重ねる画面キャプチャーツール',
    remarkAboutBrowser: `ブラウザは、Google Chrome, Firefox, Microsoft Edge(Chromium版)の、できるだけ最新に近いバージョンを使用してください。
    これら意外のブラウザでは動作しない可能性があります。`
};

const expanationsConfig = {
    eventName: CustomEventNames.IMAGE_CAPTURE__TOGGLE_EXPLANATIONS
};

export default function main () {

    const workspaceModel = new WorkspaceModel();
    const partialImageContextMenuModel = new PartialImageContextMenuModel();

    new HeaderView(headerConfig);
    new ExplanationsView(expanationsConfig).setUpEvents();

    const workspaceView = new WorkspaceView(workspaceModel, partialImageContextMenuModel);
    const partialImageContextMenuView = new PartialImageContextMenuView(partialImageContextMenuModel);
    workspaceView.setUpEvents();
    partialImageContextMenuView.setUpEvents();
}