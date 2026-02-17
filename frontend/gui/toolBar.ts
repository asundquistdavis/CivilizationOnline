import Game from "../game/game";
import { scantAreaIcon } from "../icon";
import { Component, ComponentProps, HeaderTab, WindowTemplate } from "./component";

interface ToolBarProps extends ComponentProps {
        
    window?:WindowTemplate;
    packs:ToolBarPack[];
    justified?:'left'|'right';

}

export class ToolBar extends Component<ToolBarProps> {
    protected _props: ToolBarProps;
    protected _dependencyList: { listenerId: string, action: () => void, id?: string; }[]=[
    ];
    private _activeToolId:string='';
    private _selected:boolean=false;
    render(): void {
        if (!this.props.packs.length) {return}
        const window = this.createElement('div', this.id+'-tool-bar', 'window tool-bar-window gui-standard');
        const justified = this.props.justified||'left';
        window.className += ' ' + justified;
        const renderTab = (pack:ToolBarPack, top:HTMLElement=window, packs:ToolBarPack[]=this.props.packs) => {
            if (pack.textInputOnChange) {
                const tab = this.createTemplateElement('input', this.id+'-'+pack.id, 'window-tab', {placeholder:pack.text, type:'text', value:''}) as HTMLInputElement;
                tab.className += ' gui-standard';
                tab.addEventListener('input', ()=>pack.textInputOnChange(tab.value));
                top.appendChild(tab);
                return 
            }
            
            const tab = this.createTemplateElement('div', this.id + '-' + pack.id, 'window-tab', undefined, pack.useIcon? '':pack.text);
            if (pack.useIcon) {
                tab.className += ' icon';
                switch (pack.text) {
                    case 'scant-area': {
                        tab.appendChild(scantAreaIcon());
                        break;
                    }
                };
            }
 
            if (pack.subs&&pack.subs.length) {
                tab.addEventListener('mouseenter', ()=>{
                    const post = this.createTemplateElement('div', tab.id, 'window-post-tab');
                    post.className += ' gui-standard';
                    pack.subs.forEach(sub=>renderTab(sub, post, pack.subs));
                    tab.appendChild(post);
                });
                tab.addEventListener('mouseleave', ()=>{
                    if (pack.subs&&pack.subs.length) {
                        tab.innerHTML=pack.text;
                    }
                }); 
            } else {
                tab.addEventListener('mouseover', ()=>{
                    if (this._activeToolId===pack.id) {return}
                    packs.forEach(otherPack=>{
                        if (pack.id===otherPack.id) {return otherPack.on?.()}
                        otherPack.off?.();
                    });
                }, true);

                tab.addEventListener('mouseout', ()=>{
                    if (pack.subs&&pack.subs.length) {return}
                    if (!this._selected) {
                        packs.forEach(otherPack=>{
                            if (this._activeToolId===otherPack.id) {return otherPack.on?.()}
                            otherPack.off?.();
                        });
                    };
                    this._selected = false;
                }, true);
                tab.addEventListener('click', ()=>{
                    this._selected = true;
                    if (this._activeToolId===pack.id) {
                        this._activeToolId = '';
                        return pack.off?.();
                    }
                    packs.forEach(otherPack=>{
                        if (pack.id===otherPack.id) {return otherPack.on?.()}
                        otherPack.off?.();
                    });
                    this._activeToolId=pack.id;
                });
            }
            top.appendChild(tab);
        }
        this.props.packs.forEach((pack)=>renderTab(pack));
        this.parentElement.appendChild(window);
    }
}


export type ToolBarPack = {

    on?:()=>void,
    off?:()=>void,
    text:string,
    id:string,
    useIcon?:boolean,
    subs?:ToolBarPack[],
    textInputOnChange?:(featureName:string)=>void,

}