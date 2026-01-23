import { Client } from "..";
import PregameComponent, { PregameComponentProps } from "../Components/pregame";
import '../styles/pregame.css';
import { Window, WindowName } from "../window";

export class PregameInstance implements Window {
    static nameProp:WindowName='pregame';
    async onSet(client: Client): Promise<void> {
        await client.data.requestAndSetData('civilizationsStatic');
        client.gui.registerComponent<PregameComponentProps, PregameComponent, typeof PregameComponent>(PregameComponent, {...new PregameComponentProps, parentId:'gui', data:client.data});
    }
    onRemove(client: Client): void {
        throw new Error("Method not implemented.");
    }
    static condition(client:Client): boolean {
        return !client.data.game.state.turnNumber
    }
}

