import Conn from "./conn";
import DB from "./db";

export type GameSettings = {

    mapName:string,
    numberOfUnits:number,
    numberOfShips:number,
    numberOfCities:number,
    tCardDeckName:string,
    aCardDeckName:string,

}

type LoadGameData = {

    aCards:string,
    tCards:string,
    civilizations:string,

}

const defaultGameSettings = {numberOfCities:9, numberOfUnits:55, numberOfShips:4, mapName:'standard.html', tCardDeckName:'standard.json', aCardDeckName:'standard.json'};

export default class Game {

    private _id:number;
    private _isHot:boolean;
    private _conn:Conn;
    private _db:DB;
    private _aCards:any[];
    private _tCards:any[];
    private _civilizations:any[];

    constructor(db:DB, conn:Conn, id:number) {
        this._conn = conn;
        this._db = db;
        this._id = id;
    }

    get id() {

        return this._id

    }

    static loadAndGet(db:DB, conn:Conn, id:number) {

        return new Promise<Game>(async (resolve, reject) => {

            const game = new Game(db, conn, id);

            const gamsAsDBSafe = await db.getEntityByKey('game', id);

            conn.emit('loadGame', {...gamsAsDBSafe});

            conn.on('loadGame', (data:LoadGameData) => {
                
                game._aCards = JSON.parse(data.aCards);

                game._tCards = JSON.parse(data.tCards);

                game._civilizations = JSON.parse(data.civilizations);

                resolve(game);

            });

        });

    }

    static createAndGet(db:DB, conn:Conn, hostUsername: string, usernames:string[], customGameSettings?:GameSettings) {

        const gameSettings = {...defaultGameSettings, ...customGameSettings};

        return new Promise<Game>(async (resolve, reject) => {

            const id = await db.addEntityAndGetKey('game', {hostUsername, ...gameSettings}) as number;

            const game = await Game.loadAndGet(db, conn, id).catch(reject);

            if (!game) {return}

            usernames.forEach(username=>game.addPlayerAndGetId(username, gameSettings));

            await game.addTCards(gameSettings);

            resolve(game)

        })

    }

    addTCards(gameSettings:GameSettings) {

        return new Promise(async (resolve, reject) => {
            
            const addCardsOfSameName = async (tCard:any) => {
                
                Promise.all(Array.from(Array(tCard.maxQuantity)).map(async _ => {
                    
                    await this._db.addEntityAndGetKey('tCard', {name:tCard.name, gameId: this._id})
                    
                }))
                
            }
            
            await Promise.all(this._tCards.map(async tCard => await addCardsOfSameName(tCard))).catch(reject);

            resolve(null)

        })

    }

    addPlayerAndGetId(username:string, gameSettings:GameSettings) {

        return new Promise(async (resolve, reject) => {

            const playerId = await this._db.addEntityAndGetKey('player', {username});

            await Promise.all(Array.from(Array(gameSettings.numberOfUnits)).map(async _ => this._db.addEntityAndGetKey('unit', {playerId}))).catch(reject);

            await Promise.all(Array.from(Array(gameSettings.numberOfShips)).map(async _ => this._db.addEntityAndGetKey('ship', {playerId}))).catch(reject);

            await Promise.all(Array.from(Array(gameSettings.numberOfCities)).map(async _ => this._db.addEntityAndGetKey('city', {playerId}))).catch(reject);

            resolve(playerId)
             
        })

    }

}


