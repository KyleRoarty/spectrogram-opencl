#!/usr/bin/env python3

import os
import hashlib
import time
from flask import Flask, request
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
import logging

UPLOAD_FOLDER= '/home/kyle/Documents/spectrogram/uploads'
BUF_SIZE = 65536

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def fileUpload():
    uploaded_files = request.files.getlist("file")

    for f in uploaded_files:
        # Hash file because I'm weird
        md5 = hashlib.md5()
        while True:
            data = f.read(BUF_SIZE)
            if not data:
                break
            md5.update(data)
        # Need to go back to start of file to actually write it
        # Who would've thunk it
        f.seek(0)
        target = os.path.join(UPLOAD_FOLDER, 'test', md5.hexdigest())
        if not os.path.isdir(target):
            os.makedirs(target) 
        dest = os.path.join(target, f.filename)
        f.save(dest)
    return ""

CORS(app)