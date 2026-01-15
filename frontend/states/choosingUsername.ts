import { Client } from "..";
import { ChoosingUsernameComponent } from "../gui";
import { createStateType, State, StateName } from "../state";

export class ChoosingUsernameInstance implements State {
    static nameProp:StateName = 'choosing-username';
    onSet(client: Client): void {
        const submitNewUsername = (username:string) => {
            localStorage.setItem('username', username);
            client.resolveState();
        }
        client.gui.registerComponent<typeof ChoosingUsernameComponent>(ChoosingUsernameComponent, {submitNewUsername})
    }
    onRemove(client: Client): void {
        // client.gui.unRegisterComponent()
    }
    static condition(client: Client): boolean {
        return (!client.username||client.username==='');
    }
}


