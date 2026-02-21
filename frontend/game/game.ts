import GUI, { HoveredFeatureWindow } from "../gui/gui";
import Conn from "./conn"
import DB from "./db"
import { ChoosingState } from "../pages/choosing";
import { PageState } from "./state";
import Board from "./board";
import { MapArea, MapFeature, MapFeatureMapping, MapOpenSea } from "./mapFeatures";
import { PlayingState } from "../pages/playing";

export class Plurals {

    players:Player[]=[];
    activeGames:ActiveGame[]=[];
}

export class Plural {
    players:Player;
    activeGames:ActiveGame;
}

export type Player = {
    isActive:boolean,
    userId:string,
    id:string;
    name:string;
};

type Civilization = {
    id:string
};

export type ActiveGame = {
    id:string
    hostId:string,
    setting:GameSetting,
    state:GameState
    players:Player[],
}
type Single = {
    setting:GameSetting;
    state:GameState;
}

export type PhaseName = 'pregame'|'census';

export type PregameSubPhaseName = '';

export type CensusSubPhaseName = 'revolting';

export class SubPhaseMapping {
    pregame: PregameSubPhaseName;
    census: CensusSubPhaseName;
}

export class GameState {
    gameId:string='';
    phaseName:PhaseName='pregame';
    subPhaseName: SubPhaseMapping[typeof this.phaseName]='';
    turnNumber:number = 0;
}
export class GameSetting {
    gameId:string;
    id:string
    numberOfPlayers:number
}

type LocationToDataMap = {
    setting:GameSetting;
    state:GameState;
    pluralPutInstance:Partial<Plural>
    pluralPutAll:Partial<Plurals>
}

type ToPartial<T> = {[P in keyof T]: Partial<T[P]>}

type RequestGameDataPayload<L extends keyof LocationToDataMap> = {
    hostId?:string,
    userId?:string,
    auth:string,
    type:L,
    data:Partial<ToPartial<LocationToDataMap[L]>>,

}

type ConfirmGameDataPayload<L extends keyof LocationToDataMap> = {
    hostId?:string,
    userId?:string,
    auth?:string,
    type:L,
    data:Partial<ToPartial<LocationToDataMap[L]>>,
    gameLess?:boolean

}

export type StaticArea = {
    name:string;
    landAdjacent:string[];
    waterAdjacent:string[];
    startingCivilization:string;
    isStartingArea:boolean;

}

export type StaticCivilization = {
    name:string,
    color:string,
    ast:number;
    ages:number[];
}

export type StaticACard = {
    name:string;
    price:number;
    pgroup:string;
    sgroup:string;
    credits:Partial<{red:number, yellow:number, green:number, blue:number, orange:number}>;
    creditTo:{name:string, amount:number};
    text:string;
}

export type StaticTCard = {}

class StaticAssets {

    areas: StaticArea[]=[];
    civilizations:StaticCivilization[]=[];
    tCards:StaticTCard[]=[];
    aCards:StaticACard[]=[];

}

export default class Game {

    private _conn:Conn;
    private _db:DB;
    private _board:Board;
    get board():Board {return this._board};
    gui:GUI;
    private _hostId:string;
    get hostId():string {return this._hostId}
    set hostId(value:string) {this._hostId = value; this.getListener('hostId').fire()}
    get isHost():boolean {return this._hostId===this.userId};
    private _id:string;
    get userId():string {return localStorage.getItem('userId')};
    set userId(value:string) {localStorage.setItem('userId', value)};
    private _gameState: GameState = new GameState;
    get gameState():GameState {return this._gameState};
    private _gameSetting:GameSetting = new GameSetting;
    get gameSetting():GameSetting {return this._gameSetting}; 
    private _state:PageState= new LoadingState(this);
    private _plurals:Plurals = new Plurals;
    private _staticAssets = new StaticAssets;
    set seesActiveGames(value:boolean) {
        if (value) {
            this._conn.emit('activeGamesOn', {});
        } else {
            this._conn.emit('activeGamesOff', {});
        }
    }
    getPluralsAll<K extends keyof Plurals>(key:K):Plurals[K]{

        return this._plurals[key];

    }
    getPluralInstance<K extends keyof Plurals>(key:K, id:string):Plurals[K][number] {

        return this.getPluralsAll(key).find(instance=>instance.id===id);

    }
    getSingle<K extends keyof Single>(key:K):Single[K] {

        if (key === 'setting') {return this._gameSetting as Single[K]}
        
        if (key === 'state') {return this._gameState as Single[K]}

    }


    private _gameDataListeners:GameDataListener[]=[];

