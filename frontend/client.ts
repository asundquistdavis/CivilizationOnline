import {io, Socket} from 'socket.io-client';

type ServerData = {[prop:string]: string}

export default function getConnection() {

    const conn:Socket = io({auth: {clientId: localStorage.getItem('clientId')}});

    conn.on('assignLocalStorage', (data:ServerData) => {
        Object.entries(data).forEach(([prop, value])=>localStorage.setItem(prop, value))
    });
    
    window.addEventListener('beforeunload', () => conn.emit('disconnecting', {clientId: localStorage.getItem('clientId')}) )



    return conn

}

