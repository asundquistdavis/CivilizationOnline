import GUIComponentBase, { GUIComponentProps } from "./base";
import '../styles/window.css';

export class WindowComponentProps implements GUIComponentProps {
    parentId:string;
    id:string;
    title?:((windowComponent:WindowComponent)=>string)|string;
    titleBadges:{text:string, idSpecifier:string, symbol?:string, onClick?:(event:PointerEvent)=>void}[]=[];
    tabs:{
        text:string, 
        idSpecifier:string, 
        onClick:(event:PointerEvent)=>void,
        constructorAndPropsGetter:()=>{ComponentConstructor: typeof GUIComponentBase<GUIComponentProps>, props: any},
        applyOnActiveAndOnReset?:{onActive:(element:HTMLElement)=>void, onReset:(element:HTMLElement)=>void}
    }[]=[];
    hasFooter:boolean=false;
}

type TabInfo ={
    idSpecifier:string,
    element:HTMLElement,
    constructorAndPropsGetter:()=>{ComponentConstructor:typeof GUIComponentBase<GUIComponentProps>, props:any},
    applyOnActiveAndOnReset?:{onActive:(element:HTMLElement)=>void, onReset:(element:HTMLElement)=>void}
} 

export default class WindowComponent extends GUIComponentBase<WindowComponentProps> {
    
    protected _props: WindowComponentProps;
    protected _id:string
    // elements
    titleElement?:HTMLElement;
    titleBadgeIdSpecifierAndElementList:{idSpecifier:string, element:HTMLElement}[]=[];
    headerElement?:HTMLElement;
    tabIdSpecifierAndElementList:TabInfo[]=[];
    bodyElement:HTMLElement;
    footerElement?:HTMLElement;
    // internal state
    private _isMinimized:boolean=false;
    private _activeTabId:string;
    create(): void {
        if (this._isMinimized) {
            return
        }
        const windowElementId = this._id = this._props.id; 
        const wrapperElement = this.createElement('div', windowElementId+'-wrapper', 'window-wrapper');
        const windowElement = this.createElement('div', windowElementId, 'window');
        wrapperElement.appendChild(windowElement)
        if (this._props.title) {
            const titleElement = this.titleElement = this.createElement('div', windowElementId+'-title', 'window-title gui-bold');
            this.updateTitle();
            wrapperElement.appendChild(titleElement);
        }
        if (this._props.titleBadges?.length > 0) {
            const titleBadgesWrapperElement = this.createElement('div', windowElementId+'-title-badges-wrapper', 'window-title-badges-wrapper');
            this.titleBadgeIdSpecifierAndElementList = this._props.titleBadges.map(({idSpecifier, text, symbol, onClick})=>{
                const newOnClick = (event:PointerEvent) => {
                    if (idSpecifier === 'minimize') {
                        this.minimize();
                        if (onClick) {onClick(event)};
                    }
                }
                const className = 'window-title-badge gui-highlight' + (symbol? ' symbol-button': '');
                const titleBadgeElement = this.createElement('button', windowElementId+'-'+idSpecifier+'-title-button', className);
                titleBadgeElement.innerText = symbol? symbol : text;
                titleBadgeElement.addEventListener('click', newOnClick);
                titleBadgesWrapperElement.appendChild(titleBadgeElement);
                return {idSpecifier, element:titleBadgeElement}
            });
            wrapperElement.appendChild(titleBadgesWrapperElement);
        }
        if (this._props.tabs.length > 0) {
            this.headerElement = this.createElement('div', windowElementId+'-header', 'window-header');
            windowElement.appendChild(this.headerElement);
        };
        const bodyElement = this.bodyElement = this.createElement('div', windowElementId+'-body', 'window-body gui-standard');
        windowElement.appendChild(bodyElement);
        if (this._props.hasFooter) {
            const footerElement = this.footerElement = this.createElement('div', windowElementId+'-footer', 'window-footer');
            windowElement.appendChild(footerElement);
        }
        this.parentElement.appendChild(wrapperElement);
        if (this._props.tabs.length > 0) {
            this.tabIdSpecifierAndElementList = this._props.tabs.map(({idSpecifier, text, onClick, constructorAndPropsGetter, applyOnActiveAndOnReset})=>{
                const tabElement = this.createElement('button', windowElementId+'-'+idSpecifier+'-tab', 'window-tab gui-standard');
                tabElement.innerText = text;
                const newOnClick = (event:PointerEvent) => {
                    bodyElement.replaceChildren();
                    this.setActiveTab(idSpecifier);
                    if (onClick) {onClick(event)}
                } 
                tabElement.addEventListener('click', newOnClick)
                this.headerElement.appendChild(tabElement);
                return {idSpecifier, element:tabElement, constructorAndPropsGetter, applyOnActiveAndOnReset}
            })
            this.setActiveTab(this.tabIdSpecifierAndElementList[0].idSpecifier);
        }
    }
    updateTitle():void {
        if (!this.titleElement) {return}    
        this.titleElement.innerText = (typeof this._props.title==='function')? this._props.title(this): this._props.title;
    }
    minimize():void {
        this.remove();
        this._isMinimized = true;
        this.create();
    }
    maximize():void {
        this.remove();
        this._isMinimized = false;
        this.create();
    }
    setActiveTab(targetTabId:string):void {
        this.unRegisterComponent('body');
        this.tabIdSpecifierAndElementList.forEach(({idSpecifier, element, constructorAndPropsGetter, applyOnActiveAndOnReset})=>{
            const {ComponentConstructor, props} = constructorAndPropsGetter();
            const onActive = applyOnActiveAndOnReset?.onActive;
            const onReset = applyOnActiveAndOnReset?.onReset
            if (targetTabId === idSpecifier) {
                element.setAttribute('active','');
                if (onActive) {onActive(element)};
                this.registerComponent<any, any, any>(ComponentConstructor, {...props, parentId:this.bodyElement.id, id: 'body'})
            }
            else {
                element.removeAttribute('active')
                if ((idSpecifier === this._activeTabId)&&(onReset)) {onReset(element)}
            }
        });
        this._activeTabId=targetTabId
    }
}