    static startAndGet(gui:GUI):Promise<Game> {

        return new Promise<Game>(async (resolve, reject)=>{

            const game = new Game;

            game.gui = gui;

            game.gui.game = game;

            const [db, conn] = await Promise.all([DB.startAndGet(), Conn.startAndGet()]);

            game._db = db;
            
            game._conn = conn;
            
            game.createAllListeners();

            game._board = Board.createAndGet({select:game.getListener('select'), click:game.getListener('click'), hover:game.getListener('hover'), unHover:game.getListener('unHover')});

            game.loadMap();
            
            game.checkState();
            
            resolve(game);

        });

    }

    checkState():void {

        for (const state of this._states) {
                        
            if (state.condition.bind(this)()) {this.state = state; return}

        }

    }

    registerGameDataListener = (key:string) => {

        const gameDataListener = new GameDataListener(key)
        this._gameDataListeners.push(gameDataListener);
        return gameDataListener

    }

    createAllListeners():void {

        Object.keys(this._plurals).forEach(key=>{
            
            const gdl = new GameDataListener(key);
            this._gameDataListeners.push(gdl);

        });

        const hostIdListener = new GameDataListener('hostId');


        this._gameDataListeners.push(hostIdListener);


        for (const key in this._gameState) {

            this._gameDataListeners.push(new GameDataListener(key));

        }

        for (const key in this._gameSetting) {

            this._gameDataListeners.push(new GameDataListener(key));

        }

        for (const type in this._staticAssets) {

            this._gameDataListeners.push(new GameDataListener('static-'+type));

        }

        this._gameDataListeners.push(new GameDataListener('select'));

        this._gameDataListeners.push(new GameDataListener('click'));

        this._gameDataListeners.push(new GameDataListener('unHover'));

        this._gameDataListeners.push(new GameDataListener('hover'));

        hostIdListener.addStateAction('initial', () => {this.checkState.bind(this)(); return true});

        this.getListener('turnNumber').addStateAction('initial', () => {this.checkState.bind(this)(); console.log(this._gameState.turnNumber); return true});

        this._conn.on('requestGameData', async <L extends keyof LocationToDataMap >(payload:RequestGameDataPayload<L>)=>{
            console.log(payload);
            const userId = payload.userId
            const auth = payload.auth
            if (!this.validate(userId, auth)) {return}
            const type = payload.type;
            switch (type) {
                case 'pluralPutInstance': {
                    const data = payload.data as Partial<Plural>;
                    for (const key in data) {
                        const keyTyped = key as keyof Plural;
                        console.log(this._id);
                        const id = await this._db.putPluralInstance(keyTyped, data[keyTyped], this._id);
                        // (payload.data as Plural)[keyTyped] = await this._db.getPluralInstance(keyTyped, id) as any;
                    }
                    break;
                }
                case 'pluralPutAll': {
                    const data = payload.data as Partial<Plurals>
                    for (const key in data) {
                        const keyTyped = key as keyof Plurals;
                        this._db.putPluralsAll(keyTyped, data[keyTyped], this._id);
                        // (payload.data as Plurals)[keyTyped] = await this._db.getPluralsAll(keyTyped, this._id) as any;
                    }
                    break;
                }
                case 'setting': 
                case 'state': {
                    const data = payload.data as Partial<GameState|GameSetting>;
                    this._db.putSingle(type, data, this._id);
                    // payload.data = await this._db.getSingle(type, this._id) as any;
                }
                break;
            }
            this._conn.emit('confirmGameData', payload);
        });
        
        this._conn.on('confirmGameData', <L extends keyof LocationToDataMap >(payload:ConfirmGameDataPayload<L>)=>{
            switch (payload.type) {
                case 'pluralPutInstance': {
                    const data = payload.data as Partial<Plural>
                    for (const key in data) {
                        const keyTyped = key as keyof Plural;
                        type T = typeof this._plurals[typeof keyTyped][number];
                        const value = data[keyTyped] as T;
                        if (this.getPluralInstance(keyTyped, value.id)) {
                            this._plurals[keyTyped].map(loopValue=>{
                                return loopValue.id===value.id? value: loopValue
                            })
                        } else {
                            this._plurals[keyTyped].push(value as any);
                        }
                        this.getListener(keyTyped).fire(value.id);
                    }
                    break;
                }
                case 'pluralPutAll': {
                    const data = payload.data as Partial<Plurals>;
                    for (const key in data) {
                        const keyTyped = key as keyof Plurals;
                        type T =typeof this._plurals[typeof keyTyped];
                        const seen = new Set();
                        this._plurals[keyTyped] = (data[keyTyped].concat(this._plurals[keyTyped]) as T).filter(value=>{
                            const isDuplicate = seen.has(value.id); 
                            seen.add(value.id)
                            return !isDuplicate
                        }) as any;
                        this.getListener(key).fire();
                    }
                    break;
                }
                case 'setting': {
                    const data = payload.data as Partial<GameSetting> 
                    for (const key in data) {
                        const keyTyped = key as keyof GameSetting;
                        this._gameSetting[keyTyped] = data[keyTyped] as never;
                        this.getListener(key).fire();
                    }
                    break;
                }
                case 'state': {
                    const data = payload.data as Partial<GameState>
                    for (const key in data) {
                        console.log(key); 
                        const keyTyped = key as keyof Partial<GameState>;
                        this._gameState[keyTyped] = data[keyTyped] as never;
                        this.getListener(key).fire();
                    }
                    break;
                }
            }

        });

        this._conn.on('joinGame', ({userId})=>{
            console.log(userId);
            let player = this._plurals.players.find(player=>player.userId===userId);
            if (player) {this._db.putPluralInstance('players', {isActive:true, id: player.id}, this._id)};
        });

        this._conn.on('activeGames', ()=>this.sendActiveGame(true));

        this._conn.on('requestStaticAsset', (payload:{type:keyof StaticAssets, data:string})=>{

            const value = JSON.parse(payload.data)
            this._staticAssets[payload.type] = value;
            this.getListener(`static-${payload.type}`).fire();

        })

    }

