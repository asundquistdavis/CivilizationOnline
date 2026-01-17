import GUIComponentBase from '../guiComponentLibrary/base';
import WindowComponent, { WindowComponentProps } from '../guiComponentLibrary/window';
import '../styles/loading.css';

export class LoadingComponentProps {
    parentId:string = 'gui';
}

export default class LoadingComponent extends GUIComponentBase<LoadingComponentProps> {
    protected _props: LoadingComponentProps;
    _id: string = 'loading';
    create(): void {
        const loadingWindow = this.registerComponent<WindowComponentProps, WindowComponent, typeof WindowComponent>(WindowComponent, {
            ...new WindowComponentProps,
            parentId:'gui',
            id:'loading-window',
            titleBadges:[{
                text: 'minimize',
                idSpecifier: 'minimize'
            }]
        });
        // const testWindow = this.registerComponent<WindowComponentProps, WindowComponent, typeof WindowComponent>(WindowComponent, {
        //     ...new WindowComponentProps,
        //     parentId: 'gui',
        //     id: 'test-window'
        // });
        // const testButton = this.createElement('button', 'test-button');
        // testButton.innerText = 'test';
        // testButton.addEventListener('click', ()=>loadingWindow.maximize());
        // testWindow.bodyElement.appendChild(testButton);
    }
    reset(): void {
        document.getElementById(this._props.parentId).replaceChildren();
    }
}
