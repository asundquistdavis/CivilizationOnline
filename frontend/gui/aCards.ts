import { Component, ComponentProps, WindowTemplate } from "./component";
import { ToolBarPack } from "./toolBar";
import '../styles/aCards.css';
import { ActiveGame, StaticACard } from "../game/game";

interface ACardsWindowProps extends ComponentProps {

    window?:WindowTemplate,
    searchText?:string,
    groups?:string[],
    sortKey?:string,
    sortAscending?:boolean,

}

export class ACardsWindow extends Component<ACardsWindowProps> {
    protected _props: ACardsWindowProps;
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
    ];
    pack:ToolBarPack = {id:this.id, text:'Advancements', on:()=>this.props.window.show(), off:()=>this.props.window.hide()}
    clearBody():void {this.props.window.bodyElement.replaceChildren()};
    renderACard = (aCard:StaticACard) => {
        const bodyElement = this.props.window.bodyElement;
        const cardElement = this.createTemplateElement('div', this.id+aCard.name, 'a-card', undefined, aCard.name);
        bodyElement.appendChild(cardElement);
    }
    compareFunction = (cardA:StaticACard, cardB:StaticACard) => {
        return (()=>{switch (this.props.sortKey) {
            default:    
            case 'name': {
                return cardA.name > cardB.name? (this.props.sortAscending? 1: -1): (this.props.sortAscending? -1: 1);
                }
            case 'price': {
                return cardA.price > cardB.price? (this.props.sortAscending? 1: -1): (this.props.sortAscending? -1: 1);
                }
            }
        })()
    }
    renderAllACards = () => {
        this.clearBody();
        this.game.getStaticAsset('aCards')
            .filter(card=>(new RegExp(this.props.searchText)).test(card.name)) // filter includes/matches search text
            .filter(card=>this.props.groups.includes(card.pgroup)&&(card.sgroup?this.props.groups.includes(card.sgroup):true)) // filter on pgroup and/or sgroup
            .sort(this.compareFunction)
            .forEach(this.renderACard);
    }
    render(): void {
        this.props.groups = this.props.groups||['red', 'yellow', 'green', 'orange', 'blue'];
        this.props.sortKey = this.props.sortKey||'name';
        this.props.sortAscending = this.props.sortAscending||true;
        this.props.window = this.createWindow(this.parentElement, this.id, 'Advancement Cards', [{id:'text-input', symbol:'text-input', text:'search', onClick:(event)=>{
            this.props.searchText = (event.target as HTMLInputElement).value;
            this.renderAllACards();
        }}]);
        this.props.window.wrapperElement.className += ' centered-top';

        this.props.window.onShow = (window) => {
            this.renderAllACards();
        }
    }


}