    requestGameData<L extends keyof LocationToDataMap>(payload:RequestGameDataPayload<L>):void {
        this._conn.emit('requestGameData', {...payload, hostId:this._hostId, userId:this.userId});
    }

    validate(userId:string, auth:string) {

        if (auth==='wild') {return true}
 
    }

    getListener(listenerId:string):GameDataListener {

        return this._gameDataListeners.find(listener => listener.id === listenerId);

    }

    set state(value:PageState) {

        this._state?.onReset();
        this._state = value;
        this._state.onSet();

    }

    get state():PageState {

        return this._state

    }

    getStaticAsset<T extends keyof StaticAssets>(type:T):StaticAssets[T] {

        return this._staticAssets[type];

    }

    listenerFor(listenerId:string):GameDataListener {

        return this._gameDataListeners.find(listener=>listener.id === listenerId)

    }

    loadMap(mapId?:string):void {

        this._board.loadMap(this._conn, mapId);

    }

    async openActiveGame(hostId:string, name?:string, id?:string):Promise<void> {

        let gameId
        if ((hostId === this.userId)&&(!id)) {
            this._hostId = hostId;
            // host new game
            // create game instance in db with hostId and new gameId
            gameId = await this._db.hostNewGame();
            // create player instance (for the host) in db
            const userId = this.userId;
            console.log(gameId);
            await this._db.putPluralInstance('players', {name, userId}, gameId);
            const players = await this._db.getAllEntitiesWithOSIndexValue('players', 'gameId', gameId) as Player[];
            // set the local id to gameId
            this._id = gameId;
            this._plurals['players']=players;
            this.getListener('players').fire();
            
        } else {
            // join and/or open existing game

        } 
        // send active game to server
        this._conn.emit('joinGame', {hostId, userId:this.userId});
        this.sendActiveGame();
        return
        
    }

    requestStaticAsset(type:keyof StaticAssets, name='standard.json') {

        this._conn.emit('requestStaticAsset', {type, name});

    }
    
    async sendActiveGame(test?:boolean):Promise<void> {

        if (test) {
            const players:Player[] = [{
                userId:this.userId,
                id: '1',
                name: 'andrew',
                isActive: true,
            }];
            const setting = new GameSetting;
            const state = new GameState;
            const activeGames = {hostId:this.userId, players, setting, state, id:''};
            const payload:ConfirmGameDataPayload<'pluralPutInstance'> = {
                hostId: this.userId,
                type: 'pluralPutInstance',
                data: {activeGames},
                gameLess:true
            }
            return this._conn.emit('confirmGameData', payload);
        }

        if (!this._id) {return}
        const players = await this._db.getPluralsAll('players', this._id) as Player[];
        const setting = await this._db.getSingle('setting', this._id) as GameSetting;
        const state = await this._db.getSingle('state', this._id) as GameState;
        const activeGames = {hostId:this._hostId, players, setting, state, id:''};
        const payload:ConfirmGameDataPayload<'pluralPutInstance'> = {
            hostId: this._hostId,
            data: { activeGames },
            gameLess: true,
            type: 'pluralPutInstance',
        }
        this._conn.emit('confirmGameData', payload);

    }

    investigateAreas(type:keyof MapFeatureMapping, value:'on'|'off') {
        if (value==='on') {return this.board.map.getMapFeaturesOfType(type).activate()}
        this.board.map.getMapFeaturesOfType(type).deactivate();
    }

