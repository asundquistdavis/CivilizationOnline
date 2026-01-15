from flask import Flask, render_template, request
from flask_socketio import SocketIO
from state import State, Client
from errors import AuthError, DisconnectionError, InvalidData

app = Flask(__name__)
socket = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socket.on('requestMap')
def requestMap(data):
    if ((not data) or (not ('targetMapId' in data))):
        raise InvalidData
    with open('./assets/maps/standard.html', 'rb') as mapBin:
        socket.emit('sendMap', {'map': mapBin.read()})

@socket.on('loadGame')
def loadGame(data):
    if ((not data) or (not ('id' in data))):
        raise InvalidData
    with open('./assets/aCardDecks/standard.json', 'r') as aCards,\
        open('./assets/tCardDecks/standard.json', 'r') as tCards,\
        open('./assets/common/civilizations.json', 'r') as civilizations:
        socket.emit('loadGame', {
            'aCards': aCards.read(),
            'tCards': tCards.read(),
            'civilizations': civilizations.read(),
        })
    

@socket.on('disconnecting')
def disconnecting(data:dict):
    pass

if (__name__ == '__main__'):
    socket.run(app, use_reloader=True)
