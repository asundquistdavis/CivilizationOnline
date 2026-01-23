import GUIComponentBase, { GUIComponentProps } from '../guiComponentLibrary/base';
import WindowComponent, { WindowComponentProps } from '../guiComponentLibrary/window';
import '../styles/loading.css';

export class LoadingComponentProps {
    parentId:string = 'gui';
}

export default class LoadingComponent extends GUIComponentBase<LoadingComponentProps> {
    protected _props: LoadingComponentProps;
    _id: string = 'loading';
    create(): void {

        const loadingWindowHolder = this.createElement('div', 'loading-window-holder');
        const testWindowHolder = this.createElement('div', 'test-window-holder');
        this.parentElement.appendChild(loadingWindowHolder);
        this.parentElement.appendChild(testWindowHolder);
        const loadingWindow = this.registerComponent<WindowComponentProps, WindowComponent, typeof WindowComponent>(WindowComponent, {
            ...new WindowComponentProps,
            parentId:'loading-window-holder',
            id:'loading-window',
            title:'Loading',
            titleBadges:[{
                symbol: '-',
                text: '',
                idSpecifier: 'minimize'
            }],
            tabs: [
                {
                    text: 'example one',
                    idSpecifier: 'example-one',
                    onClick:(event: PointerEvent)=>{},
                    constructorAndPropsGetter: ()=>({ComponentConstructor:ExampleComponentOne, props:{}})
                }, {
                    text: 'example two',
                    idSpecifier: 'example-tow',
                    onClick:(event: PointerEvent) => {},
                    constructorAndPropsGetter: ()=>({ComponentConstructor:ExampleComponentTwo, props:{}}),
                }
            ]
        });
        const testWindow = this.registerComponent<WindowComponentProps, WindowComponent, typeof WindowComponent>(WindowComponent, {
            ...new WindowComponentProps,
            parentId: 'test-window-holder',
            id: 'test-window'
        });
        const testButton = this.createElement('button', 'test-button');
        testButton.innerText = 'test';
        testButton.addEventListener('click', ()=>loadingWindow.maximize());
        testWindow.bodyElement.appendChild(testButton);
    }
}

class ExampleComponentOne extends GUIComponentBase<GUIComponentProps> {
    protected _props: GUIComponentProps;
    protected _id: string;
    create(): void {
        console.log('one');
        this.parentElement.innerText = 'example one body';
    }
}

class ExampleComponentTwo extends GUIComponentBase<GUIComponentProps> {
    protected _props: GUIComponentProps;
    protected _id: string;
    create(): void {
        console.log('two');
        this.parentElement.innerText = 'example two body';
    }
}
