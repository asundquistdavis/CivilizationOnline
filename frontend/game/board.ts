import '../styles/map.css';
import '../styles/board.css';
import Conn from "./conn";
import { MapArea, MapAreaList, MapFeature, MapFeatureMapping, MapFeaturesList, MapOpenSea } from "./mapFeatures";
import Game, { GameDataListener, StaticArea } from './game';

type FeatureList = '_areaList'|'_cityList'|'_volcanoList'|'_floodplainList'|'_openSeaList'|'_allFeatureList';

function clamp(number:number, lower:number, upper:number) {
    return Math.min( Math.max( number, lower ), upper)
}

const mapFeatureFunction = (feature:MapFeature) => {};
type MapActionListeners = {select:GameDataListener, hover:GameDataListener,unHover:GameDataListener, click:GameDataListener};
export type MapFeatureListeners = {action:keyof SVGElementEventMap, callback:(feature:MapFeature)=>void}[]

export class Map {

    private _isInvalid:boolean = true;
    private _scaleFactor:number;
    private _scaleMultiple:number = 1;
    private _minScaleMultiple:number = 1;
    private _maxScaleMultiple:number = 10
    private _x:number = 0;
    private _y:number = 0;
    private _width:number;
    private _height:number;
    private _isMoving: boolean=false;
    get isMoving():boolean {return this._isMoving};
    private _isClicking:boolean=false;
    get isClicking():boolean {return this._isClicking};
    set isClicking(value:boolean) {this._isClicking=value};
    private _movementSpeed: number = 3;
    private _touchX:number;
    private _touchY:number;
    boardWidth:number;
    boardHeight:number;

    private _areaList:MapAreaList;
    private _cityList:MapFeaturesList<'city', MapFeature>;
    private _volcanoList:MapFeaturesList<'volcano', MapFeature>;
    private _floodplainList:MapFeaturesList<'floodplain', MapFeature>;
    private _openSeaList:MapFeaturesList<'openSea', MapOpenSea>;
    private _allFeatureList:MapFeaturesList<any, any>;

    private _selectedFeature:MapFeature=null;
    get selectedFeature():MapFeature {return this._selectedFeature};
    private _hoveredFeature:MapFeature=null;
    get hoveredFeature():MapFeature {return this._hoveredFeature};
    clickedFeature:MapFeature=null;
    private _layers:MapAreaList[]=[];

    protected _onMouseEnterFeature = mapFeatureFunction;
    protected _onMouseLeaveFeature = mapFeatureFunction;
    protected _onMouseDownFeature = mapFeatureFunction;
    protected _onMouseUpFeature = mapFeatureFunction;
    protected _onTouchStart = mapFeatureFunction;
    protected _onTouchMove = mapFeatureFunction;
    protected _onTouchEnd = mapFeatureFunction;
    get mapFeatureListeners():MapFeatureListeners {return [
        {action:'mousedown', callback:(feature)=>this._onMouseDownFeature(feature)},
        {action:'mouseup', callback:(feature)=>this._onMouseUpFeature(feature)},
        {action:'mouseenter', callback:(feature)=>this._onMouseEnterFeature(feature)},
        {action:'mouseleave', callback:(feature)=>this._onMouseLeaveFeature(feature)},
        {action:'touchstart', callback:(feature)=>this._onTouchStart(feature)},
        {action:'touchmove', callback:(feature)=>this._onTouchMove(feature)},
        {action:'touchend', callback:(feature)=>this._onTouchEnd(feature)},
    ]};

    private _selectable:(feature:MapFeature)=>boolean=()=>true;
    set selectable(value:(feature:MapFeature)=>boolean) {this._selectable=value}
    private _hoverable:(feature:MapFeature)=>boolean=()=>true;
    set hoverable(value:(feature:MapFeature)=>boolean) {this._hoverable=value}
    
    private _listeners:MapActionListeners;
    getListener(type:keyof typeof this._listeners):GameDataListener {

        return this._listeners[type]

    }

    private _SVG:Element;
    get selectedElement():SVGElement {return this._SVG.querySelector('g[name="selected"]')}
    get hoveredElement():SVGElement {return this._SVG.querySelector('g[name="hovered"]')}

    
    private _registerSelect():void {

        this._onMouseDownFeature = this._onTouchStart = feature => {
            this.isClicking=true;
        };
        this._onMouseUpFeature = this._onTouchEnd = feature => {

            const isNotCurrentFeature = this.selectedFeature?.name !== feature.name;
            const isSelectable = this._selectable(feature);
            if (!this.isClicking) {return}
            this.clickedFeature = feature;
            this.getListener('click').fire();
            this.deselectFeature(feature);
            if (isSelectable && isNotCurrentFeature) {this.selectFeature(feature)};
            this.getListener('select').fire();
                
        };

    }

    private _registerHover():void {
        this._onMouseLeaveFeature = feature => {
            this.unHoverFeature(feature);
            this.getListener('unHover').fire();
        };

        this._onMouseEnterFeature = feature => {
            if (this._hoverable(feature)) {
                this.hoverFeature(feature);
                this.getListener('hover').fire();
            }
        };

    }

    resize() {
                const maxScaleX = this.boardWidth/this.width;
                const maxScaleY = this.boardHeight/this.height;
                if (maxScaleX > maxScaleY) {
                    this._scaleFactor = maxScaleX;
                } else {
                    this._scaleFactor = maxScaleY;
                }
                this.render();
    }

    bound() {
        const upperX = this._scaleFactor * (this._scaleMultiple - 1) / 2 / this._scaleMultiple * this.width;
        const lowerX = -(this._width*this._scaleFactor - this.boardWidth) / this._scaleMultiple - upperX
        this._x = clamp(this._x, lowerX, upperX);
        const upperY = this._scaleFactor * (this._scaleMultiple - 1) / 2 / this._scaleMultiple * this.height;
        const lowerY = -(this._height*this._scaleFactor - this.boardHeight) / this._scaleMultiple - upperY;
        this._y = clamp(this._y, lowerY, upperY);
    }

    render() {
        const scaleX = this._scaleFactor * this._scaleMultiple;
        const scaleY = scaleX;
        const shiftX = this._scaleMultiple * this._x - this._scaleFactor * (this._scaleMultiple - 1) / 2 * this.width;
        const shiftY = this._scaleMultiple * this._y - this._scaleFactor * (this._scaleMultiple - 1) / 2 * this.height;
        this._SVG.setAttribute('transform', `matrix(${scaleX} 0 0 ${scaleY} ${shiftX} ${shiftY})`);
    }

    private _panBy(x:number,y:number) {
        this._x += x / this._movementSpeed / this._scaleFactor;
        this._y += y / this._movementSpeed / this._scaleFactor;
        this.bound();
        this.render();
    }

    applyBoardListeners() {

        const onWheel = (event:WheelEvent
        ) => {
            this._scaleMultiple += event.deltaY < 0? 1: -1
            this._scaleMultiple = 
                this._scaleMultiple < this._minScaleMultiple? this._minScaleMultiple:
                this._scaleMultiple > this._maxScaleMultiple? this._maxScaleMultiple:
                this._scaleMultiple
            this.bound();
            this.render();
        }

        const onMouseDown = () => {
            this._isMoving = true;
        };

        const onMouseMove = (event:MouseEvent) => {
            if (this._isMoving) {
                this._isClicking = false;
                this._panBy(event.movementX, event.movementY);
            }
        } 

        const onMouseUp = () => {
            this._isMoving = false;
        }; 
        
        const onMouseOut = () => {
            this._isMoving = false;
        };

        const onMouseOver = (event:MouseEvent) => {
        }

        const onTouchStart = (event:TouchEvent) => {
            this._touchX = event.targetTouches[0].clientX;
            this._touchY = event.targetTouches[0].clientY;
            this._isMoving = true;
        };
        const onTouchMove = (event:TouchEvent) => {
            event.preventDefault();
            if (event.targetTouches.length>1) {
                this._isMoving = false;
            }
            if (this._isMoving) {
                this._isClicking = false;
                this._panBy(event.targetTouches[0].clientX-this._touchX, event.targetTouches[0].clientY-this._touchY);
            }
            this._touchX = event.targetTouches[0].clientX;
            this._touchY = event.targetTouches[0].clientY;

        }
        const onTouchCancel = () => {
            this._touchX=this._touchY=0;
            this._isMoving = false
        };
        const onTouchEnd = () => {
            this._touchX=this._touchY=0;
            this._isMoving = false
        };

        this._SVG.addEventListener('wheel', onWheel );
        this._SVG.addEventListener('mousedown', onMouseDown);
        this._SVG.addEventListener('mousemove', onMouseMove);
        this._SVG.addEventListener('mouseup', onMouseUp);
        this._SVG.addEventListener('mouseleave', onMouseOut);
        this._SVG.addEventListener('mouseover', onMouseOver);

        this._SVG.addEventListener('touchstart', onTouchStart)
        this._SVG.addEventListener('touchmove', onTouchMove)
        this._SVG.addEventListener('touchcancel', onTouchCancel)
        this._SVG.addEventListener('touchend', onTouchEnd)

    }

    getMapFeaturesOfType(featureType:keyof MapFeatureMapping|'allFeature') {
        const key = '_'+featureType+'List' as FeatureList;
        return this[key]
    }


    selectFeature(feature:MapFeature):void {

        const copy = feature.copyElement();
        copy.setAttribute('selected', '');
        this.selectedElement.appendChild(copy);
        this._selectedFeature = feature;

    }

    deselectFeature(feature:MapFeature):void {

        this.selectedElement.replaceChildren();
        this._selectedFeature = null

    }

    unHoverFeature(feature:MapFeature):void {
        
        this.hoveredElement.replaceChildren();
        this._hoveredFeature = feature
    
    }

    hoverFeature(feature:MapFeature):void {
        const copy = feature.copyElement();
        copy.setAttribute('hovered', '');
        this.hoveredElement.replaceChildren(copy);
        this._hoveredFeature = feature;

    }

    clearLayer(layerName:string) {
        document.querySelectorAll(`g[name="overlay"] path[layer="${layerName}"]`).forEach(element=>element.remove())
    }

    addLayer(features:MapFeature[], layerName:string, useCover=true, styleProps?:{[prop:string]:string|((feature:MapFeature)=>string)}) {
        this._layers.push(MapFeaturesList.layer(features, layerName, useCover, styleProps));
    }

    constructor(listeners:MapActionListeners) {
        this._SVG = document.getElementById('mapSVG');
        if (!this._SVG) {return}
        this._width = parseInt(this._SVG.getAttribute('width'));
        this._height = parseInt(this._SVG.getAttribute('height'));
        if (Number.isNaN(this._width) || Number.isNaN(this._height)) {return}
        this._isInvalid = false;
        this._listeners = listeners;
        this.applyBoardListeners();
        ({area:this._areaList, openSea:this._openSeaList, volcano:this._volcanoList, floodplain:this._floodplainList, city:this._cityList} = MapFeaturesList.createAll(this.mapFeatureListeners))
        this._allFeatureList = MapFeaturesList.join(this._areaList, this._cityList, this._floodplainList, this._openSeaList, this._volcanoList);
        this._registerHover();
        this._registerSelect();

    }

    get isInvalid() {return this._isInvalid}
    get width() {return this._width}
    get height() {return this._height}

}

export default class Board {

    private _parentId:string='root';
    private _element:Element;
    private _width:number;
    private _height:number;
    private _mapContainerElement:Element;
    private _mapIsReady:boolean = false;
    private _map:Map;
    private _mapWhenReadyActions:((map:Map)=>void)[]=[];
    private _listeners:{select:GameDataListener, hover:GameDataListener,unHover:GameDataListener, click:GameDataListener};
    private resize() {
        this._width = this._element.clientWidth;
        this._height = this._element.clientHeight;
        if (this.mapIsReady) {
            this._map.boardWidth = this._width;
            this._map.boardHeight = this._height;
            this._map.resize();
        }
    };

    static createAndGet(listeners:{hover:GameDataListener, unHover:GameDataListener, select:GameDataListener, click:GameDataListener}) {

        return new Board(listeners);

    }

    private applyMapReadyActions() {

        for (const callback of this._mapWhenReadyActions) {

            callback(this.map);

        }

    }


