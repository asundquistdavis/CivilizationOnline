import { Client } from "..";
import ChooseGameComponent, { ChooseGameComponentProps } from "../Components/chooseGame";
import { ChooseGameWindow, Window, WindowName } from "../window";


export default class ChooseGameInstance implements Window {
    static nameProp:WindowName = 'choose-game';
    onSet(client: Client): void {
        client.gui.registerComponent<ChooseGameComponentProps, ChooseGameComponent, typeof ChooseGameComponent>(ChooseGameComponent, {...new ChooseGameComponentProps, data:client.data})
    }
    onRemove(client: Client): void {
        client.gui.unRegisterComponent('choose-game');
    }
    static condition(client:Client):boolean {
        return !client.data.hasGame
    }
}