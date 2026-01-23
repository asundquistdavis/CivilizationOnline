import { AnyData, DataListener } from "../data";

export type GUIComponentProps = {
    parentId: string;
    data?: AnyData;
}

export default abstract class GUIComponentBase<P extends GUIComponentProps> {
    private _listeners:DataListener<any>[]=[];
    private _isOn : boolean;
    public get isOn() : boolean {return this._isOn}
    protected abstract _props:P;
    protected abstract readonly _id:string;
    protected _components: GUIComponentBase<GUIComponentProps>[] = [];
    abstract create():void;
    turnOff(): void {
        this._isOn = false;
        this.remove();
    };
    turnOn():void {
        this._isOn = true;
        this.create();
    }
    remove():void {
        this.parentElement.replaceChildren();
        this._components=[];
    }
    registerComponent<P extends GUIComponentProps, T extends  GUIComponentBase<GUIComponentProps>, C extends { new(): T}>(ComponentConstructor: C, props: P, listeners:DataListener<any>[]=[]): T {
        const component = new ComponentConstructor;
        component._props = props;
        this._components.push(component);
        component.create();
        component._isOn=true
        if (listeners.length>0) {
            listeners.forEach(<K extends keyof AnyData>(listener:DataListener<K>)=>{
                listener.addComponent(this)
            });
        }
        return component
    }
    unRegisterComponent(componentId: string): void {
        this._components = this._components.filter(component => {
            if (component._id !== componentId) {return true}
            else {
                const removeListener = (component:GUIComponentBase<GUIComponentProps>) => component._listeners.forEach(listener=>listener.removeComponent(component));
                removeListener(this);
                component._components.forEach(removeListener);
                component.remove();
                return false    
            }
        })
    }

    get props() {
        return this._props
    }
    get components() {
        return this._components
    }
    get id() {return this._id}
    getComponentWith(componentId:string) {
        return this._components.find(component=>component._id===componentId);
    }

    createElement(tag:string, id:string, className?:string, attrs?:{[prop:string]:string}):HTMLElement {
        const element = document.createElement(tag);
        element.id = id;
        element.className = className||'';
        if (attrs) {Object.entries(attrs).forEach(([prop, value])=>element.setAttribute(prop, value))}
        return element
    };
    createWindowComponent() {}

    get parentElement():HTMLElement {return document.getElementById(this._props.parentId)}
}
