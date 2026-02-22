import { GameState, GameSetting, Plural, Plurals, ActiveGame } from "./game";

export type DBEntityType = 'games'|'players'|'units'|'ships'|'cities'|'tCards'|'aCards';

export type UserAsDBSafe = {
    username:string,
}

export type GameAsDBSafe = {
    id:number,
    hostId:string,
}

export type UnitAsDBSafe = {
    id:number,
    playerId:number,
}

export type ShipAsDBSafe = {
    id:number,
    playerId:number,
}

export type cityAsDBSafe = {
    id:number,
    playerId:number,
}

export type tCardAsDBSafe = {
    id:number,
    playerId:number,
}

export type aCardAsDBSafe = {
    id:number,
    playerId:number,
}

export type DBEntityMap = {
    games: GameAsDBSafe,
    players: any,
    units: UnitAsDBSafe,
    ships: ShipAsDBSafe,
    cities: cityAsDBSafe,
    tCards: tCardAsDBSafe,
    aCards: aCardAsDBSafe
}

export type DBControl = {
    userId:string,
    gameId:string,
    hostId:string
}

export default class DB {

    private _db:IDBDatabase;

    hostNewGame() {

        return new Promise<string>((resolve, reject)=>{

            const transaction = this._db.transaction(['game', 'setting', 'state'],'readwrite');

            const request = transaction.objectStore('game').add({});

            request.onsuccess = event => {
                
                const gameId = (event.target as IDBRequest).result;

                transaction.objectStore('setting').add({gameId});

                transaction.objectStore('state').add({gameId});

                resolve(( event.target as IDBRequest).result)

            };

            request.onerror = event => reject((event.target as IDBRequest).error);

        });

    }

    getPluralsAll(dbEntityKey:keyof Plurals, gameId:string):Promise<Plurals[typeof dbEntityKey]> {

        return new Promise((resolve, reject)=>{

            const keyRange = IDBKeyRange.only(gameId);

            const request = this._db.transaction(dbEntityKey, 'readonly').objectStore(dbEntityKey).index('gameId').getAll(gameId);

            request.onsuccess = event => resolve((event.target as IDBRequest).result);

            request.onerror = event => reject((event.target as IDBRequest).error);

        })

    }

    getPluralInstance(dbEntity:keyof Plural, id:string):Promise<Plural[typeof dbEntity]> {

        return new Promise((resolve, reject)=>{

            const keyRange = IDBKeyRange.only(id);

            const transaction = this._db.transaction(dbEntity, 'readonly').objectStore(dbEntity).get(keyRange);

            transaction.onsuccess = event => resolve((event.target as IDBRequest).result);

            transaction.onerror = event => reject((event.target as IDBRequest).error);

        })

    }

    putPluralInstance(dbEntity:keyof Plurals, value:Partial<Plural[typeof dbEntity]>, gameId:string):Promise<string> {

        return new Promise((resolve, reject)=>{

            const request = this._db.transaction(dbEntity, 'readwrite').objectStore(dbEntity).put({...value, gameId});

            request.onsuccess = event => resolve((event.target as IDBRequest).result);

            request.onerror = event => reject((event.target as IDBRequest).error);

        });

    }

    putPluralsAll(dbEntity:keyof Plurals, values:Plurals[typeof dbEntity], gameId:string) {

        return new Promise((resolve, reject)=>{

            const objectStore = this._db.transaction(dbEntity, 'readwrite').objectStore(dbEntity);

            values.forEach(value=>{

                objectStore.put({...value, gameId});

            });

            objectStore.transaction.oncomplete = event => resolve((event.target as IDBRequest).result);

            objectStore.transaction.onerror = event => reject((event.target as IDBRequest).error);

        });

    }

    getSingle(key:'setting'|'state', gameId:string):Promise<GameSetting|GameState> {

        return new Promise((resolve, reject)=>{

            const request = this._db.transaction(key, 'readonly').objectStore(key).get(gameId);

            request.onsuccess = event => resolve((event.target as IDBRequest).result);

            request.onerror = event => reject((event.target as IDBRequest).error);

        })

    }

    putSingle(key:'setting'|'state', value:Partial<GameState>|Partial<GameSetting>, gameId:string) {

        return new Promise((resolve, reject)=>{

            const request = this._db.transaction(key, 'readwrite').objectStore(key).put({...value, gameId});

            request.onsuccess = event => resolve((event.target as IDBRequest).result);

            request.onerror = event => reject((event.target as IDBRequest).error);

        });

    }



    async getAllEntitiesWithOSIndexValue(os: DBEntityType, index:string, value: string|number):Promise<any[]> {

        return new Promise((resolve, reject) => {

            const transaction = this._db.transaction(os);
            const request = transaction.objectStore(os).index(index).getAll(IDBKeyRange.only(value));
            request.onsuccess = (event) => {
                const entities = (event.target as IDBRequest).result;
                resolve(entities)
            }
            request.onerror = (event) => {
                const error = (event.target as IDBRequest).error
                reject(error)
            }

        })


    }

    static startAndGet() {

        return new Promise<DB>((resolve, reject)=> {

            const db = new DB();
            
            const dbRequest = indexedDB.open('civilization')
            
            dbRequest.onerror = () => {
                
                reject();
                
            };
            
            dbRequest.onupgradeneeded = (event) => {

                const db = (event.target as IDBOpenDBRequest).result;

                // game = {id}
                const gameOS = db.createObjectStore('game', {keyPath: 'id', autoIncrement: true});

                // setting = {*gameId, }
                const settingOS = db.createObjectStore('setting', {keyPath:'gameId'});

                //state = {*gameId, }
                const stateOS = db.createObjectStore('state', {keyPath: 'gameId'});

                // player = {id, gameId, username, isActive}
                const playersOS = db.createObjectStore('players', {keyPath: 'id', autoIncrement: true});
 
                // unit = {id, playerId, areaName?, shipId?}
                const unitsOS = db.createObjectStore('units', {keyPath: 'id', autoIncrement: true});

                // ship = {id, playerId, areaName?, }
                const shipsOS = db.createObjectStore('ships', {keyPath: 'id', autoIncrement: true});

                // city = {id, playerId, areaName?, }
                const citiesOS = db.createObjectStore('cities', {keyPath: 'id', autoIncrement: true});

                // aCard = {id, playerId, name, }
                const aCardsOS = db.createObjectStore('aCards', {keyPath: 'id', autoIncrement: true});

                // tCard = {id, gameId, playerId?, name, }
                const tCardOS = db.createObjectStore('tCards', {keyPath: 'id', autoIncrement: true});

                playersOS.createIndex('gameIdAndUserId', ['gameId', 'userId'], {unique: true});
                playersOS.createIndex('gameId', 'gameId', {unique:false});
                unitsOS.createIndex('gameIdAndUserId', ['gameId', 'userId'], {unique: false});
                shipsOS.createIndex('gameIdAndUserId', ['gameId', 'userId'], {unique: false});
                citiesOS.createIndex('gameIdAndUserId', ['gameId', 'userId'], {unique: false});
                aCardsOS.createIndex('gameIdAndUserId', ['gameId', 'userId'], {unique: false});
                tCardOS.createIndex('gameIdAndUserId', ['gameId', 'userId'], {unique: false});
                
            };
            
            dbRequest.onsuccess = (event) => {
                
                db._db = (event.target as IDBOpenDBRequest).result;
            
                resolve(db);
                
            };
            
        })

    }

} 

