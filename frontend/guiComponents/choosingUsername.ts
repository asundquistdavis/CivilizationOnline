import { createGUIComponentType, GUIComponent, GUIComponentName, GUIComponentProps } from "../gui";
import { ChoosingGameInstance } from "../states/choosingGame";

export class ChoosingUsernameComponentInstance implements GUIComponent {
    
    static props:{submitNewUsername:(username:string)=>void, parentId?:string};
    readonly name:GUIComponentName = 'choosing-new-username'; 
    unRegister(): void {
        
    }
    create: (props: { [prop: string]: any}) => void = function(props:{parentId:string, submitNewUsername:(username:string)=>void}) {
        
        const parentId = props.parentId||'gui';
        const submitNewUsername = props.submitNewUsername;

        const windowId = 'username-window';
        const window = document.createElement('div');
        const header = document.createElement('div');
        const body = document.createElement('div');
        const bodyLeft = document.createElement('div');
        const bodyRight = document.createElement('div');
        const usernameInput = document.createElement('input');
        const submitButton = document.createElement('button');
        
        const onChange = (event:InputEvent) => {
        }

        const onKeyDown = (event:KeyboardEvent) => {
            if (event.key === 'Enter') {
                submitNewUsername(usernameInput.value);
            }
        }

        const onClick = () => {
            submitNewUsername(usernameInput.value);
        }

        window.id = windowId;
        window.className = 'window';
        header.id = windowId + '-header';
        header.innerText = 'Enter Username';
        body.id = windowId + '-body';
        bodyLeft.id = windowId + '-body-left';
        bodyRight.id = windowId + '-body-right';
        usernameInput.id = windowId + '-username-input';
        usernameInput.addEventListener('change', onChange);
        usernameInput.addEventListener('keydown', onKeyDown);
        usernameInput.setAttribute('placeholder', 'username');
        submitButton.id = windowId + '-submit-button';
        submitButton.innerText = 'log in';
        submitButton.addEventListener('onclick', onClick);

        window.appendChild(header);
        window.appendChild(body);
        body.appendChild(bodyLeft);
        body.appendChild(bodyRight);
        bodyLeft.appendChild(usernameInput);
        bodyRight.appendChild(submitButton);

        document.getElementById(parentId).appendChild(window);

    }
    static register(props:GUIComponentProps) {return new ChoosingUsernameComponentInstance()}

}
