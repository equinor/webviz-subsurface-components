import os.path
from flask import Flask, send_file

# app = Flask(__name__)

class tile_server():

    def __init__(self, flask_app):

        app = flask_app
        print("running server")
        
        @app.route('/tiles/<zoom>/<y>/<x>')
        def tiles(zoom, x, y):
            default = '_path_to_default_tile\\tiles\\0\\11\\333\\831.png'
            filename = '_path_to_tiles\\tiles\\0\\%s\\%s\\%s.png' % (zoom, x, y)
            print("recieved request")
            # if os.path.isfile(filename):
            #     return send_file(filename)
            # else:
                # return send_file(default)
            return("hello worl!")
    
        # app.run(debug=True)
    # if __name__ == "__main__":
        

    # postgres on port 5432