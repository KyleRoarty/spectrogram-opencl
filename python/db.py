#!/usr/bin/env python3

import sqlite3

from flask import g, current_app
from flask.cli import with_appcontext
import click

DATABASE = '/home/kyle/Documents/spectrogram/database.db'

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            DATABASE,            
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

@click.command('init-db')
@with_appcontext
def init_db():
    db = get_db()

    with current_app.open_resource('afileschema.sql') as f:
        db.executescript(f.read().decode('utf8'))
    click.echo('Initialized the db')

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db)


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv