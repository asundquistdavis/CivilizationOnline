import GUIComponentBase from "./base";
import '../styles/form.css'

export class FormComponentProps {
    parentId:string;
    id:string;
    type:'text'|'number'|'select'='text';
    text?:string;
    value?:string;
    placeholder?:string;
    onChange?:(event:Event)=>void;
    hasLabelFirst?:boolean=true;
    options?:FormOption[]=[];
    defaultOption?:FormOption;
}

export type FormOption = {
    idSpecifier:string,
    text:string,
    styleProps?:{[key:string]:string}
}

export default class FormComponent extends GUIComponentBase<FormComponentProps> {
    protected _props: FormComponentProps;
    protected _id: string;
    create(): void {
        const id = this._id = this._props.id;
        const wrapperElement = this.createElement('div', id+'-wrapper', 'form-wrapper');
        const inputElement = (this._props.type!=='select')?this.createElement('input', id+'-input', 'form-input'):this.createElement('select', id+'-input', 'form-select');
        if (this._props.options.length>0) {
            const defaultOption = this.createElement('option', id+'-default-option', 'form-option default-option', {value:'default'});
            if (this._props.defaultOption?.styleProps) {Object.entries(this._props.defaultOption?.styleProps).forEach(([key, value])=>inputElement.style.setProperty(key, value))};
            defaultOption.innerText = this._props.defaultOption?.text||'default';
            inputElement.appendChild(defaultOption)
            const newOnchange = (event:Event) => {
                const targetId = (event.target as HTMLSelectElement).value;
                const targetOption = this._props.options.find(option=>option.idSpecifier===targetId);
                Object.entries(targetOption.styleProps).forEach(([key, value])=>inputElement.style.setProperty(key, value));
                if (this._props.onChange) {this._props.onChange(event)}
            } 
            inputElement.addEventListener('change', newOnchange);
            if (this._props.value) {inputElement.setAttribute('value', this._props.value)}
        }
        this._props.options.forEach(({idSpecifier, text, styleProps})=>{
            const optionElement = this.createElement('option', id+'-'+idSpecifier+'-option', 'form-option', {value:idSpecifier});
            optionElement.innerText = text;
            if (styleProps) {Object.entries(styleProps).forEach(([key, value])=>optionElement.style.setProperty(key, value))}
            inputElement.appendChild(optionElement);
        })
        if (this._props.placeholder) {inputElement.setAttribute('placeholder', this._props.placeholder)}
        if (this._props.text) {
            const labelElement = this.createElement('label', id+'-input', 'form-label');
            labelElement.innerText = this._props.text 
            if (this._props.hasLabelFirst) {
                wrapperElement.appendChild(labelElement);
                wrapperElement.appendChild(inputElement); 
            } else {
                wrapperElement.appendChild(inputElement);
                wrapperElement.appendChild(labelElement);
            }
        } else {wrapperElement.appendChild(inputElement)}
        this.parentElement.appendChild(wrapperElement);
    }
}
