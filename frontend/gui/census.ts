import { Component, ComponentProps, WindowTemplate } from "./component";
import { ToolBarPack } from "./toolBar";
import '../styles/census.css';

interface CensusProps extends ComponentProps {

    window?:WindowTemplate
    
}


export class Census extends Component<CensusProps> {
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
        {
            listenerId: 'toolBarTabId',
            action:() => {
                if (this.game.state.getStateData('toolBarTabId')===this.id) {return this.props.window.toggle()}
                this.props.window.hide();
            }
        }
    ];
    pack:ToolBarPack = {id:this.id, text:'Census', onSelect:()=>{this.game.state.setStateData('toolBarTabId', this.id)}}
    render(): void {
        this.props.window = this.createWindow(this.parentElement, this.id, 'Census');
        this.props.window.wrapperElement.className += ' centered-top';
        this.props.window.onShow = (window) => {
            const test = this.createTemplateElement('div', this.id, '', undefined, 'test');
            window.bodyElement.appendChild(test);
        }
    }



}