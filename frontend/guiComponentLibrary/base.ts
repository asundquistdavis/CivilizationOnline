export type GUIComponentProps = {
    parentId: string;
}

export default abstract class GUIComponentBase<P extends GUIComponentProps> {
    protected abstract _props:P;
    protected abstract readonly _id:string;
    protected _components: GUIComponentBase<GUIComponentProps>[] = [];
    protected _events:any[] = [];
    abstract create():void;
    abstract reset(): void;
    registerComponent<P extends GUIComponentProps, T extends GUIComponentBase<P>, C extends { new(): T; }>(ComponentConstructor: C, props: P): T {
        console.log(this)
        const component = new ComponentConstructor;
        component._props = props;
        this._components.push(component);
        component.create();
        return component
    }
    unRegisterComponent(componentId: string): void {
        this._components = this._components.filter(component => {
            if (component._id === componentId) {return true}
            else {
                component._components.forEach(component=>component.reset())
                component.reset();
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
    get events() {
        return this._events
    }
    get id() {return this._id}

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
