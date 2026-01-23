from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room
from errors import  InvalidData

app = Flask(__name__)
socket = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socket.on('connect')
def connect(payload:dict):
    if ((not payload) or  (not ('userId') in payload)):
        return InvalidData
    userId = payload.get('userId') if payload.get('userId') else request.sid
    join_room(userId)    
    socket.emit('auth', userId)

@socket.on('requestMap')
def requestMap(data):
    if ((not data) or (not ('targetMapId' in data))):
        raise InvalidData
    with open('./backend/assets/maps/standard.html', 'rb') as mapBin:
        socket.emit('sendMap', {'map': mapBin.read()})

@socket.on('requestData')
def loadGame(data:dict):
    if ((not data) or (not ('dataKey' in data))):
        raise InvalidData
    dataKey:str = data.get('dataKey')
    options:dict = data.get('options') if ('options' in data) else {}
    type:str = options.get('type') if ('type' in options) else 'static'
    if (type == 'static'):
        dataKey = dataKey.replace('Static', '')
        deck:str = options.get('deck') if ('deck' in options) else 'standard.json'
        with open(f'./backend/assets/{dataKey}/{deck}', 'r') as payload:
            socket.emit(f'setData-{dataKey}Static', payload.read())
    if (type == 'dynamic'):
        pass

@socket.on('sendData')
def sendData(payload:dict):
    if not (payload and ('dataKey' in payload) and ('control' in payload) and ('instance' in payload)):
        raise InvalidData
    control:dict = payload.get('control')
    if not (control and ('gameId' in control) and ('userId' in control) and ('hostId' in control)):
        return InvalidData
    gameId:str = control.get('gameId')
    userId:str = control.get('userId')
    hostId:str = control.get('hostId')
    dataKey:str = payload.get('dataKey')
    instance:dict = payload.get('instance', {})
    socket.emit('setData', payload, room=hostId)
    
@socket.on('hostGame')
def hostGame(payload:dict):
    print(payload)
    if not (payload and ('hostId' in payload) and ('gameId' in payload) and ('name' in payload)):
        raise InvalidData
    gameId = payload.get('gameId')
    hostId = payload.get('hostId')
    name = payload.get('name')
    playerIds = payload.get('playerIds', [])
    join_room(f'gameId:{gameId}')
    socket.emit('availableGame', {'hostId':hostId, 'gameId':gameId, 'name':name, 'playerIds': playerIds}, broadcast=True)

@socket.on('disconnecting')
def disconnecting(data:dict):
    pass

if (__name__ == '__main__'):
    socket.run(app, use_reloader=True)


