
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
	try:
		test = current_user.id
		user = db.get_user_by("name", test)
		return render_template('profile.html',
			page_name="profile",
			current_user=test,
			profile_user=test,
			user_data = user)
	except: current_user = None
	return render_template('index.html', page_name="index", current_user=current_user)

@app.route('/profile/<username>')
@flask_login.login_required
def profile(username):
	current_user = flask_login.current_user.id
	# Make sure the user actually exists
	profile_user_data = db.get_user_by("name", username)
	current_user_data = db.get_user_by("name", current_user)
	if (profile_user_data):
		return render_template('profile.html',
			page_name="profile",
			current_user=current_user,
			profile_user=username,
			user_data = profile_user_data,
			current_user_data = current_user_data)
	else:
		return render_template('404.html', message="User {} doesn't exist!".format(username))

@app.route('/feed')
@flask_login.login_required
def feed():
	posts = {}
	current_user = flask_login.current_user.id
	user_data = db.get_user_by("name", current_user)

	[posts.update(x["stories"]) for x in list(db.users.find({}, {'stories':1, '_id':0})) if "stories" in x]
	print(set(list(posts.items())[0][1]["tags"]), set(user_data["tags"]))
	posts = {name: data for name, data in posts.items() if len(set(data["tags"]).intersection(set(user_data["tags"])))}
	print(posts)
	featured = list(sorted(posts.items(), key=lambda k: len(k[1]["comments"])))[::-1]
	return render_template('feed.html', page_name="feed", featured=featured, user_data=user_data)

@app.route('/discover')
@flask_login.login_required
def discover():
	posts = {}
	current_user = flask_login.current_user.id
	user_data = db.get_user_by("name", current_user)

	[posts.update(x["stories"]) for x in list(db.users.find({}, {'stories':1, '_id':0})) if "stories" in x]
	featured = list(sorted(posts.items(), key=lambda k: len(k[1]["comments"])))[::-1]
	return render_template('discover.html', page_name="discover", featured=featured, user_data=user_data)

@app.route('/friend')
@flask_login.login_required
def friend():
	current_user = flask_login.current_user.id
	user_data = db.get_user_by("name", current_user)
	friends = [x for x in list(db.users.find({})) if "tags" in x and len(set(x["tags"]).intersection(set(user_data["tags"]))) and x["name"] != current_user]
	return render_template('friend.html', page_name="friend", friends=friends, user_data=user_data)

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

@app.route('/changebio', methods=["POST"])
@flask_login.login_required
def change_bio():
	name = flask_login.current_user.id
	data = request.json
	print(data)
	db.change_bio(name, data["bio"])
	return jsonify({})

@app.route('/addfriend', methods=["POST"])
@flask_login.login_required
def add_friend():
	name = flask_login.current_user.id
	data = request.json
	db.friend(name, data["target"])
	print("ADDING", db.get_user_by("name", name)["friends"])
	return jsonify({})

@app.route('/removefriend', methods=["POST"])
@flask_login.login_required
def remove_friend():
	name = flask_login.current_user.id
	data = request.json
	db.unfriend(name, data["target"])
	print("REMOVING", db.get_user_by("name", name)["friends"])
	return jsonify({})

@app.route('/changetags', methods=["POST"])
@flask_login.login_required
def change_tags():
	name = flask_login.current_user.id
	data = request.json
	tags = [x[3:] for x in data["tags"]]
	db.change_tags(name, tags)
	return jsonify({"tags":tags})

@app.route('/newstory', methods=["POST"])
@flask_login.login_required
def new_story():
	name = flask_login.current_user.id
	data = request.json
	title = data["title"].replace(" ", "_").replace("'", "")
	del data["title"]
	data["comments"] = []
	data["author"] = name
	db.new_story(name, title, data)
	return jsonify(render_template("postcard.html", title=title, story=data))

@app.route('/comment', methods=["POST"])
@flask_login.login_required
def comment():
	name = flask_login.current_user.id
	data = request.json
	title = data["title"]
	author = data["author"]
	db.comment(author, name, title, data["comment"])
	print(db.get_user_by("name", author))
	return jsonify({"user": name, "comment": data["comment"]})

@app.route('/deletestory', methods=["POST"])
@flask_login.login_required
def delete_story():
	name = flask_login.current_user.id
	data = request.json
	title = data["title"]
	db.delete_story(name, title)
	return jsonify({})

"""
SOCKETS/CHAT STUFF
====================================
"""

@socketio.on('joined', namespace='/chat')
def joined(message):
	name = flask_login.current_user.id
	room = session.get('room')
	join_room(room)
	emit('status', {'id':name, 'msg': name + ' joined'}, room=room)

@socketio.on('text', namespace='/chat')
def text(message):
	room = session.get('room')
	name = flask_login.current_user.id
	emit('message', {'sender': name, 'msg': message['msg']}, room=room)

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