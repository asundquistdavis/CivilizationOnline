import GUIComponentBase, { GUIComponentProps } from "./base";

export class WindowComponentProps implements GUIComponentProps {
    parentId:string;
    id:string;
    title?:string;
    titleBadges:{text:string, idSpecifier:string, symbol?:string, onClick?:(event:PointerEvent)=>void}[]=[]
    hasHeader:boolean=false;
    tabs:{text:string, idSpecifier:string, onClick:(event:PointerEvent)=>void}[]=[]
    hasFooter:boolean=false;
}

export default class WindowComponent extends GUIComponentBase<WindowComponentProps> {
    protected _props: WindowComponentProps;
    protected _id:string
    // elements
    titleElement?:HTMLElement;
    titleBadgeNameAndElementList:{idSpecifier:string, element:HTMLElement}[]=[];
    headerElement?:HTMLElement;
    tabNameAndElementList:{idSpecifier:string, element:HTMLElement}[]=[];
    bodyElement:HTMLElement;
    footerElement?:HTMLElement;
    // internal state
    private _isMinimized:boolean=false;
    create(): void {
        if (this._isMinimized) {
            return
        }
        const windowElementId = this._id = this._props.id; 
        const wrapperElement = this.createElement('div', windowElementId+'-wrapper', 'window-wrapper');
        const windowElement = this.createElement('div', windowElementId, 'window');
        wrapperElement.appendChild(windowElement)
        if (this._props.title) {
            const titleElement = this.titleElement = this.createElement('div', windowElementId+'-title', 'window-title');
            wrapperElement.appendChild(titleElement);
        }
        if (this._props.titleBadges.length > 0) {
            const titleBadgesWrapperElement = this.createElement('div', windowElementId+'-title-buttons-wrapper', 'window-title-badges-wrapper');
            this.titleBadgeNameAndElementList = this._props.titleBadges.map(({idSpecifier, text, symbol, onClick})=>{
                const newOnClick = (event:PointerEvent) => {
                    if (idSpecifier === 'minimize') {
                        this.minimize();
                        if (onClick) {onClick(event)};
                    }
                }
                const titleBadgeElement = this.createElement('button', windowElementId+'-'+idSpecifier+'-title-button', 'window-title-badge');
                titleBadgeElement.innerText = symbol? symbol : text;
                titleBadgeElement.addEventListener('click', newOnClick);
                titleBadgesWrapperElement.appendChild(titleBadgeElement);
                return {idSpecifier, element:titleBadgeElement}
            });
            wrapperElement.appendChild(titleBadgesWrapperElement);
        }
        if (this._props.hasHeader) {
            const headerElement = this.headerElement = this.createElement('div', windowElementId+'-header', 'window-header');
            this.tabNameAndElementList = this._props.tabs.map(({idSpecifier, text, onClick})=>{
                const tabElement = this.createElement('button', windowElementId+'-'+idSpecifier+'-tab', 'window-tab-element');
                tabElement.innerText = text;
                if (onClick) {tabElement.addEventListener('click', onClick)}
                headerElement.appendChild(tabElement);
                return {idSpecifier, element:tabElement}
            })
            windowElement.appendChild(headerElement);
        }
        const bodyElement = this.bodyElement = this.createElement('div', windowElementId+'-body', 'window-body');
        windowElement.appendChild(bodyElement);
        if (this._props.hasFooter) {
            const footerElement = this.footerElement = this.createElement('div', windowElementId+'-footer', 'window-footer');
            windowElement.appendChild(footerElement);
        }
    }
    reset(): void {
        this.parentElement.replaceChildren();
    }
    minimize():void {
        this.reset();
        this._isMinimized = true;
        this.create();
    }
    maximize():void {
        this.reset();
        this._isMinimized = false;
        this.create();
    }
}


