import Board from '../board';
import '../styles/gui.css';
import GUIComponentBase from './base';

type GUIProps = {
    parentId:string
}

export default class GUI extends GUIComponentBase<GUIProps> {
    protected _props: GUIProps = {parentId: 'root'};
    readonly _id: string = 'gui';
    board: Board;
    create(): void {
        const guiElement = this.createElement('div', 'gui');
        const root = document.getElementById(this.props.parentId);
        root.appendChild(guiElement);
    }
    reset(): void {
        this.parentElement.replaceChildren();
    }
    static createAndGet():GUI {
        const gui = new GUI;
        gui.create();
        gui.board = Board.createAndGet();
        return gui
    }

}





