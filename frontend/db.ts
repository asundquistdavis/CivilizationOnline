import { GameSettings } from "./game";

export type DBEntityType = 'user'|'game'|'player'|'unit'|'ship'|'city'|'tCard'|'aCard';

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
    user: UserAsDBSafe,
    game: GameAsDBSafe,
    player: any,
    unit: UnitAsDBSafe,
    ship: ShipAsDBSafe,
    city: cityAsDBSafe,
    tCard: tCardAsDBSafe,
    aCard: aCardAsDBSafe
}

export default class DB {

    private _db:IDBDatabase;

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

    addEntityAndGetKey(dbEntity:DBEntityType, value:DBEntityMap[DBEntityType]) {

        return new Promise<number|string>((resolve, reject)=>{

            const transaction = this._db.transaction(dbEntity, 'readwrite').objectStore(dbEntity).add(value);
        
            transaction.onsuccess = (event) => {

                const result = (event.target as IDBRequest).result as number|string;

                resolve(result);

            }

            transaction.onerror = (event) => {

                const error = (event.target as IDBRequest).error;

                reject(error);

            }
        
        });

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

                // 
                const usersOS = db.createObjectStore('user', {keyPath: 'username'});

                // game = {id, hostUserName, isActive}
                const gamesOS = db.createObjectStore('game', {keyPath: 'id', autoIncrement: true});

                // player = {id, gameId, username, isActive}
                const playersOS = db.createObjectStore('player', {keyPath: 'id', autoIncrement: true});
 
                // unit = {id, playerId, areaName?, shipId?}
                const unitsOS = db.createObjectStore('unit', {keyPath: 'id', autoIncrement: true});

                // ship = {id, playerId, areaName?, }
                const shipsOS = db.createObjectStore('ship', {keyPath: 'id', autoIncrement: true});

                // city = {id, playerId, areaName?, }
                const citiesOS = db.createObjectStore('city', {keyPath: 'id', autoIncrement: true});

                // aCard = {id, playerId, name, }
                const aCardsOS = db.createObjectStore('aCard', {keyPath: 'id', autoIncrement: true});

                // tCard = {id, gameId, playerId?, name, }
                const tCardOS = db.createObjectStore('tCard', {keyPath: 'id', autoIncrement: true});

                gamesOS.createIndex('hostUsername', 'hostUsername', {unique: false});
                playersOS.createIndex('gameId', 'gameId', {unique: false});
                playersOS.createIndex('username', 'username', {unique: false});
                unitsOS.createIndex('playerId', 'playerId', {unique: false});
                shipsOS.createIndex('playerId', 'playerId', {unique: false});
                citiesOS.createIndex('playerId', 'playerId', {unique: false});
                aCardsOS.createIndex('playerId', 'playerId', {unique: false});
                tCardOS.createIndex('gameId', 'gameId', {unique: false});
                tCardOS.createIndex('playerId', 'playerId', {unique: false});
                
            };
            
            dbRequest.onsuccess = (event) => {
                
                db._db = (event.target as IDBOpenDBRequest).result;
                
                resolve(db);
                
            };
            
        })

    }

} 

