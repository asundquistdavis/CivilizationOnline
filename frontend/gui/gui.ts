import Game from '../game/game';
import { Component, ComponentProps, WindowTemplate } from './component';

export default class GUI {
    readonly parentId: string = 'root'
    readonly elementId: string = 'gui';
    game:Game;
    private _components: Component[] = [];

    static createAndGet():GUI {
        const gui = new GUI;
        const element = document.createElement('div');
        element.id = gui.elementId;
        element.className = 'gui';
        document.getElementById(gui.parentId).appendChild(element);  
        return gui
    };

    reset():void {

        this._components.forEach((component)=>component.dismount());

        this._components = [];

        document.getElementById(this.elementId).replaceChildren();

    }

    unregisterComponent(id:string) {

        this._components = this._components.filter(component=>{

            if (component.id === id) {

                component.dismount();

                return false

            } else {return true};

        });

    }

    registerComponent<T extends Component, P extends ComponentProps = ComponentProps>(ComponentConstructor:{new(game:Game, props:P):T}, props:P):T {

        const component = new ComponentConstructor(this.game, props);

        if (!document.getElementById(props.parentId)) {
            
            const parentElement = document.createElement('div');

            parentElement.id = props.parentId;

            document.getElementById('gui').appendChild(parentElement);

        }

        this._components.push(component);

        component.mount();

        return component

    }

    getComponent(id:string):Component {return this._components.find(component=>component.id===id)}

}

export class HoveredFeatureWindow extends Component {
    
    parentId: string;
    window:WindowTemplate;
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
        {listenerId:'hover', action:()=>this.renderHoverText()},
        {listenerId:'unHover', action:()=>this.resetHoverText()},
    ];
    renderHoverText():void {
        if (this.game.board.map?.hoveredFeature?.name) {
            this.window.show();
            this.window.bodyElement.innerText = this.toTitle(this.game.board.map?.hoveredFeature?.name||'');
        }
    }
    resetHoverText():void {
        this.window.hide();
    }
    render(): void {
       this.window = this.createWindow(this.parentElement, this.id, undefined, undefined, undefined, true);
       this.window.wrapperElement.className += ' centered-bottom';
    }

}




