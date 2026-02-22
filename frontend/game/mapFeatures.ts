import { Map, MapFeatureListeners } from "./board";


export type MapFeatureMapping = {
    'area': MapArea,
    'city': MapFeature,
    'floodplain': MapFeature,
    'openSea': MapOpenSea,
    'volcano':MapFeature,
}

export class MapFeature {

    protected _element:SVGElement;
    get element():SVGElement {return this._element};
    protected _name:string;
    get name():string {return this._name};
    constructor(element:SVGElement) {
        this._element = element;
        this._name = element.getAttribute('name');
    }

    applyListeners( listeners:{action:keyof SVGElementEventMap, callback:(feature:MapFeature)=>void}[]) {
        
        listeners.forEach(({action, callback})=>{
            this._element.addEventListener(action, (event)=>{callback(this)})
        })

    }

    activate() {
        this._element.setAttribute('active', '');
    }

    deactivate() {
        this._element.removeAttribute('active');
    }

    copyElement(useCover=true):SVGElement {
        
        const copyElement = this._element.cloneNode() as SVGElement;
        copyElement.removeAttribute('active');
        return copyElement

    }

}

export class MapFeaturesList<K extends keyof MapFeatureMapping, T extends MapFeatureMapping[K]> {

    private _features:T[]=[];
    get features():T[] {return this._features}

    activate():void {
        this._features.forEach(feature=>feature.activate());
    }

    deactivate():void {
        this._features.forEach(feature=>feature.deactivate());
    }

    forEach(callback:(feature:T)=>void):void {

        this._features.forEach(callback);

    }

    map<G>(callback:(feature:T)=>G):G[] {

        return this._features.map(callback);

    }

    find(predicate:(feature:T)=>boolean):T {

        return this._features.find(predicate);

    }

    filter(predicate:(feature:T)=>boolean):T[] {

        return this._features.filter(predicate);
    
    }

    static join(...featureLists:MapFeaturesList<any, any>[]):MapFeaturesList<any, any> {

        const featureList = new MapFeaturesList;
        featureList._features = [].concat(...featureLists.map(list=>list._features));
        return featureList

    }

    static layer(features:MapFeature[], layerName:string, useCover=true, styleProps?:{[prop:string]:string|((feature:MapFeature)=>string)}):MapFeaturesList<any, any> {
        const overlayElement = document.querySelector('g[name="overlay"]')
        features.forEach(feature=>{
            const copyElement = (feature as MapArea).copyElement(useCover);
            copyElement.setAttribute('layer', layerName);
            if (styleProps) {Object.entries(styleProps).forEach(([key, value])=>{
                if (typeof value === 'function') {
                    copyElement.style.setProperty(key, value(feature));
                } else {
                    copyElement.style.setProperty(key, value);
                }
            })}
            overlayElement.appendChild(copyElement);
        });
        const featureList = new MapFeaturesList;
        featureList._features = features;
        return featureList
    };
    
    static createAll(listeners:MapFeatureListeners):{[type in keyof MapFeatureMapping]: MapFeaturesList<type, MapFeatureMapping[type]>} {
        const areas = new MapAreaList;
        const openSeas = new MapOpenSeaList;
        const volcanos = new MapVolcanoList;
        const floodplains = new MapFloodplainList;
        const cities = new MapCityList;
        const elements = Array.from(document.querySelectorAll(
            'path[type="land"], path[type="coastal"], path[type="water"], path[type="city"], path[type="floodplain"], path[type="volcano"]'
        )) as SVGElement[];
        elements.forEach(element => {
            const type = element.getAttribute('type');
            switch (type) {
                case 'coastal':
                case 'land': {
                    const mapArea = new MapArea(element);
                    mapArea.applyListeners(listeners);
                    areas._features.push(mapArea);
                    break;
                }
                case 'water': {
                    const mapOpenSea = new MapOpenSea(element);
                    mapOpenSea.applyListeners(listeners);
                    openSeas._features.push(mapOpenSea);
                    break;
                }
                case 'city': {
                    const mapCity = new MapFeature(element);
                    mapCity.applyListeners(listeners);
                    cities._features.push(mapCity);
                    break;
                }
                case 'volcano': {
                    const mapVolcano = new MapFeature(element);
                    mapVolcano.applyListeners(listeners);
                    volcanos._features.push(mapVolcano);
                    break;
                }
                case 'floodplain': {
                    const mapFloodplain = new MapFeature(element);
                    mapFloodplain.applyListeners(listeners);
                    floodplains._features.push(mapFloodplain);
                    break;
                }
            }
        });
        areas.forEach(feature=>{
            const adjacentLandAreas = feature.adjacentLandAreaNames.map(name=> {
                return areas.find(landFeature=>landFeature.name===name)
            });
            const adjacentCoastalAreas = feature.adjacentCoastalAreaNames.map(name=> {
                return areas.find(coastalFeature=>coastalFeature.name===name)
            });
            const adjacentOpenSeas = feature.adjacentOpenSeaNames.map(name=> {
                return openSeas.find(openSeaFeature=>openSeaFeature.name===name)
            });
            feature.setAdjacentLandAreas(adjacentLandAreas);
            feature.setAdjacentCoastalAreas(adjacentCoastalAreas);
            feature.setAdjacentOpenSeas(adjacentOpenSeas);
        })
        openSeas.forEach(feature=>{
            const adjacentCoastalAreas = feature.adjacentCoastalAreaNames.map(name=> {
                return areas.find(coastalFeature=>coastalFeature.name===name)
            }) as MapArea[];
            const adjacentOpenSeas = feature.adjacentOpenSeaNames.map(name=> {
                return openSeas.find(openSeaFeature=>openSeaFeature.name===name)
            }) as MapOpenSea[];
            feature.setAdjacentCoastalAreas(adjacentCoastalAreas);
            feature.setAdjacentOpenSeas(adjacentOpenSeas);
        })
        return {
            area: areas,
            city: cities,
            floodplain: floodplains,
            openSea: openSeas,
            volcano: volcanos
        }
    }
}


