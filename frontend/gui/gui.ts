import './styles/gui.css';
import GUIComponentBase from '../components/base';

type GUIProps = {
    parentId:string
}

export default class GUI extends GUIComponentBase<GUIProps> {
    protected _props: GUIProps = {parentId: 'root'};
    readonly _id: string = 'gui';
    create(): void {
        const guiElement = this.createElement('div', 'gui');
        const root = document.getElementById(this.props.parentId);
        root.appendChild(guiElement);
    }
    static createAndGet():GUI {
        const gui = new GUI;
        gui.create();
        return gui
    }
}





