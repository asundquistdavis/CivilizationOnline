from typing import Dict


class Client:

    def __init__(self, id):
        
        self._id = id
        self._isActive = True

    def isActive(self):
        return self._isActive

    def activate(self):
        self._isActive = True

    def deactivate(self):
        self._isActive = False

    def getView(self):

        return {
            'id': self._id,
            'isActive': self._isActive
        }

class State:

    _clientMap:Dict[str, Client] = {}
    _hostId = None

    def getNumberOfClients(self):

        return len(self.getClientIds())
    
    def getNumberOfActiveClients(self):

        return len(0 for  client in self.iterClients() if client.isActive())

    def getClientIds(self):

        return self._clientMap.keys()
    
    def iterClients(self):

        return self._clientMap.values()

    def hasHost(self):

        return self._hostId != ''
    
    def addClient(self, clientId:str):

        client = Client(clientId)
        self._clientMap[clientId] = client
    
    def getClientById(self, clientId:str):
        
        return self._clientMap.get(clientId)

    def setHost(self, clientId):

        self._hostId = clientId

    def getClientListView(self):

        return [client for client in self.iterClients()]
