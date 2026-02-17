import {io, Socket} from 'socket.io-client';

type ServerData = any
type ServerPayload = string;

type ClientData = any

export default class Conn {

    private _socket:Socket;
    private _isConnected:boolean=false;

    on(event:string, callback:(data:ServerData|ServerPayload)=>void, once:boolean=false):void {

        if (once) {this._socket.once(event, callback)}
        this._socket.on(event, callback);
    
    }

    emit(event:string, data:ClientData) {

        this._socket.emit(event, data);

    }

    static startAndGet() {

        return new Promise<Conn>((resolve, reject)=>{

            const conn = new Conn();
            
            conn._socket = io({auth: {userId: localStorage.getItem('userId')}});

            conn.on('error', (error:ServerData) => {

                if (!conn._isConnected) {

                    reject(error);

                }

            });
            
            conn._socket.on('connect', () => {

                conn._isConnected = true;

                resolve(conn);

            });
                                    
        })

    }

}