    setHighlightByStartingCivilization(value:'on'|'off') {
        const apply = () => {
            this.board.mapWhenReady(map=>{
                const civilizationColorFrom = (feature:MapArea) => {
                    return this.getStaticAsset('civilizations').find(civilization=>feature.startingCivilization===civilization.name)?.color||'white'
                };
                map.addLayer(map.getMapFeaturesOfType('area').features, 'highlightByCivilization', true, {'--land': (feature:MapArea)=>civilizationColorFrom(feature)});  
            });  
        }
        if (value==='off') {
            return this.board.map.clearLayer('highlightByCivilization');
        }
        if (!this.getStaticAsset('civilizations').length) {return} else {apply()}
    }

    selectAndHighlightAdjacent() {
        this.board.map.getMapFeaturesOfType('area').activate();
        this.board.map.getMapFeaturesOfType('openSea').activate();
        this.getListener('select').addStateAction('playing', ()=>{
            this.board.map.clearLayer('highlightAdjacent');
            if (!this.board.map.selectedFeature) {
                this.board.map.hoverable = this.board.map.selectable = () => true;
            } else {
                const selectedFeature = this.board.map.selectedFeature as MapOpenSea;
                const adjacentAreas:(MapArea|MapOpenSea)[] =  ('adjacentLandAreas' in selectedFeature)? 
                    [].concat(selectedFeature.adjacentLandAreas).concat(selectedFeature.adjacentCoastalAreas).concat(selectedFeature.adjacentOpenSeas):
                    [].concat(selectedFeature.adjacentCoastalAreas).concat(selectedFeature.adjacentOpenSeas);
                this.board.map.hoverable = this.board.map.selectable = (feature) => adjacentAreas.map(area=>area.name).includes(feature.name);
                this.board.map.addLayer(adjacentAreas, 'highlightAdjacent', true);
            }
        });
    }

    private _states:PageState[] = [new ChoosingState(this), new PregameState(this), new PlayingState(this), new LoadingState(this)];

}

type ComponentAction = {componentId:string, action:()=>void, id?:string};

type StateAction = {stateName:string, action:()=>void|boolean, id?:string}

export class GameDataListener {

    private _id: string;

    private _componentActionsList:ComponentAction[] = [];

    private _stateActionsList:StateAction[] = [];

    constructor(id:string) {

        this._id = id;

    }

    fire(targetId?:string):void {

        for (const {id, action} of this._stateActionsList) {

            if ((!targetId) || (!id) || (targetId === id)) {if (action()) {return}}

        }

        this._componentActionsList.forEach(({action, id})=>{
            
            if ((!targetId) || (!id) || (targetId === id)) {action()}
            
        })
    
    }

    getStateAction(targetStateName:string):StateAction {

        return this._stateActionsList.find(({stateName})=>stateName===targetStateName);

    }

    addStateAction(stateName:string, action:()=>void, id?:string):void {

        this._stateActionsList.push({stateName, action, id});

    }

    removeStateAction(targetStateName:string):void {

        this._stateActionsList = this._stateActionsList.filter(({stateName})=>stateName===targetStateName);

    }

    getComponentAction(targetComponentId:string):ComponentAction {

        return this._componentActionsList.find(({componentId})=>componentId===targetComponentId);

    }

    addComponentAction(componentId:string, action:()=>void, id?:string):void {

        this._componentActionsList.push({componentId, action, id});

    }

    removeComponentAction(targetComponentId:string):void {

        this._componentActionsList = this._componentActionsList.filter(({componentId})=>componentId===targetComponentId);

    }

    get id():string {return this._id};

}

class LoadingState extends PageState {
    protected _stateData: any;
    getStateData(key: keyof any) {
        throw new Error("Method not implemented.");
    }
    setStateData(key: keyof any, value: any[typeof key]): void {
        throw new Error("Method not implemented.");
    }
    protected _stateDataListeners: Map<string | number | symbol, GameDataListener>;
    getStateDataListener(key: keyof any): GameDataListener {
        throw new Error("Method not implemented.");
    }
    onSet(): void {
    }
    onReset(): void {

    }
    condition(this:Game) {return true}
    name='loading';
}

class PregameState extends PageState {
    protected _stateData: any;
    getStateData(key: keyof any) {
        throw new Error("Method not implemented.");
    }
    setStateData(key: keyof any, value: any[typeof key]): void {
        throw new Error("Method not implemented.");
    }
    protected _stateDataListeners: Map<string | number | symbol, GameDataListener>;
    getStateDataListener(key: keyof any): GameDataListener {
        throw new Error("Method not implemented.");
    }
    onSet(): void {
    }
    onReset(): void {
        console.log('resetting pregame');
    }
    condition(this:Game) {return false}
    name='pregame';
}
