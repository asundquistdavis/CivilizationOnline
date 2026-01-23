import { GameSettings } from "./data";

export type DBEntityType = 'players'|'units'|'ships'|'cities'|'tCards'|'aCards';

export type UserAsDBSafe = {
    username:string,
}

export type GameAsDBSafe = {
    id:number,
    hostUsername:string,
} & GameSettings

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

    addEntityAndGetId(dbEntity:DBEntityType, value:Partial<DBEntityMap[typeof dbEntity]>):Promise<string> {

        return new Promise<DBEntityMap[typeof dbEntity]>((resolve, reject)=>{

            const request = this._db.transaction(dbEntity, 'readwrite').objectStore(dbEntity).add(value);

            request.onsuccess = (event) => {

                const instanceId = (event.target as IDBRequest).result;

                resolve(instanceId);

            }

            request.onerror = (event) => {

                const error = (event.target as IDBRequest).error;

                reject(error);

            }
        
        })

    }

    addGameAndGetId(control:DBControl, name:string):Promise<string> {

        return new Promise<string>((resolve, reject)=>{

            const request = this._db.transaction('games', 'readwrite').objectStore('games').add({hostId:control.hostId, name: name});
    
            request.onsuccess = (event) => {
    
                const result = (event.target as IDBRequest).result;
    
                resolve(result);
    
            }

            request.onerror = (event) => {

                const error = (event.target as IDBRequest).error;

                reject(error);

            }

        })

    }

    putEntity<K extends keyof DBEntityMap>(dbEntity:K, instance:Partial<DBEntityMap[K][number]>) {

        const request = this._db.transaction(dbEntity, 'readwrite').objectStore(dbEntity).put(instance)

        request.onsuccess = (event) => {

            const result = (event.target as IDBRequest).result

            console.log(result);
        
        };

    }

    getEntityByKey(dbEntity:DBEntityType, key:number|string):Promise<DBEntityMap[DBEntityType]> {

        return new Promise<DBEntityMap[DBEntityType]>((resolve, reject) => {

            const transaction = this._db.transaction(dbEntity, 'readonly').objectStore(dbEntity).get(key)
        
            transaction.onsuccess = (event) => {
                
                const result = (event.target as IDBRequest).result as DBEntityMap[DBEntityType]; 

                resolve(result);
            
            }

            transaction.onerror = (event) => {

                const error = (event.target as IDBRequest).error;

                reject(error)

            }

        }) 
    
    }

    async getAllEntitiesWithOSIndexValue(os: DBEntityType, index:string, value: string|number) {

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

                // game = {id, hostUserName, isActive}
                const gamesOS = db.createObjectStore('games', {keyPath: 'id', autoIncrement: true});

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

