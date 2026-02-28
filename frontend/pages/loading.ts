import Game, { GameDataListener } from "../game/game";
import { PageState } from "../game/state";

export class LoadingState extends PageState {
    protected _stateData: any;
    getStateData(key: keyof any) {
        throw new Error("Method not implemented.");
    }
    setStateData(key: keyof any, value: any[typeof key]): void {
        throw new Error("Method not implemented.");
    }
    protected _stateDataListeners: Map<string | number | symbol, GameDataListener>;
    getStateDataListener(key: keyof any): GameDataListener {
        throw new Error("Method not implemented.");
    }
    onSet(): void {
    }
    onReset(): void {

    }
    condition():boolean {

        return true

    }
    name='loading';
}