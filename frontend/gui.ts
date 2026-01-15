
import Board from './board';
import './styles/gui.css';

export default class GUI {

    board: Board;

    static createAndGet() {

        const gui = new GUI();

        // create and add gui html to dom
        const root = document.getElementById('root');
        const oneWindow = document.createElement('div');
        oneWindow.id = 'gui';
        root.appendChild(oneWindow);

        gui.board = Board.createAndGet();

        return gui

    }

    reset() {

        document.getElementById('gui').replaceChildren();

    }


    createUsernameWindow(submit:(username:string)=>void, parentId='gui') {

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
                submit(usernameInput.value);
            }
        }

        const onClick = () => {
            submit(usernameInput.value);
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


    createSettingsWindowWith(buttonPropsList:SettingsWindowButtonProps[], parentId='at-settings') {

        const window = document.createElement('div');
        
        const getSettingsWindowButton = (buttonProps:SettingsWindowButtonProps) => {

            const buttonWrapper = document.createElement('div');
            const button = document.createElement('button');

            button.innerText = buttonProps.text
            button.addEventListener('click', buttonProps.onClick)

            buttonWrapper.appendChild(button);
            return buttonWrapper

        }

        buttonPropsList.forEach(buttonProps=>window.appendChild(getSettingsWindowButton(buttonProps)));

    }
}

type SettingsWindowButtonProps = {
    text:string,
    onClick:(event:MouseEvent)=>void,
}


    // if (!username) {
    //     const submit = (username:string) => {
    //         localStorage.setItem('username', username);
    //         conn.emit('username', {})

    //     }
    //     createUsernameSection(submit);


