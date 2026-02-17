import Game from "./game/game";
import GUI from "./gui/gui";



export class Client {

    gui:GUI;
    game:Game;

    static async start() {

        const client = new Client();
        client.gui = GUI.createAndGet();
        client.game = await Game.startAndGet(client.gui);

    }

}
