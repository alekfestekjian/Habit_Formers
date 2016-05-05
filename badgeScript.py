import requests
import json

headers = {'content-type': 'application/json'}
url = 'http://107.170.29.15:4000/api/badges'
filename = 'data/completionBadges.json'
# filename = 'data/specialBadges.json'

with open(filename) as json_data:
    d = json.load(json_data)
    for item in d:
        requests.post(url, data=json.dumps(item), headers=headers)
