import { Player } from "../game/game";
import { Component, ComponentProps, WindowTemplate } from "./component";
import '../styles/players.css';

interface PlayersComponentProps extends ComponentProps {
    

}

export class PlayersComponent extends Component {
    
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
        {listenerId: 'players', action:()=>this.renderPlayers()}
    ];
    window:WindowTemplate;
    renderPlayers() {
        this.window.clearBody();
        console.log(this.game.getPluralsAll('players'));
        this.game.getPluralsAll('players').forEach(player=>this.renderPlayer(player))};
    renderPlayer(player:Player) {
        const playerRowElement = this.createTemplateElement('div', this.id+'-'+player.id, 'player-row');
        const playerNameElement = this.createTemplateElement('span', this.id+'-'+player.id, 'player-name', undefined, player.name);
        playerRowElement.addEventListener('click', ()=>{
            console.log(this.game.state.getStateData('selectedPlayer'));
            if (this.game.state.getStateData('selectedPlayer')?.name===player.name) {return this.game.state.setStateData('selectedPlayer', null)};
            this.game.state.setStateData('selectedPlayer', player);
        });
        playerRowElement.appendChild(playerNameElement);
        this.window.bodyElement.appendChild(playerRowElement); 
    };
    render(): void {
        this.window = this.createWindow(this.parentElement, this.id, 'Players');
        // this.window.wrapperElement.className += ' '
        this.window.onShow = () => this.renderPlayers();
        this.window.show();
    }
}