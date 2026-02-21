import { Player } from "../game/game";
import { MapArea, MapFeature, MapOpenSea } from "../game/mapFeatures";
import { Component, ComponentProps, WindowTemplate } from "./component"
import '../styles/selected.css';

interface SelectedComponentProps extends ComponentProps {


}

export class SelectedComponent extends Component<SelectedComponentProps> {
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
        {listenerId:'select', action:()=>{
            console.log(this.game.state.getStateData('selectedPlayer'), this.game.board.map.selectedFeature);
            this.selectedEntity=this.game.board.map.selectedFeature?this.game.board.map.selectedFeature:this.game.state.getStateData('selectedPlayer');
            this.update();
        }},
        {listenerId:'selectedPlayer', action:()=>{
            console.log(this.game.state.getStateData('selectedPlayer'), this.game.board.map.selectedFeature);
            this.selectedEntity = this.game.state.getStateData('selectedPlayer')?this.game.state.getStateData('selectedPlayer'):this.game.board.map.selectedFeature;
            this.update();
        }}
    ];
    selectedEntity:Player|MapArea|MapFeature;
    get selectedEntityType():'player'|'openSea'|'area' {return this.selectedEntity? ('support' in this.selectedEntity? 'area': ('adjacentOpenSeaNames' in this.selectedEntity? 'openSea': 'player')): null}
    window:WindowTemplate;
    onTearDown:()=>void=()=>{};
    update() {
        this.onTearDown();
        this.window.clearButtons();
        if (!this.selectedEntity) {return this.window.hide();};
        this.window.titleElement.innerText = this.toTitle(this.selectedEntity.name);
        switch (this.selectedEntityType) {
            case 'area': {
                const area = this.selectedEntity as MapArea;
                const support = area.support;
                this.window.addButton('support', support.toString(), {'support': support.toString()});
                const startingCivilizationName = area.startingCivilization;
                const startingCivilization = this.game.getStaticAsset('civilizations').find(civilization=>civilization.name===startingCivilizationName);
                const isStartingArea = area.isStartingArea;
                const hasCity = area.hasCity;
                const hasVolcano = area.hasVolcano;
                const hasFloodplainCity = area.hasFloodplainCity;
                const adjacentByLand = area.adjacentLandAreas;
                const adjacentByWater = [].concat(area.adjacentCoastalAreas).concat(area.adjacentOpenSeas);
                const onMouseEnter = () => {
                    this.game.board.map.clearLayer('adjacent');
                    this.game.board.map.addLayer(adjacentByWater, 'adjacent', false, {'--water': 'var(--water-adjacent)', '--coastal': 'var(--water-adjacent)', 'opacity': '50%'});
                    this.game.board.map.addLayer(adjacentByLand, 'adjacent', true, {'--land': 'var(--land-adjacent)'});
                };
                const ac = new AbortController();
                this.window.wrapperElement.addEventListener('mouseenter', onMouseEnter, {signal:ac.signal});
                this.window.wrapperElement.addEventListener('mouseleave', ()=>this.game.board.map.clearLayer('adjacent'));
                this.onTearDown = () => {
                    this.window.clearBody();
                    ac.abort()
                };
                break;
            }
            case "openSea": {
                const onMouseEnter = () => {
                    const openSea = this.selectedEntity as MapOpenSea;
                    const adjacentByWater = [].concat(openSea.adjacentCoastalAreas).concat(openSea.adjacentOpenSeas);
                    this.game.board.map.clearLayer('adjacent');
                    this.game.board.map.addLayer(adjacentByWater, 'adjacent', false, {'--water': 'var(--water-adjacent)', '--coastal': 'var(--water-adjacent)', 'opacity': '50%'});
                };
                const ac = new AbortController();
                this.window.wrapperElement.addEventListener('mouseenter', onMouseEnter, {signal:ac.signal});
                this.window.wrapperElement.addEventListener('mouseleave', ()=>this.game.board.map.clearLayer('adjacent'));
                this.onTearDown = () => ac.abort();
                break;
            }
            case "player": {
                
                break;
            }
        }
        this.window.show();
    }
    render(): void {
        this.window = this.createWindow(this.parentElement, this.id, ' ');
    }




}