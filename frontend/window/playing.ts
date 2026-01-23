import { Client } from "..";
import { Window, WindowName } from "../window";

export class PlayingInstance implements Window {
    static nameProp:WindowName = 'playing';
    onSet(client: Client): void {
        throw new Error("Method not implemented.");
    }
    onRemove(client: Client): void {
        throw new Error("Method not implemented.");
    }
    static condition(client: Client): boolean {
        return false
    }
}

