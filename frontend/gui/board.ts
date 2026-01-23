import { Socket } from "socket.io-client";
import './styles/map.css';
import './styles/board.css';
import { MapFeaturesList, MapFeatureType } from "./mapFeatures";
import Conn from "./conn";

function clamp(number:number, lower:number, upper:number) {
    return Math.min( Math.max( number, lower ), upper)
}

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
    private _isMoving: boolean;
    private _SVG:Element;
    private _movementSpeed: number = 3;
    boardWidth:number;
    boardHeight:number;

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

    applyListeners() {

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
                this._x += event.movementX / this._movementSpeed / this._scaleFactor;
                this._y += event.movementY / this._movementSpeed / this._scaleFactor;
                this.bound();
                this.render();
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

        this._SVG.addEventListener('wheel', onWheel );
        this._SVG.addEventListener('mousedown', onMouseDown);
        this._SVG.addEventListener('mousemove', onMouseMove);
        this._SVG.addEventListener('mouseup', onMouseUp);
        this._SVG.addEventListener('mouseleave', onMouseOut);
        this._SVG.addEventListener('mouseover', onMouseOver);

    }

    getMapFeaturesOfType(type:MapFeatureType) {
        if (type==='area') {
            return new MapFeaturesList(Array.from(this._SVG.querySelectorAll('path[type="cover"], path[type="land"]')));
        }
        return new MapFeaturesList(Array.from(this._SVG.querySelectorAll(`path[type="${type}"]`)));
    }

    constructor() {
        this._SVG = document.getElementById('mapSVG');
        if (!this._SVG) {return}
        this._width = parseInt(this._SVG.getAttribute('width'));
        this._height = parseInt(this._SVG.getAttribute('height'));
        if (Number.isNaN(this._width) || Number.isNaN(this._height)) {return}
        this._isInvalid = false
        this.applyListeners();
        this.getMapFeaturesOfType('area');

    }

    deactivateFloodplains() {
        const fp = this._SVG.querySelectorAll('path[type="floodplain"]')
        fp.forEach(fp=>{
            fp.setAttribute('inactive', '')
        })
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
    private resize() {
        this._width = this._element.clientWidth;
        this._height = this._element.clientHeight;
        if (this.mapIsReady) {
            this._map.boardWidth = this._width;
            this._map.boardHeight = this._height;
            this._map.resize();
        }
    };

    static createAndGet() {

        return new Board();

    }


    loadMap(conn:Conn, targetMapId:string='standard.html') {
        // lock the map from being used
        this._mapIsReady = false;

        // request map from server
        conn.emit('requestMap', {targetMapId});

        return new Promise<Map>((resolve, reject)=>{

            // when map data is received... 
            conn.on('sendMap', (data) => {
                // convert binary data into string
                const decoder = new TextDecoder('utf-8');
                const unit8Array = new Uint8Array(data.map as ArrayBuffer);
                const mapString = decoder.decode(unit8Array);
                
                // insert map string into the map container
                this._mapContainerElement.innerHTML = mapString;
                
                // create new map object
                this._map = new Map();
                
                // abort if map is invalid
                if (this._map.isInvalid) {reject()}
                    
                    // unlock map
                    this._mapIsReady = true
                    
                    // resize map (and board)
                    this.resize();
                    
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

    get mapIsReady() {return this._mapIsReady}

    constructor() {
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