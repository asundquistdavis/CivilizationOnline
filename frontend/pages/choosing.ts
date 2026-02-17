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
    condition(this:Game) {return false}
    name='choosing';
}

class ChoosingComponentProps implements ComponentProps {
    parentId: string;
    id: string;
    selected:()=>void

}

class ChoosingComponent extends Component {
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
        {listenerId:'select', action:()=>this.renderSelectedText()},

    ];
    window:WindowTemplate;
    renderSelectedText() {
        this.window.footerElement.innerText = this.game.board.map?.selectedFeature?.name||'';
    }

    render(): void {
        this.window = this.createWindow(this.parentElement, this.id, 'Choose Game', [], [], true);
        const applyButton = this.createTemplateElement('button', this.id, 'apply-button', undefined, 'apply');
        const saveButton = this.createTemplateElement('button', this.id, 'save-button', undefined, 'save');
        applyButton.addEventListener('click', ()=>{
            const forceClosedPath = (element:SVGElement) => {
                const d = element.getAttribute('d');
                const newD = ((d.charAt(-1)==='z')||(d.charAt(-1)==='Z'))? d: d + 'z';
                element.setAttribute('d', newD);
            }
            this.game.board.map.getMapFeaturesOfType('allFeature').forEach((feature:MapArea)=>{
                forceClosedPath(feature.element);
                if (feature.coverElement) {forceClosedPath(feature.coverElement)};
            })
        })
        saveButton.addEventListener('click', ()=>{            
            this.game.board.map.getMapFeaturesOfType('area').deactivate();
            this.game.board.map.getMapFeaturesOfType('openSea').deactivate();
            this.game.board.map.getMapFeaturesOfType('city').deactivate();
            this.game.board.map.getMapFeaturesOfType('floodplain').deactivate();
            this.game.board.map.getMapFeaturesOfType('volcano').deactivate();
            const svg = document.getElementById('mapSVG').outerHTML;
            const blob = new Blob([svg], {type:'text/html'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'mapSVG.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        })
        this.window.bodyElement.appendChild(applyButton);
        this.window.bodyElement.appendChild(saveButton);
        this.renderSelectedText();
    }
}

