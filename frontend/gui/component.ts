import Game from "../game/game";
import '../styles/component.css';

export interface ComponentProps {
    parentId:string,
    id:string
}


export abstract class Component<P extends ComponentProps = ComponentProps> {

    readonly parentId:string;
    readonly id:string;
    protected _props:P;
    get props():P {return this._props};
    protected _dependencyList:{listenerId:string, action:()=>void, id?:string}[] = [];
    game:Game;

    abstract render():void;

    refresh() {

        this.parentElement.replaceChildren();

        this.render();

    }

    constructor(game:Game, props:P) {

        this.game = game;

        this.id = props.id; 

        this.parentId = props.parentId;

        this._props = props

    }

    dismount() {

        this._dependencyList.forEach(({listenerId})=>{this.game.listenerFor(listenerId).removeComponentAction(this.id)});

        this.parentElement.replaceChildren();
    
    }

    mount() {

        this._dependencyList.forEach(({listenerId, action, id})=>{
            
            const listener = this.game.listenerFor(listenerId);
            
            listener.addComponentAction(this.id, action, id);
        
        });
    
        this.render();

    }
    
    get parentElement():HTMLElement {return document.getElementById(this.parentId)};

    createElement(tagName:string, id:string, className?:string, attrs?:{[prop:string]:string}, text?:string):HTMLElement {

        const element = document.createElement(tagName);

        element.id = id;

        if (className) {element.className = className};

        if (attrs) {Object.entries(attrs).forEach(([prop, value])=>element.setAttribute(prop, value))};

        if (text) {element.innerText = text};

        return element

    }

    createTemplateElement(tagName:string, baseId:string, className:string, attrs?:{[prop:string]:string}, text?:string):HTMLElement {return this.createElement(tagName, baseId+'-'+className, className, attrs, text)};

    createWindow(parentElement:HTMLElement, id:string, titleText?:string, titleBadges:TitleBadge[]=[], headerTabs:HeaderTab[]=[], hasFooter:boolean=false):WindowTemplate {

        const window = new WindowTemplate(parentElement);
        const windowWrapper = window.wrapperElement = this.createTemplateElement('div', id, 'window-wrapper');
        const windowElement = this.createTemplateElement('div', id, 'window');
        windowElement.className += ' gui-standard';
        const windowTitleElement = window.titleElement = this.createTemplateElement('div', id, 'window-title', null, titleText);
        windowTitleElement.className += ' gui-bold';
        window.titleBadgesWrapper = this.createTemplateElement('div', id, 'window-title-badges-wrapper');
        window.wrapperElement.appendChild(window.titleBadgesWrapper);
        const createTitleBadgeElement = (titleBadge:TitleBadge) => {
            if (titleBadge.symbol==='text-input') {
                const badgeElement = this.createElement('input', id+'-'+titleBadge.id+'-window-title-badge', 'window-title-badge text-input gui-standard',
                     {type:'text', placeholder:titleBadge.text, value:''});
                window.titleBadgesWrapper.addEventListener('input', titleBadge.onClick);
                window.titleBadgesWrapper.appendChild(badgeElement);
                return
            }
            const badgeElement = this.createTemplateElement('button', id+'-'+titleBadge.id, 'window-title-badge', null, titleBadge.symbol||titleBadge.text);
            if (titleBadge.symbol&&(titleBadge.text==='close')) {
                const fullCallback = () => {
                    if (!window.hidden) {window.hide()}
                    if (titleBadge.onClick) {titleBadge.onClick()};
                };
                badgeElement.className+=' symbol-button';
                badgeElement.addEventListener('click', fullCallback);
            } else {
                if (titleBadge.onClick) {badgeElement.addEventListener('click', titleBadge.onClick)};
            }
            badgeElement.className += ' gui-standard';
            window.titleBadgesWrapper.appendChild(badgeElement);
        }
        titleBadges.forEach(createTitleBadgeElement);
        const windowHeaderElement= this.createTemplateElement('div', id, 'window-header');
        const createHeaderTabElementAndGetPack = (headerTab:HeaderTab) => {
            const tabElement = this.createTemplateElement('button', id+'-'+headerTab.id, 'window-header-tab', null, headerTab.text);
            tabElement.className += ' gui-standard';
            const onClick = () => {
                window.activeTabId = headerTab.id;
            }
            tabElement.addEventListener('click', onClick);
            windowHeaderElement.appendChild(tabElement);
            return {element:tabElement, id:headerTab.id, renderBody: headerTab.renderBody}
        }
        window.tabElementRenderAndIdList = headerTabs.map(createHeaderTabElementAndGetPack);
        const windowBodyElement = window.bodyElement = this.createTemplateElement('div', id, 'window-body');
        const windowFooterElement = window.footerElement = this.createTemplateElement('div', id, 'window-footer');
        if (titleText) {windowWrapper.appendChild(windowTitleElement)};
        if (headerTabs.length>0) {
            windowElement.appendChild(windowHeaderElement);
            window._activeTabId = window.tabElementRenderAndIdList[0].id;
        };
        windowElement.appendChild(windowBodyElement);
        if (hasFooter) {windowElement.appendChild(windowFooterElement)};
        windowWrapper.appendChild(windowElement);
        return window
    }

