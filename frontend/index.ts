import Board from "./board";
import Conn from "./conn";
import DB from "./db";
import Game from "./game";
import GUI from "./gui";
import { LoadingState, State, StateMap, StateName } from "./state";
import './styles/root.css';

export class Client {

    conn:Conn;
    db:DB;
    gui:GUI;
    stateName:StateName='loading';
    state:State = new LoadingState();

    static async start() {

        const client = new Client();

        const [conn, db] =await Promise.all([Conn.startAndGet(), DB.startAndGet()])

        client.conn = conn;
        client.db = db;
        client.gui = GUI.createAndGet();

        // put a placeholder map up;
        client.gui.board.loadMap(conn);

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

        const targetStateName:StateName = (Object.values(StateMap).find((State)=>State.condition(this))?.nameProp||'loading');
        this.setState(targetStateName);

    }

    setState(targetStateName:StateName) {
    
        this.state.onRemove(this);
        this.state = new StateMap[targetStateName];
        this.state.onSet(this);

    }

}



// async function start() {
//     }

//     Game.createAndGet(db, conn, 'andrew', ['andrew']);


// }

Client.start();
