import { Client } from ".";
import { ChoosingGameInstance } from "./states/choosingGame";
import { ChoosingUsernameInstance } from "./states/choosingUsername";
import { LoadingInstance } from "./states/loading";
import { PlayingInstance } from "./states/playing";

export type StateName =
    'loading'|
    'choosing-username'|
    'choosing-game'|
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
export const PlayingState = createStateType(PlayingInstance);
export const ChoosingGameState = createStateType(ChoosingGameInstance);
export const ChoosingUsernameState = createStateType(ChoosingUsernameInstance);

export const StateMap = {
    'loading':LoadingState,
    'choosing-username':ChoosingUsernameState,
    'choosing-game':ChoosingGameState,
    'playing':PlayingState}
