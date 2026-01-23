import { Client } from ".";
import ChooseGameInstance from "./window/chooseGame";
import { LoadingInstance } from "./window/loading";
import { PlayingInstance } from "./window/playing";
import { PregameInstance } from "./window/pregame";

export type WindowName =
    'loading'|
    'choose-game'|
    'pregame'|
    'playing';

export interface Window {

    onSet(client:Client):void;
    onRemove(client:Client):void;

}

interface WindowConstructor {
    condition(client:Client):boolean;
    nameProp:WindowName;
}

export const createWindowType = <T extends WindowConstructor>(constructor:T)=>{return constructor}
export const LoadingWindow = createWindowType(LoadingInstance);
export const ChooseGameWindow = createWindowType(ChooseGameInstance);
export const PregameWindow = createWindowType(PregameInstance);
export const PlayingWindow = createWindowType(PlayingInstance);

export const WindowMap = {
    'loading':LoadingWindow,
    'choose-game':ChooseGameWindow,
    'pregame':PregameWindow,
    'playing':PlayingWindow}


