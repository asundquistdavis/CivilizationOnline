import Game, { GameDataListener, Player } from "../game/game";
import { MapArea, MapFeature } from "../game/mapFeatures";
import { PageState } from "../game/state";
import { ASTWindow } from "../gui/ast";
import { Component, ComponentProps, WindowTemplate } from "../gui/component";
import '../styles/choosing.css';

export class ChoosingState extends PageState {
    protected _stateData: any;
    getStateData(key: keyof any) {
        throw new Error("Method not implemented.");
    }
    setStateData(key: keyof any, value: any[typeof key]): void {
        throw new Error("Method not implemented.");
    }
    protected _stateDataListeners: Map<string | number | symbol, GameDataListener>;
    getStateDataListener(key: keyof any): GameDataListener {
        throw new Error("Method not implemented.");
    }
    async onSet(): Promise<void> {
        this.game.seesActiveGames = true;
        this.game.gui.registerComponent(ChoosingComponent, {parentId:'choosing', id:'choosing'});
    }
    onReset(): void {
        this.game.seesActiveGames = false;
        this.game.gui.unregisterComponent('choosing');
    }
    condition() {return !this.game.hostId}
    name='choosing';
}

class ChoosingComponentProps implements ComponentProps {
    parentId: string;
    id: string;
}

class ChoosingComponent extends Component<ChoosingComponentProps> {
    updateActiveGames=()=>{
        this.activeGamesListElement.replaceChildren();
        this.game.getPluralsAll('activeGames').forEach(game=>{
            const gameElement = this.createTemplateElement('div', game.hostId, 'active-game-element', undefined, game.hostId);
            this.activeGamesListElement.appendChild(gameElement);
        });
    }
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
        {listenerId:'activeGames', action: this.updateActiveGames}
    ];
    activeGamesListElement = this.createTemplateElement('div', this.id, 'active-games');
    window:WindowTemplate;
    render(): void {
        this.window = this.createWindow(this.parentElement, this.id, 'Choose Game', [], [], true);
        this.window.show();
        this.window.wrapperElement.className += ' centered-top';
        this.window.bodyElement.appendChild(this.activeGamesListElement);
        const createNewGameButton = this.createElement('button', 'create-new-game-button', 'gui-standard button', undefined, 'Host');
        createNewGameButton.addEventListener('click', ()=>{
            this.game.openActiveGame(this.game.userId);
        })
        this.window.bodyElement.appendChild(createNewGameButton);

    }
}

