import Board from "./board";
import Conn from "./conn";
import DB from "./db";
import Game from "./game";
import GUI from "./gui";
import './styles/root.css';

class Client {

    private _conn:Conn;
    private _db:DB;
    private _gui:GUI;
    private _state: StateType='loading';

    static async start() {

        const client = new Client();

        const [conn, db] =await Promise.all([Conn.startAndGet(), DB.startAndGet()])

        client._conn = conn;
        client._db = db;
        client._gui = GUI.createAndGet();

        // put a placeholder map up;
        client._gui.board.loadMap(conn);

        client.resolveState();

    }

    get username() {

        return localStorage.getItem('username')

    }

    set username(value:string) {

        localStorage.setItem('username', value);

    }

    get gameId() {return false}

    resolveState() {

        if (!this.username) {

            return this.setState('choosing-username');

        }

        if (!this.gameId) {

            return this.setState('choosing-game');

        }

    }

    setState(targetState:StateType) {

        return new Promise(async (resolve, reject)=>{

            this._gui.reset();
            
            switch (targetState) {

                case 'choosing-username':
                                    
                    const submitNewUsername = (username:string) => {
                    
                        this.username = username
                        
                        this.resolveState();
                        
                    }
                
                    this._gui.createUsernameWindow(submitNewUsername);

                    
                    break;

                case 'choosing-game':

                    const game = await Game.createAndGet(this._db, this._conn, this.username, [this.username]);

                    const allTCards = await this._db.getAllEntitiesWithOSIndexValue('tCard', 'gameId', game.id);
                    
                    console.log(allTCards);

                default:
                        
                    break;
                        
            }
                    
            resolve(targetState);

        })
    
    }

}

type StateType = 
    'loading'|
    'choosing-username'|
    'choosing-game'|
    'playing'

// async function start() {
//     }

//     Game.createAndGet(db, conn, 'andrew', ['andrew']);


// }

Client.start();
