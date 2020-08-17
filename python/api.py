#!/usr/bin/env python3

import os
import hashlib
import time
from flask import Flask, request, jsonify, send_from_directory, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
from db import init_app, query_db, get_db, close_db

UPLOAD_FOLDER= '/home/kyle/Documents/spectrogram/uploads'
BUF_SIZE = 65536

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def fileUpload():
    uploaded_files = request.files.getlist("file")
    retnames = []
    new_files = False

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
            deeb = get_db()
            cur = deeb.cursor()
            cur.execute("INSERT INTO audiofiles (filepath,fname,fhash) VALUES (?,?,?)",
                (target,f.filename,md5.hexdigest()))
            deeb.commit()
            close_db()
            new_files = True

    if new_files:
        deeb_data = query_db("select fname from audiofiles")
        for dat in deeb_data:
            print(dat["fname"])
            retnames.append(dat["fname"])

    return jsonify(names=retnames)

@app.route('/get-data', methods=['GET'])
def getFileNames():
   retnames = []
   deeb_data = query_db("select fname from audiofiles")
   for dat in deeb_data:
       retnames.append(dat["fname"]) 

   return jsonify(names=retnames)

@app.route('/files/<path:filename>', methods=['GET'])
def returnFile(filename):
    #print(request.headers)
    # Maybe check if file actually exists, but it should lmao
    hash = query_db("select fhash from audiofiles where fname == '{}'".format(filename), (), one=True)

    return send_from_directory(UPLOAD_FOLDER, '{}/{}/{}'.format('test', hash['fhash'], filename))

init_app(app)
CORS(app)