import Data, { Game } from "../data";
import GUIComponentBase, { GUIComponentProps } from "../guiComponentLibrary/base";
import WindowComponent, { WindowComponentProps } from "../guiComponentLibrary/window";
import '../styles/chooseGame.css';

export class ChooseGameComponentProps implements GUIComponentProps {
    parentId: string='gui';
    data: Data;
}

class ChooseGameWindowComponentProps extends WindowComponentProps {
    parentId: string='choose-game-window-holder';
    title?: string='choose game';
    id='choose-game-window'
}

export default class ChooseGameComponent extends GUIComponentBase<ChooseGameComponentProps> {
    protected _props: ChooseGameComponentProps;
    protected _id: string='choose-game';
    create(): void {
        const chooseGameWindowHolder =this.createElement('div', this.id+'-window-holder');
        this.parentElement.appendChild(chooseGameWindowHolder);
        const chooseGameWindow = this.registerComponent(WindowComponent, {...new ChooseGameWindowComponentProps, 


        }) as WindowComponent;
        chooseGameWindow.bodyElement.appendChild(this.createStartButton());
    }
    createGameRow(game:Game):HTMLElement {
        const id = game.id;
        const rowElement = this.createElement('div', id+'-row');
        const gameNameElement = this.createElement('div', id+'-name');
        gameNameElement.innerText = game.settings.name? game.settings.name: game.id;
        const remainingRoomElement = this.createElement('div', id+'-remaining-room');
        // remainingRoomElement.innerText = game.numberOfPlayers.toString() + '/' + game.settings.maxNumberOfPlayers.toString()
        return
    }
    createStartButton():HTMLElement {
        const button = this.createElement('button', this._id+'start-button');
        const onClick = () => {this.props.data.hostNewGame('Andrew')}
        button.innerText = 'Host New Game';
        button.addEventListener('click', onClick);
        return button
    }
}