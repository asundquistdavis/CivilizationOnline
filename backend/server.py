import eventlet
eventlet.monkey_patch()
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room
from errors import  InvalidData

app = Flask(__name__)
socket = SocketIO(app, async_mode='eventlet', cors_allowed_origins="*")

def getValue(payload:dict, key:str):
    if not (payload and (key in payload)):
        raise InvalidData(key, payload)
    return payload.get(key)

@app.route('/')
def index():
    return render_template('index.html')

@socket.on('connect')
def connect(payload:dict):
    if ((not payload) or  (not ('userId') in payload)):
        return InvalidData
    userId = payload.get('userId') if payload.get('userId') else request.sid
    print('connected: ', userId)
    join_room(userId)    
    socket.emit('auth', userId)

@socket.on('requestMap')
def requestMap(data):
    if ((not data) or (not ('targetMapId' in data))):
        raise InvalidData
    with open('./backend/assets/maps/standard.html', 'rb') as mapBin:
        socket.emit('sendMap', {'map': mapBin.read()})

@socket.on('requestStaticAsset')
def requestStatic(payload:dict):
    type = getValue(payload, 'type')
    name = getValue(payload, 'name')
    with open(f'./backend/assets/{type}/{name}', 'r') as file:
        socket.emit('requestStaticAsset', {**payload, 'data': file.read()})

@socket.on('joinGame')
def joinGame(payload:dict):
    hostId = getValue(payload, 'hostId')
    userId = getValue(payload, 'userId')
    join_room('game'+hostId)
    socket.emit('joinGame', {'userId':userId}, room=hostId)

@socket.on('activeGamesOn')
def activeGamesOn(payload:dict):
    join_room('activeGames')
    socket.emit('activeGames', broadcast=True)

@socket.on('activeGamesOff')
def activeGamesOff(payload:dict):
    leave_room('activeGames')

@socket.on('requestGameData')
def requestGameData(payload:dict):
    print('request', )
    hostId = getValue(payload, 'hostId')
    socket.emit('requestGameData', payload, room=hostId)

@socket.on('confirmGameData')
def confirmGameData(payload:dict):
    print('confirm', payload)
    gamesLess = payload.get('gameLess', False)
    hostId = getValue(payload, 'hostId')
    room = 'activeGames' if gamesLess else ('game' + hostId)
    socket.emit('confirmGameData', payload, room=room)

@socket.on('disconnecting')
def disconnecting(data:dict):
    pass

if (__name__ == '__main__'):
    socket.run(app, use_reloader=True)


