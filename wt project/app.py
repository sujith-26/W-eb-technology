from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from geopy.geocoders import Nominatim

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('map.html')

@app.route('/location', methods=['POST'])
def get_location():
    data = request.get_json()
    latitude = data['latitude']
    longitude = data['longitude']

    geolocator = Nominatim(user_agent="location_visualizer")
    location = geolocator.reverse((latitude, longitude))

    return jsonify({'address': location.address})

if __name__ == '__main__':
    app.run(debug=True)