export class MapArea extends MapFeature {

    private _coverElement?:SVGElement = document.querySelector(`path[type="cover"][name="${this._name}"]`);
    get coverElement():SVGElement {return this._coverElement}
    private _support:number = parseFloat(document.querySelector(`circle[support][name="${this._name}"]`).getAttribute('value'));
    get support():number {return this._support};
    private _cityElement?:SVGElement = document.querySelector(`path[type="city"][name="${this._name}"]`); 
    get hasCity():boolean {return !!this?._cityElement};
    get hasFloodplainCity():boolean {return !!this?._cityElement?.hasAttribute('floodplaincity')};
    private _volcanoName?:string = this._element.getAttribute('volcano');
    get hasVolcano():boolean {return !!this._volcanoName};
    get startingCivilization():string {return this._element.getAttribute('starting-civilization')};
    get isStartingArea():boolean {return this._element.hasAttribute('is-starting-area')};
    get adjacentLandAreaNames():string[] {return this._element.getAttribute('adjacent-land-areas')?.split('|')||[]};
    get adjacentCoastalAreaNames():string[] { return this._element.getAttribute('adjacent-coastal-areas')?.split('|')||[]};
    get adjacentOpenSeaNames():string[] {return this._element.getAttribute('adjacent-water-areas')?.split('|')||[]};
    private _adjacentLandAreas:MapArea[] = [];
    private _adjacentCoastalAreas:MapArea[] = [];
    private _adjacentOpenSeas:MapOpenSea[] = [];
    get adjacentLandAreas():MapArea[] {return this._adjacentLandAreas};
    get adjacentCoastalAreas():MapArea[] {return this._adjacentCoastalAreas};
    get adjacentOpenSeas():MapOpenSea[] {return this._adjacentOpenSeas};
    setAdjacentLandAreas(values:MapArea[]):void {this._adjacentLandAreas = values};
    setAdjacentCoastalAreas(values:MapArea[]):void {this._adjacentCoastalAreas = values};
    setAdjacentOpenSeas(values:MapOpenSea[]):void {this._adjacentOpenSeas = values};


    copyElement(useCover=true):SVGElement {
        
        // if (!useCover) {
        //     const defs = document.createElement('defs');
        //     const clipPath = document.createElement('clipPath');
        //     const copyElement = this.element.cloneNode() as SVGAElement;
        //     const copyCoverElement = this.coverElement.cloneNode() as SVGAElement;
        //     clipPath.id = this.name.split(' ').join('-') + '-clip-path';
        //     copyElement.removeAttribute('active');
        //     copyElement.setAttribute('clip-path', `url(#${clipPath.id})`);
        //     copyCoverElement.removeAttribute('active');
        //     defs.appendChild(clipPath);
        //     clipPath.appendChild(copyCoverElement);
        //     copyElement.style.setProperty('fill', 'black');
        //     copyElement.appendChild(defs);
        //     return copyElement
        // }
        const copyElement = (useCover&&this._coverElement? this.coverElement.cloneNode(): this._element.cloneNode()) as SVGElement;
        copyElement.removeAttribute('active');
        return copyElement

    }

}

export class MapOpenSea extends MapFeature {

    get adjacentCoastalAreaNames():string[] {return this._element.getAttribute('adjacent-coastal-areas')?.split('|')||[]};
    get adjacentOpenSeaNames():string[] {return this._element.getAttribute('adjacent-water-areas')?.split('|')||[]};
    private _adjacentCoastalAreas:MapArea[] = [];
    private _adjacentOpenSeas:MapOpenSea[] = [];
    get adjacentCoastalAreas():MapArea[] {return this._adjacentCoastalAreas};
    get adjacentOpenSeas():MapOpenSea[] {return this._adjacentOpenSeas};
    setAdjacentCoastalAreas(values:MapArea[]):void {this._adjacentCoastalAreas = values};
    setAdjacentOpenSeas(values:MapOpenSea[]):void {this._adjacentOpenSeas = values};
    
}

export interface MapCity extends MapFeature {}; 
export interface MapFloodplain extends MapFeature {}; 
export interface MapVolcano extends MapFeature {}; 


export class MapAreaList extends MapFeaturesList<'area', MapArea> {};
export class MapOpenSeaList extends MapFeaturesList<'openSea', MapOpenSea> {};
export class MapFloodplainList extends MapFeaturesList<'floodplain', MapFloodplain> {};
export class MapVolcanoList extends MapFeaturesList<'volcano', MapVolcano> {};
export class MapCityList extends MapFeaturesList<'city', MapCity> {};