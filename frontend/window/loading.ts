import { Client } from "..";
import LoadingComponent from "../Components/loading";
import { Window, WindowName } from "../window";

export class LoadingInstance implements Window {
    static nameProp:WindowName = 'loading';
    onSet(client: Client): void {
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

