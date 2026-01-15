export type MapFeatureType = 'area'|'city'|'floodplain'|'water'|'volcano';

export class MapFeature {

    protected _element:Element;
    protected _type:MapFeatureType;    
    protected _name:string;
    constructor(element:Element) {
        this._element = element;
        const type = element.getAttribute('type');
        if (['area','city','floodplain','water','volcano'].includes(type)) {this._type = type as MapFeatureType}
        this._name = element.getAttribute('name');
    }

    asDBSafe() {
        return {
            name:this._name,
            type:this._type,
        }
    }

    activate() {
        this._element.setAttribute('active', '');
    }

    deactivate() {
        this._element.removeAttribute('active');
    }

    

}

export class MapFeaturesList {

    private _features: Array<MapFeature>
    constructor(mapElements:Array<Element>) {
        this._features = mapElements.map(element=>new MapFeature(element));
    }

    asDBSafeList() {
        return this._features.map(feature=>feature.asDBSafe())
    }

    activate() {
        this
    }

}

export class MapFeaturesListOfType<FT extends MapFeature> extends MapFeaturesList {}

export class MapArea extends MapFeature {

    constructor(element:Element) {
        super(element);
        this._type = 'area';
    }

}

export class MapAreasList extends MapFeaturesListOfType<MapArea> {}