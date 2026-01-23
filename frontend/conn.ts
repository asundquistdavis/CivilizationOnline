import {io, Socket} from 'socket.io-client';
import Data from './data';

type ServerData = any
type ServerPayload = string;

type ClientData = any

export default class Conn {

    private _socket:Socket;
    private _isConnected:boolean;

    on(event:string, callback:(data:ServerData|ServerPayload)=>void, once:boolean=false):void {

        if (once) {this._socket.once(event, callback)}
        this._socket.on(event, callback);
    
    }

    emit(event:string, data:ClientData) {

        this._socket.emit(event, { username: localStorage.getItem('username'), ...data});

    }

    static startAndGet(data:Data) {

        return new Promise<Conn>((resolve, reject)=>{

            const conn = new Conn();
            
            conn._socket = io({auth: {userId: localStorage.getItem('userId')}});

            conn.on('auth', (userId:string)=>{
                data.userId = userId
                localStorage.setItem('userId', userId);
            });

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