    loadMap(conn:Conn, targetMapId:string='standard.html'):Promise<void> {
        // lock the map from being used
        this._mapIsReady = false;

        // request map from server
        conn.emit('requestMap', {targetMapId});

        return new Promise<void>((resolve, reject)=>{

            // when map data is received... 
            conn.on('sendMap', (data) => {
                // convert binary data into string
                const decoder = new TextDecoder('utf-8');
                const unit8Array = new Uint8Array(data.map as ArrayBuffer);
                const mapString = decoder.decode(unit8Array);
                
                // insert map string into the map container
                this._mapContainerElement.innerHTML = mapString;
                
                // create new map object
                this._map = new Map(this._listeners);
                
                // abort if map is invalid
                if (this._map.isInvalid) {reject(null)}

                // unlock map
                this._mapIsReady = true
                
                // resize map (and board)
                this.resize();

                // this.map.getMapFeaturesOfType('area').setOnMouseDown(feature=>this.map.selectFeature(feature));
                // this.map.getMapFeaturesOfType('area').activate();
                
                this.applyMapReadyActions();

                resolve(null)
            })
        })

    }

    get map() {
        if (!this.mapIsReady) {
            return null
        }
        return this._map
    }

    mapWhenReady(callback:(map:Map)=>void):void {

        if (this.map) {return callback(this.map)}
        this._mapWhenReadyActions.push(callback);

    }

    get mapIsReady() {return this._mapIsReady}

    constructor(listeners:MapActionListeners) {
        this._listeners = listeners;
        this._element = document.createElement('div');
        this._mapContainerElement = document.createElement('div');
        this._element.id = 'board';
        this._mapContainerElement.id = '@map';
        this._element.appendChild(this._mapContainerElement);
        document.getElementById(this._parentId).appendChild(this._element);
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

}





    // downloadMapSVG():void {

    //     this.map.getMapFeaturesOfType('area').deactivate();
    //     this.map.getMapFeaturesOfType('water').deactivate();
    //     this.map.getMapFeaturesOfType('city').deactivate();
    //     this.map.getMapFeaturesOfType('floodplain').deactivate();
    //     this.map.getMapFeaturesOfType('volcano').deactivate();
    //     const svg = document.getElementById('mapSVG').outerHTML;
    //     const blob = new Blob([svg], {type:'text/html'});
    //     const a = document.createElement('a');
    //     a.href = URL.createObjectURL(blob);
    //     a.download = 'mapSVG.html';
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    //     URL.revokeObjectURL(a.href);

    // }

    // applyAreas(areas:StaticArea[]):void {

    //     const areaFeatures = this.map.getMapFeaturesOfType('area');
    //     const waterFeatures = this.map.getMapFeaturesOfType('water');
    //     const waterFeatureNames = waterFeatures.map(feature=>feature.name);
    //     areas.forEach((area)=>{
    //         console.log('adjacentCoastalAreas, adjacentWaterAreas');
    //         const areaName = area.name;
    //         const possibleAreaFeature = areaFeatures.find(feature=>feature.name===areaName);
    //         const feature = possibleAreaFeature||waterFeatures.find(feature=>feature.name===areaName);
    //         const landAdjacentAreas = (area.landAdjacent?.length > 0)? area.landAdjacent.join('|'): null;
    //         if (landAdjacentAreas) {feature.element.setAttribute('adjacent-land-areas', landAdjacentAreas)};
    //         const waterAdjacent = area.waterAdjacent;
    //         const [adjacentCoastalAreas, adjacentWaterAreas] = waterAdjacent.reduce((partitionedArray, currentAreaName)=>{
    //             if (waterFeatureNames.find(name=>name===currentAreaName)) {partitionedArray[1].push(currentAreaName)}
    //             else {partitionedArray[0].push(currentAreaName)}
    //             return partitionedArray
    //         }, [[],[]]) as [string[], string[]];
    //         console.log(adjacentCoastalAreas, adjacentWaterAreas);
    //         if (adjacentCoastalAreas.length>0) {feature.element.setAttribute('adjacent-coastal-areas', adjacentCoastalAreas.join('|'))};
    //         if (adjacentWaterAreas.length>0) {feature.element.setAttribute('adjacent-water-areas', adjacentWaterAreas.join('|'))};
    //         const startingCivilization = area.startingCivilization;
    //         const isStartingArea = area.isStartingArea;
    //         if (isStartingArea) {feature.element.setAttribute('is-starting-area', '')}
    //         if (startingCivilization) {feature.element.setAttribute('starting-civilization', startingCivilization)};
    //     });
    
    // }
