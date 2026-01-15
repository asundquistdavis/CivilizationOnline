import { Client } from "..";
import { createStateType, State, StateName } from "../state";

export class LoadingInstance implements State {
    static nameProp:StateName = 'loading';
    onSet(client: Client): void {
        
    }
    onRemove(client: Client): void {
        
    }
    static condition(client: Client): boolean {
        return false
    }
}

