import { Component, ComponentProps, WindowTemplate } from "./component";
import '../styles/phase.css';


interface PhaseProps extends ComponentProps {

    window?:WindowTemplate

}

export class PhaseComponent extends Component<PhaseProps> {
    
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [{
        listenerId:'phaseName',
        action:()=>{this.updatePhaseName()}
    }];
    window:HTMLElement;
    get phaseName():string {return this.game.getSingle('state').phaseName};
    phaseNameElement:HTMLElement;
    updatePhaseName = () => {this.phaseNameElement.innerText = this.phaseName};
    button:HTMLElement;
    render(): void {
        this.window = this.createTemplateElement('div', this.id, 'phase');
        this.phaseNameElement = this.createTemplateElement('div', this.id, 'phase-title', undefined, this.phaseName);
        this.window.appendChild(this.phaseNameElement);
        this.parentElement.appendChild(this.window);
    }



}
