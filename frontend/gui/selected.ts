import { Player } from "../game/game";
import { MapArea, MapFeature } from "../game/mapFeatures";
import { Component, ComponentProps, WindowTemplate } from "./component"
import '../styles/selected.css';

interface SelectedComponentProps extends ComponentProps {


}

export class SelectedComponent extends Component<SelectedComponentProps> {
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
        {listenerId:'select', action:()=>{
            this.selectedEntity=this.game.board.map.selectedFeature;
            this.update();
        }},
        {listenerId:'selectedPlayer', action:()=>{
            console.log(this.game.state.getStateData('selectedPlayer'));
            this.selectedEntity = this.game.state.getStateData('selectedPlayer');
            this.update();
        }}
    ];
    selectedEntity:Player|MapArea|MapFeature;
    window:WindowTemplate;
    update() {
        this.window.titleElement.innerText = this.toTitle(this.selectedEntity.name);
        if (!this.selectedEntity) {return this.window.hide();};
        if ('support' in this.selectedEntity) {
            // map area
            console.log(this.selectedEntity)
        } else if ('adjacentOpenSeaNames' in this.selectedEntity) {
            // map open sea
        }
        else {
            // player
        }
        this.window.show();
    }
    render(): void {
        this.window = this.createWindow(this.parentElement, this.id, ' ');
    }




}