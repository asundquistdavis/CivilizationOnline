import Data, { AnyData, CivilizationStatic, DataListener, Player,} from "../data";
import FormComponent, { FormComponentProps, FormOption } from "../guiComponentLibrary/form";
import WindowComponent, { WindowComponentProps } from "../guiComponentLibrary/window";
import GUIComponentBase, { GUIComponentProps } from "../guiComponentLibrary/base";

export class PregameComponentProps implements GUIComponentProps {
    parentId: string;
    data:Data;
}


export default class PregameComponent extends GUIComponentBase<PregameComponentProps> {
    protected _props: PregameComponentProps;
    protected _id: string='pregame';
    create(): void {
        const pregameWindowHolder = this.createElement('div', this.id+'-window-holder');
        this.parentElement.appendChild(pregameWindowHolder);
        const pregameWindow = this.registerComponent<WindowComponentProps, WindowComponent, any>(WindowComponent, {...new WindowComponentProps,
            title:'Pregame',
            parentId:this.id+'-window-holder', 
            id:'pregame-window',
            tabs:[
                {
                    text: 'Player',
                    idSpecifier: 'player-settings',
                    onClick: () => {},
                    constructorAndPropsGetter: () => {
                        return {ComponentConstructor:PlayerSettings, props:{...new PlayerSettingsProps, data:this._props.data, civilizations: this._props.data.getDataWith('civilizationsStatic'), civilizationsListener:this._props.data.getDataListenerWith('civilizationsStatic')}}
                    },
                    applyOnActiveAndOnReset:{onActive:(element)=>{
                        element.innerText = 'Player \u{2699}';
                    },onReset:(element)=>{
                        element.innerText = 'Player';
                    }}
                }, {
                    text: 'Game',
                    idSpecifier: 'game-settings',
                    onClick: () => {},
                    constructorAndPropsGetter:() => {
                        return {ComponentConstructor:GameSettings, props:{...new GameSettingsProps}}
                    },
                    applyOnActiveAndOnReset:{onActive:(element)=>{
                        element.innerText = 'Game \u{2699}';
                    },onReset:(element)=>{
                        element.innerText = 'Game';
                    }}
                }, {
                    text: 'Summary',
                    idSpecifier: 'summary',
                    onClick: ()=>{},
                    constructorAndPropsGetter:() => {
                        return {ComponentConstructor:GameSummary, props:{...new GameSummaryProps, players:[], data:this._props.data}}
                    } 
                }
            ]
        });
    }
    reset(): void {
        this.parentElement.replaceChildren();
    }
}

class PlayerSettingsProps implements GUIComponentProps {
    parentId: string;
    data?: Data;
    civilizationsListener:DataListener<'civilizationsStatic'>;
}

class PlayerSettings extends GUIComponentBase<PlayerSettingsProps> {
    protected _props: PlayerSettingsProps;
    protected _id: string='player-settings';
    create(): void {
        this.registerComponent<FormComponentProps, FormComponent, typeof FormComponent>(FormComponent, {...new FormComponentProps, 
            parentId: this.parentElement.id, 
            id:this.id+'-player-name',
            text: 'Player Name',
            type: 'text',
            placeholder: 'enter player name',
        }, [this._props.civilizationsListener])
        const civilizationsAsOptions:FormOption[] = this._props.data.civilizationsStatic.map(civilization=>({idSpecifier:civilization.name, text:civilization.name, styleProps:{'--color':civilization.color}}))
        this.registerComponent<FormComponentProps, FormComponent, typeof FormComponent>(FormComponent, {...new FormComponentProps, 
            parentId: this.parentElement.id, 
            id:this.id+'-civilization',
            text: 'Civilization Name',
            type: 'select',
            value: 'minoa',
            options:civilizationsAsOptions,
            onChange:(event)=>{
                const civilizationName = (event.target as HTMLSelectElement).value;
                this._props.data.sendDataWith('players', {civilizationName})
            }
        })
    }
}

class GameSettingsProps implements GUIComponentProps {
    parentId: string;

}

class GameSettings extends GUIComponentBase<GameSettingsProps> {
    protected _props: GameSettingsProps;
    protected _id: string = 'game-settings';
    create(): void {
    }
}

class GameSummaryProps implements GUIComponentProps {
    parentId: string;
    data:Data;
}


class GameSummary extends GUIComponentBase<GameSummaryProps> {
    protected _props: GameSummaryProps;
    protected _id: string = 'game-summary';
    
    createPlayerRow(player:Player):HTMLElement {
        const id = player.id;
        const civilization = this._props.data.getDataOfWith('civilizationsStatic', player.civilizationName)
        const rowElement = this.createElement('tr', id+'-player-row', 'player-row row');
        const playerNameElement = this.createElement('td', id+'-player-name', 'player-name');
        const civilizationNameElement = this.createElement('td', id+'-civilization-name', 'civilization-name');
        const isReadyWrapperElement = this.createElement('td', id+'-is-ready-wrapper', 'is-ready-wrapper');
        const isReadyElement = this.createElement('input', id+'-is-ready-check-box', 'is-ready-check-box', {type: 'checkbox'});
        playerNameElement.innerText = player.name;
        civilizationNameElement.innerText = player.civilizationName;
        civilizationNameElement.style.setProperty('--civilization-color', civilization.color)
        isReadyWrapperElement.appendChild(isReadyElement);
        rowElement.appendChild(playerNameElement);
        rowElement.appendChild(civilizationNameElement);
        rowElement.appendChild(isReadyWrapperElement);
        return rowElement;
    }
    createPlayersTable(){
        const id = 'players-table';
        const playersTable = this.createElement('table', id);
        const playersThead = this.createElement('thead', id+'-thead');
        const playersHeaderRow = this.createElement('tr', id+'-header-row');
        const nameElement = this.createElement('th', id+'-name');
        nameElement.innerText = 'Name';
        const civilizationElement = this.createElement('th', id+'-civilization');
        civilizationElement.innerText = 'Civilization';
        const isReadyElement = this.createElement('th', id+'-is-ready');
        isReadyElement.innerText = 'Ready?';
        const playersTBody = this.createElement('tbody', id+'-players-tbody');
        this._props.data.getDataWith('players').forEach(player=>playersTBody.appendChild(this.createPlayerRow(player)));
        playersThead.appendChild(nameElement);
        playersThead.appendChild(civilizationElement);
        playersThead.appendChild(isReadyElement);
        playersTable.appendChild(playersThead);
        playersTable.appendChild(playersTBody);
        return playersTable
    }
    create(): void {
        const id = this._id = 'game-summary';
        const playersTable = this.createPlayersTable();
        this.parentElement.appendChild(playersTable);
    }
}

