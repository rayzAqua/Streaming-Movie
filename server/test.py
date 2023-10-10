import pyrebase

config = {
    "apiKey": "AIzaSyD5NYG_KvI-xBOnLNwis6Rf7yotOR7-r4M",
    "authDomain": "moviestreamingstorage.firebaseapp.com",
    "projectId": "moviestreamingstorage",
    "storageBucket": "moviestreamingstorage.appspot.com",
    "messagingSenderId": "876953137743",
    "appId": "1:876953137743:web:46c67d73e167e68a10703a",
    "serviceAccount": "serviceAccount.json",
    "databaseURL": "https://moviestreamingstorage-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

firebase = pyrebase.initialize_app(config)
storage = firebase.storage()

storage.child()