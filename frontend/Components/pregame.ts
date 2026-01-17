import GUIComponentBase, { GUIComponentProps } from "../guiComponentLibrary/Base";


class PregameComponentProps implements GUIComponentProps {
    parentId: string;
}

export default class PregameComponent extends GUIComponentBase<PregameComponentProps> {
    protected _props: PregameComponentProps;
    protected _id: string;
    create(): void {
        throw new Error("Method not implemented.");
    }
    reset(): void {
        throw new Error("Method not implemented.");
    }
}