#!/usr/bin/env python3

import time
from flask import Flask, request
from flask_cors import CORS, cross_origin
import logging

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def fileUpload():
    uploaded_files = request.files.getlist("file")
    print(uploaded_files)
    return ""

CORS(app)