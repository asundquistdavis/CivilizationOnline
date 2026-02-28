import { GameDataListener, GameSetting, GameSettingAsInput } from "../game/game";
import { PageState } from "../game/state";
import { Component, ComponentProps, WindowTemplate } from "../gui/component";
import '../styles/pregame.css';

export class PregameState extends PageState {
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
    onSet(): void {
        this.game.gui.registerComponent(PregameComponent, {parentId:'choosing', id:'pregame'})
    }
    onReset(): void {
        this.game.gui.unregisterComponent('pregame')
    }
    condition():boolean {
        return this.game.hostId&&(this.game.getSingle('state')?.turnNumber===0)}
    name='pregame';
}

class PregameComponentProps implements ComponentProps {
    parentId: string;
    id: string;
}

class PregameComponent extends Component<PregameComponentProps> {
    updateNameBadge=()=>{this.nameBadge.innerText=this.game.getSingle('setting').name};
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
        {listenerId:'name', action:()=>this.updateNameBadge()},
    ];
    nameBadge:HTMLElement;
    window:WindowTemplate=this.createWindow(this.parentElement, this.id, 'pregame', [], [
        {id: 'game-settings', text: 'Game', renderBody:parentElement=>{
            const settings = this.game.getSingle('setting');
            const camelToTitleInput = (text:string) => {
                const a = text.charAt(0).toUpperCase() + text.slice(1).replace(/([A-Z])/g, " $1") + ':';
                return a.split(/\s/g)?.[0]==='Is'?a.split(/\s/g).slice(1).join(' '):a;
            };
            Object.keys(GameSettingAsInput).forEach(p=> {
                const prop = p as keyof GameSetting;
                const inputParams = GameSettingAsInput[prop];
                const inputType = inputParams[0];
                if (inputType==='none') {return}
                const value = settings[prop].toString();
                const wrapper = this.createTemplateElement('div', prop, 'game-setting-input-wrapper');
                const label = this.createTemplateElement('label', prop, 'game-setting-label', undefined, camelToTitleInput(prop));
                wrapper.appendChild(label);
                let input:HTMLInputElement|HTMLSelectElement;
                let getTarget:()=>(string|boolean|number);
                switch (inputParams[0]) {
                    case "number": {
                        const min = inputParams[1]===undefined?null:inputParams[1];
                        const max = inputParams[2]===undefined?null:inputParams[2];
                        input = this.createTemplateElement('input', prop, 'game-setting-number-input', {value, type:'number', min, max,}) as HTMLInputElement;
                        getTarget = () => parseInt(input.value);
                        break;
                    }
                    case "check": {
                        input = this.createTemplateElement('input', prop, 'game-setting-checkbox-input', {type:'checkbox'}) as HTMLInputElement;
                        if (settings[prop]) {input.setAttribute('checked', '')}
                        getTarget = () => (input as HTMLInputElement).checked;
                        break;
                    }
                    case 'option': {
                        input = this.createTemplateElement('select', prop, 'game-setting-select', {value}) as HTMLSelectElement;
                        const optionTexts = inputParams.slice(1);
                        optionTexts.forEach(optionText=>{
                            const option = this.createTemplateElement('option', prop+'-'+optionText, 'game-setting-option', undefined, optionText);
                            input.appendChild(option);
                        });
                        getTarget = () => input.value;
                        break;
                    }
                    case "text": {
                        input = this.createTemplateElement('input', prop, 'game-setting-input', {type:'text', value,}) as HTMLInputElement;
                        getTarget = () => input.value;
                        break;
                    }
                }
                input.addEventListener('input', ()=>{
                    this.game.requestGameData({type:'setting', auth:'wild' , data:{[prop]:getTarget()}});
                });
                wrapper.appendChild(input);
                parentElement.appendChild(wrapper)
            })
        }},
        {id: 'players', 'text': 'players', renderBody:parentElement=>{
            const playersElement = this.createTemplateElement('div', 'players', 'players-list');
            const players = this.game.getPluralsAll('players');
            players.forEach(player=>{
                const playerRow = this.createTemplateElement('div', player.id, 'player-row');
                const playerName = this.createTemplateElement('input', player.id, 'player-name', {value:player.name||''});
                playerName.addEventListener('input', ()=>{
                    this.game.requestGameData({type:'pluralPutInstance', auth:'wild', data:{players:{id:player.id, name:player.name}}});
                });
                playerRow.appendChild(playerName);
                playersElement.appendChild(playerRow);
            })
            parentElement.appendChild(playersElement);
        }}
    ]);
    render(): void {
        console.log(this.game.getPluralsAll('players'));
        this.nameBadge = this.window.addButton('name', this.game.getSingle('setting').id, {});
        this.window.wrapperElement.className += ' centered-top';
        this.window.show();
    }
}