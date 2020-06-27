
from flask import session, Flask, render_template, url_for, request, redirect, flash, Response, make_response, jsonify
import db
import json
import logging
import flask_login
import re
import os
from flask_socketio import SocketIO, emit, join_room, leave_room

"""
CONFIGS
===================================
"""
app = Flask('app')
app.secret_key = os.getenv('secretkey')
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")
# Mutes console output
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

"""
CLEARING CACHE
===================================
Don't delete any of this lol
"""
@app.after_request
def add_header(r):
	r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
	r.headers["Pragma"] = "no-cache"
	r.headers["Expires"] = "0"
	r.headers['Cache-Control'] = 'public, max-age=0'
	return r

"""
LOGIN
===============================================
Just several notes:
`flask_login.login_user(User())` to log in a user
`flask_login.current_user.id` to get the current user's name
"""
login_manager = flask_login.LoginManager()
login_manager.init_app(app)
class User(flask_login.UserMixin):
	pass
@login_manager.user_loader
def user_loader(username):
	u = db.get_user_by("name", username)
	if not u: return
	user = User()
	user.id = u["name"]
	return user
@login_manager.request_loader
def request_loader(request):
	if request.form:
		username = request.form["username"]
		if not db.verify_user(username, request.form["password"]):
			# Authenticated failed
			return
		u = db.get_user_by("name", username)
		user = User()
		user.id = u["name"]
		return user
# Handle unauthorized access redirects to login page
@login_manager.unauthorized_handler
def unauthorized_handler():
	# Unauthorized people will be redirected to the main page
	return redirect(url_for('index'))

"""
ROUTES
==============================
Create new pages/links here!
"""
@app.route('/')
def index():
	current_user = flask_login.current_user
	# If the user isn't logged in the id isn't defined
	try: current_user.id
	except: current_user = None
	return render_template('index.html', page_name="index", current_user=current_user)

@app.route('/profile/<username>')
@flask_login.login_required
def profile(username):
	current_user = flask_login.current_user.id
	# Make sure the user actually exists
	profile_user_data = db.get_user_by("name", username)
	if (profile_user_data):
		return render_template('profile.html',
			page_name="profile",
			current_user=current_user,
			profile_user=username)
	else:
		return render_template('404.html', message="User {} doesn't exist!".format(username))

@app.route('/login', methods=['POST', 'GET'])
def login():
	if request.form:
		# If inputPassword2 field is not empty, this is a registration.
		name = request.form["username"]
		pwrd = request.form["password"]
		# Registration
		if request.form["password2"]:
			# Check for illegal characters in the name
			for x in name:
				if not re.match(r'[A-Za-z0-9_]+$', name):
					flash("Your name has an illegal character! Only letters, numbers, and underscores are allowed.")
					return render_template('login.html')
			if (pwrd != request.form["password2"]):
				flash("Passwords do not match!")
				return render_template('login.html')
			if (len(pwrd) < 6):
				flash("Password must be at least 6 characters.")
				return render_template('login.html')
			if db.get_user_by("username", name):
				flash("User '{}' already exists!".format(name))
				return render_template('login.html')
			else:
				print("New user {} registered!".format(name))
				db.create_user(name, pwrd)
				flash("User created!")
				return render_template('login.html', newuser=True)
		# Validated user
		elif db.verify_user(name, pwrd):
			print(name, "has been verified!")
			user = User()
			user.id = name
			flask_login.login_user(user)
			return redirect("/profile/"+name)
		else:
			flash("Incorrect credentials!")
			return render_template('login.html', page_name="login")
	else:
		return render_template('login.html', page_name="login")

@app.route('/logout')
@flask_login.login_required
def logout():
    flask_login.logout_user()
    return redirect('/')

@app.route('/chat')
@flask_login.login_required
def chat():
    name = flask_login.current_user.id
    # Find a place to set the room name
    session['room'] = "GeneralChat"
    room = session.get('room', '')
    return render_template('chat.html', name=name, room=room)

"""
SOCKETS/CHAT STUFF
====================================
"""

@socketio.on('joined', namespace='/chat')
def joined(message):
    name = flask_login.current_user.id
    room = session.get('room')
    join_room(room)
    emit('status', {'msg': name + ' joined'}, room=room)

@socketio.on('text', namespace='/chat')
def text(message):
    room = session.get('room')
    name = flask_login.current_user.id
    emit('message', {'msg': name + ':' + message['msg']}, room=room)

@socketio.on('left', namespace='/chat')
def left(message):
    room = session.get('room')
    name = flask_login.current_user.id
    leave_room(room)
    emit('status', {'msg': name + ' left'}, room=room)

"""
RUN APP
===================================
Note: might need to change host and set
debug to false once deployed.
"""
app.run(host='0.0.0.0', port=8080, debug=True)