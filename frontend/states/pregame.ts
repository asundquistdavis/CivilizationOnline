import { Client } from "..";
import PregameComponent from "../Components/pregame";
import { State, StateName } from "../state";
import '../styles/pregame.css';

export class PregameInstance implements State {
    static nameProp:StateName='pregame';
    onSet(client: Client): void {
        client.gui.registerComponent(PregameComponent, {parentId:'gui'})
    }
    onRemove(client: Client): void {
        throw new Error("Method not implemented.");
    }
    static condition(client:Client): boolean {
        return false
    }
}

