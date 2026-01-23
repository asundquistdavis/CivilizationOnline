import Board from "./board";
import GUIComponentBase, { GUIComponentProps } from "./guiComponentLibrary/base";
import Conn from "./conn";
import DB, { DBEntityMap, DBEntityType } from "./db";

export interface AnyData extends Partial<DataTypes> {};

export class DataListener<K extends keyof AnyData> {
    private _name:K;
    private _components:GUIComponentBase<GUIComponentProps>[] = [];
    get name() {return this._name}
    static createAndGet<K extends keyof AnyData>(name:K):DataListener<K> {
        const dataListener = new DataListener<K>();
        dataListener._name = name;
        return dataListener
    }
    fire(data:any) {
        this._components.forEach((component)=>{
            component.remove();
            component.create();
        })
    }
    addComponent(component:GUIComponentBase<GUIComponentProps>):void {
        this._components.push(component);
    }
    removeComponent(component:GUIComponentBase<GUIComponentProps>):void {
        this._components = this._components.filter(loopComponent=>loopComponent.id===component.id);
    }
}

export class ArrayDataTypes {
    players:Player[] = [];
    units:Unit[] = [];
    ships:Ship[] = [];
    cities:City[] = [];
    tCards:TCard[] = [];
    aCards:ACard[] = [];
    civilizationsStatic:CivilizationStatic[] = [];
    tCardsStatic:TCardStatic[] = [];
    aCardsStatic:ACardStatic[] = [];
    availableGameIds:string[];
}

export class DataTypes extends ArrayDataTypes {
    game:Game= new Game;
    userId:string = null;
}


export class Game {
    id:string;
    hostId:string;
    playerId:string
    name: string;
    settings:GameSettings=new GameSettings;
    state:GameState = new GameState;
    players:Player[];
}
export class GameSettings {

    maxNumberOfPlayers:number=18;
    name?:string;
    mapName?:string;
    numberOfUnits?:number;
    numberOfShips?:number;
    numberOfCities?:number;
    tCardDeckName?:string;
    aCardDeckName?:string;

}
export class GameState {

    turnNumber:number = 0;
}

export class Player {
    id:string
    userId:string
    name?:string
    civilizationName?:string
}
export class Unit {}
export class Ship {}
export class City {}
export class TCard {}
export class ACard {}



export class CivilizationStatic {
    name:string;
    color:string;
    ast:number;
    ages:number[]
}
export class TCardStatic  {
    name:string;
    level:number;
    maxQuantity:number;
    type:'commodity'|'major-calamity'|'minor-calamity';
}
export class ACardStatic {
    name:string;
    price:number;
    pgroup:string;
    sgroup?:string;
    creditTo?:{name:string, amount:number};
    credits:{red?:number, blue?:number, green?:number, yellow?:number, orange?:number};
    texts:string;
}

const DataKeys = Object.keys(new DataTypes);

export default class Data extends DataTypes {
    conn:Conn;
    db:DB;
    resolveWindow:()=>void;
    readonly board:Board = Board.createAndGet();
    private _listeners:DataListener<keyof ArrayDataTypes>[] = [];
    private _createAllListeners() {
        for (const name of Object.keys(new ArrayDataTypes))  {
            const nameReTyped = name as keyof ArrayDataTypes;
            const listener = DataListener.createAndGet(nameReTyped);
            this.conn.on('setData-'+name, (data)=>{
                const value = JSON.parse(data as string) as any
                console.log(listener, value)
                this[nameReTyped] = [...this[nameReTyped], ...value] as any;
                listener.fire(value);
            });
            this._listeners.push(listener)
        }
        
    }
    static async startAndGet(resolveWindow:()=>void) {
        const data = new Data;
        data.resolveWindow = resolveWindow;
        data.conn = await Conn.startAndGet(data);
        data.db = await DB.startAndGet();
        data._createAllListeners();
        data.conn.on('availableGame', (data:Game)=>{
            console.log(data);
        })
        data.conn.on('setData', <K extends keyof DBEntityMap>(payload:{dataKey:K, instance:Partial<ArrayDataTypes[K]>, control:{userId:string, gameId:string, hostId:string}}) => {
            const {dataKey, instance} = payload;
            data.db.putEntity(dataKey, instance)
        })
        data.userId = localStorage.getItem('userId');
        return data
    }

    get hasGame():boolean {if (this.game.id) {return true} else {return false}}
    get isHost():boolean {return this.userId===this.game.hostId}
    update<T, K extends keyof T>(instance:Partial<T[K]>)
    loadMap(targetMapId?:string):void {this.board.loadMap(this.conn, targetMapId)}
    requestAndSetData(dataKey:keyof DataTypes, options?:{deck?:string, type?:'static'|'dynamic'}):Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            if (dataKey in this) {
                this.conn.on('setData-'+dataKey, (data)=>{
                    resolve();
                }, true)
                this.conn.emit('requestData', {dataKey, options});
            }
        })
    }
    getDataWith<K extends keyof DataTypes>(name:K):DataTypes[K] {return this[name]}
    getDataListenerWith(name:keyof AnyData):DataListener<typeof name> {
        return this._listeners.find(listener=>listener.name===name)
    }
    getDataOfWith<K extends keyof ArrayDataTypes, T = ArrayDataTypes[K][number]>(keyName: K, identifier:string):T {
        return this[keyName].find(instance=>{
            return ('id' in instance)? (instance.id===identifier): (('name' in instance)? (instance.name===identifier): false) 
        }) as T
    }

    // gebroken
    async hostNewGame(name:string) {
        const control = {
            userId:this.userId,
            gameId:'',
            hostId:this.userId,
        }
        control.gameId = await this.db.addGameAndGetId(control, name);
        const playerId = await this.db.addEntityAndGetId('players', {userId:control.userId, gameId:control.gameId})
        const player = await this.db.getEntityByKey('players', playerId);
        this.conn.emit('hostGame', {hostId:control.hostId, name, gameId: control.gameId, players:[player]});
        this.game = {...this.game, hostId:control.hostId, name, id:control.gameId}
        this.resolveWindow();
    }
    sendDataWith<K extends keyof ArrayDataTypes>(dataKey:K, instance:Partial<ArrayDataTypes[K][number]>):void {
        const control = {userId: this.userId, gameId:this.game.id, hostId:this.game.hostId}
        this.conn.emit('sendData', {instance, control, dataKey})
    }
}    

