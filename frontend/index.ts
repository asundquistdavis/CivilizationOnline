import Data from "./data";
import GUI from "./gui";
import './styles/root.css';
import { LoadingWindow, Window, WindowMap, WindowName } from "./window";

export class Client {

    gui:GUI;
    windowName:WindowName='loading';
    window:Window = new LoadingWindow();
    data:Data;

    static async start() {

        const client = new Client();
        client.data = await Data.startAndGet(client.resolveWindow.bind(client));
        client.gui = GUI.createAndGet();

        // put a placeholder map up;
        client.data.loadMap();

        client.resolveWindow();

    }

    get username() {

        return localStorage.getItem('username')

    }

    set username(value:string) {

        localStorage.setItem('username', value);

    }

    get gameId() {return false}

    resolveWindow() {

        const targetWindowName:WindowName = (Object.values(WindowMap).find((window)=>window.condition(this))?.nameProp||'loading');
        this.setWindow(targetWindowName);

    }

    setWindow(targetStateName:WindowName) {
    
        this.window.onRemove(this);
        this.windowName = targetStateName;
        this.window = new WindowMap[targetStateName];
        this.window.onSet(this);

    }

}
 


// async function start() {
//     }

//     Game.createAndGet(db, conn, 'andrew', ['andrew']);


// }

Client.start();
