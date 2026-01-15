import { Client } from "..";
import { createStateType, State, StateName } from "../state";

export class ChoosingGameInstance implements State {
    static nameProp:StateName = 'choosing-game';
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

