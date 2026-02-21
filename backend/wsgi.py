import eventlet
eventlet.monkey_patch()

from server import app as application