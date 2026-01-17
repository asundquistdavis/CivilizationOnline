import { Client } from ".";
import { LoadingInstance } from "./states/loading";
import { PlayingInstance } from "./states/playing";
import { PregameInstance } from "./states/pregame";

export type StateName =
    'loading'|
    'pregame'|
    'playing';

export interface State {

    onSet(client:Client):void;
    onRemove(client:Client):void;

}

interface StateConstructor {
    condition(client:Client):boolean;
    nameProp:StateName;
}

export const createStateType = <T extends StateConstructor>(constructor:T)=>{return constructor}
export const LoadingState = createStateType(LoadingInstance);
export const PregameState = createStateType(PregameInstance);
export const PlayingState = createStateType(PlayingInstance);

export const StateMap = {
    'loading':LoadingState,
    'pregame':PregameState,
    'playing':PlayingState}