    toCapital(word:string):string {return word.length? word[0].toUpperCase() + word.slice(1): ''};
    toTitle(text:string):string {return text.split(/\s+/).map(this.toCapital).join(' ')};

}


import '../styles/window.css';

export type TitleBadge = {
    id:string;
    text:string;
    onClick?:(event?:InputEvent)=>void;
    symbol?:string;
};
export type HeaderTab = {
    id:string;
    text:string;
    renderBody:(parentElement:HTMLElement)=>void;
};
export class WindowTemplate {
    private _hidden:boolean = true;
    get hidden():boolean {return this._hidden}
    private _parentElement:HTMLElement;
    private _onShow:(window:WindowTemplate) => void = ()=>{};
    set onShow(value:(window:WindowTemplate)=>void) {this._onShow = value};
    tabElementRenderAndIdList:{id:string, renderBody:((parentElement:HTMLElement)=>void), element:HTMLElement}[] = [];
    _activeTabId:string=null;
    set activeTabId(value:string) {
        this._activeTabId = value;
        this.clearBody();
        this.tabElementRenderAndIdList.forEach(({element})=>{element.removeAttribute('active')});
        if (!value) {return}
        const {element, renderBody} = this.tabElementRenderAndIdList.find(({id})=>value===id);
        element.setAttribute('active', '');
        renderBody(this.bodyElement);
    }
    hide = () => {
        this.wrapperElement.remove();
        this._hidden = true;
    };
    show = () => {
        this._parentElement.appendChild(this.wrapperElement);
        this.clearBody();
        if (this.tabElementRenderAndIdList.length) {this.activeTabId=this._activeTabId};
        this._onShow(this)
        this._hidden = false;
    }
    toggle = (forceClosed=false) => {
        if (forceClosed) {return this.hide()}
        if (this.hidden) {return this.show()}
        this.hide()

    }
    clearBody():void {this.bodyElement.replaceChildren();}
    addButton(id:string, text:string, attrs?:{[prop:string]:string}, onClick?:()=>void, onEnter?:()=>void, onLeave?:()=>void):HTMLElement {
        const badgeElement = document.createElement('button');
        badgeElement.id = id;
        badgeElement.className = 'window-title-badge';
        badgeElement.innerText = text;
        if (attrs) {Object.entries(attrs).forEach(([prop, value])=>badgeElement.setAttribute(prop, value))};
        if (onClick) {badgeElement.addEventListener('click', onClick)};
        if (onEnter) {badgeElement.addEventListener('mouseenter', onEnter)};
        if (onLeave) {badgeElement.addEventListener('mouseleave', onLeave)};
        this.titleBadgesWrapper.appendChild(badgeElement);
        return badgeElement;
    }
    clearButtons() {this.titleBadgesWrapper.replaceChildren()}
    titleBadgesWrapper:HTMLElement;
    footerElement:HTMLElement;
    bodyElement:HTMLElement;
    headerElement:HTMLElement;
    wrapperElement:HTMLElement;
    titleElement:HTMLElement;
    constructor(parentElement:HTMLElement) {this._parentElement=parentElement}
};