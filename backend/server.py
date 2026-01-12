from flask import Flask, render_template, request
from flask_socketio import SocketIO
from state import State, Client
from errors import AuthError, DisconnectionError

app = Flask(__name__)
socket = SocketIO(app)
state = State()

@app.route('/')
def index():
    return render_template('index.html')

@socket.on('connect')
def connect(auth:dict):
    if ((not auth) or (not ('clientId' in auth))):
        raise AuthError
    clientId = auth.get('clientId')
    if (not clientId):
        print('new client')
        clientId = request.sid
        socket.emit('assignLocalStorage', {'clientId': clientId})
        state.addClient(clientId)
    client = state.getClientById(clientId)
    client.activate()
    if (not state.hasHost()):
        state.setHost(clientId)    
    socket.emit('assignLocalStorage', {'hostId': clientId}, broadcast=True)
    

@socket.on('disconnecting')
def disconnecting(data:dict):
    if ((not data) and (not ('clientId' in data))):
        raise DisconnectionError
    clientId = data.get('clientId')
    state.getClientById(clientId).deactivate()

if (__name__ == '__main__'):
    socket.run(app, use_reloader=True)
