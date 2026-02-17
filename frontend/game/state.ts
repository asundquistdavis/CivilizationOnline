import Game, { GameDataListener } from "./game";

export interface PageStateData {}

export abstract class PageState {
    game:Game;
    constructor(game:Game) {
        this.game=game
    }
    protected abstract _stateData:any
    abstract getStateData(key:keyof any):any[typeof key];
    abstract setStateData(key:keyof any, value: any[typeof key]):void;
    protected abstract _stateDataListeners:Map<keyof any, GameDataListener>;
    abstract getStateDataListener(key:keyof any):GameDataListener;
    abstract name:string;
    abstract onSet():void;
    abstract onReset():void;
    abstract condition():boolean;

}

