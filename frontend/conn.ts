import {io, Socket} from 'socket.io-client';

type ServerData = {[prop:string]: string|ArrayBuffer|ArrayLike<number>|number}

type ClientData = {[prop:string]: string}

export default class Conn {

    private _socket:Socket;
    private _isConnected:boolean;

    on(event:string, callback:(data:ServerData)=>void) {

        this._socket.on(event, callback);
    
    }

    emit(event:string, data:ClientData) {

        this._socket.emit(event, { username: localStorage.getItem('username'), ...data});

    }

    static startAndGet() {

        return new Promise<Conn>((resolve, reject)=>{

            const conn = new Conn();
            
            conn._socket = io({auth: {username: localStorage.getItem('username')}});

            conn.on('error', (error:ServerData) => {

                if (!conn._isConnected) {

                    reject(error);

                }

            })

            conn.on('unauthorized', () => {



            })
            
            conn._socket.on('connect', () => {

                conn._isConnected = true;

                resolve(conn);

            })

            conn.on('assignLocalStorage', (data:ServerData) => {
                Object.entries(data).forEach(([prop, value])=>localStorage.setItem(prop, value as string))
            });

            conn.on('getLocalStorage', (data:ServerData) => {
                Object.entries(data).map(([key, ])=>localStorage.getItem(key))
            });
            
            window.addEventListener('beforeunload', () => conn.emit('disconnecting', {username: localStorage.getItem('username')}) )
                        
        })

    }

}

