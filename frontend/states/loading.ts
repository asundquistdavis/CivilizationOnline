import { Client } from "..";
import LoadingComponent from "../Components/loading";
import { createStateType, State, StateName } from "../state";

export class LoadingInstance implements State {
    static nameProp:StateName = 'loading';
    onSet(client: Client): void {
        console.log(client.gui);
        const loading = client.gui.registerComponent(LoadingComponent, {
            parentId: 'gui',
        })
        console.log(loading)
    }
    onRemove(client: Client): void {
        
    }
    static condition(client: Client): boolean {
        return false
    }
}

