
import Board from './board';
import { ChoosingUsernameComponentInstance } from './guiComponents/choosingUsername';
import './styles/gui.css';

export default class GUI {

    board: Board;
    components:InstanceType<GUIComponentConstructor>[]=[];

    static createAndGet() {

        const gui = new GUI();

        // create and add gui html to dom
        const root = document.getElementById('root');
        const oneWindow = document.createElement('div');
        oneWindow.id = 'gui';
        root.appendChild(oneWindow);

        gui.board = Board.createAndGet();

        return gui

    }

    reset() {

        document.getElementById('gui').replaceChildren();

    }

    registerComponent<T extends GUIComponentConstructor>(Component:T, props: T['props']) {

        this.components.push( Component.register(props))
        
    }

    unRegisterComponent(componentName:GUIComponentName) {

        const [keep, remove]:InstanceType<GUIComponentConstructor>[][] =this.components.reduce(([keep, remove], current) => {
            if (current.name!==componentName) {keep.push(current)}
            else {remove.push(current)}
            return [keep, remove]
        }, [[], []])

        this.components = keep;

        remove.forEach(component=>component.unRegister());

    }
}

export interface GUIComponent {

    name:GUIComponentName;
    create:CreateGUIComponent
    unRegister():void;

}

export interface GUIComponentConstructor {

    props:{[prop:string]:any};
    register(props:GUIComponentProps):GUIComponent;
    new():GUIComponent

}

export const createGUIComponentType = <T extends GUIComponentConstructor>(constructor:T)=>{return constructor}
export const ChoosingUsernameComponent = createGUIComponentType(ChoosingUsernameComponentInstance);

export type GUIComponentProps = {
    [prop:string]:any
}

export type GUIComponentName = 'choosing-new-username';

    // createSettingsWindowWith(buttonPropsList:SettingsWindowButtonProps[], parentId='at-settings') {

    //     const window = document.createElement('div');
        
    //     const getSettingsWindowButton = (buttonProps:SettingsWindowButtonProps) => {

    //         const buttonWrapper = document.createElement('div');
    //         const button = document.createElement('button');

    //         button.innerText = buttonProps.text
    //         button.addEventListener('click', buttonProps.onClick)

    //         buttonWrapper.appendChild(button);
    //         return buttonWrapper

    //     }

    //     buttonPropsList.forEach(buttonProps=>window.appendChild(getSettingsWindowButton(buttonProps)));

    // }

type CreateGUIComponent = (props:{[prop:string]: any})=>void;

// type SettingsWindowButtonProps = {
//     text:string,
//     onClick:(event:MouseEvent)=>void,
// }
