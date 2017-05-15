const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const configRoutes = require("./routes");
const exphbs  = require('express-handlebars');
const data = require("./data");
const emails = data.emails;
const users = data.users;
const cookieParser = require('cookie-parser');
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const flash = require('connect-flash');

var fs = require('fs'), fileStream;
const Imap = require('imap'),
	inspect = require('util').inspect;
const util = require('util');
const spawn = require('child_process').spawn;
var bcrypt = require('bcrypt-nodejs');

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('login');
    }
}

passport.use(new LocalStrategy(
  function(username, password, done) {
    users.getUserByUsername(username).then((user) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!bcrypt.compareSync(password, user.hashedPassword)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      else {
        return done(null, user);
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  users.getUserById(id).then((user) => {
    done(null, user);
  });
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuring Passport
app.use(expressSession({ secret: 'tiptopsecret',
                         resave: false,
                         saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get("/login", (req, res) => {
	res.render('login',{error: req.flash('error')});
});
app.post('/login',
 passport.authenticate('local', { successRedirect: '/search',
                                   failureRedirect: '/login',
                               	   failureFlash: true})
);
app.get("/register", (req, res) => {
	res.render('register');
});

app.post("/register", (req, res) => {
	users.addUser(req.body.username,req.body.password).then((x) => {
		res.redirect('/login');
	});
});

app.get('/search',function(req,res,next) {
	res.render('search');
});

app.post("/search", (req, res) => {
	if(req.body.firstname === "" && req.body.lastname === ""){
		emails.findEmails5(req.body.phrase).then((x) => {
			res.render('search',{emails:x});
	});
	}
	else if(req.body.firstname === ""){
		emails.findEmails3(req.body.lastname,req.body.phrase).then((x) => {
			res.render('search',{emails:x});
	});

	}
	else if(req.body.lastname === ""){
		emails.findEmails2(req.body.firstname,req.body.phrase).then((x) => {
		res.render('search',{emails:x});
	});
	}
	else{
		emails.findEmails1(req.body.firstname,req.body.lastname,req.body.phrase).then((x) => {
			res.render('search',{emails:x});
		});
	}
});

app.use("*", (req, res) => {
    	res.render("home");
});

/*
// This code was used to open the inbox, download new emails, and save them as JSON, as described in the README

// Delete all files from eml_directory
function removeFilesFrom(dirPath) {
	try {
		var files = fs.readdirSync(dirPath);
	  if (files.length > 0)
		for (var i = 0; i < files.length; i++) {
		  var filePath = dirPath + '/' + files[i];
		  if (fs.statSync(filePath).isFile())
			fs.unlinkSync(filePath);
		  else
			removeFilesFrom(filePath);
		}

	}
	catch(e) {
		console.log(e);
		return;
	}

}
removeFilesFrom('eml_directory');

// Retrieve password
var pw = fs.readFileSync("pw.txt", encoding='utf8');
//TODO change this to asynchronous
<<<<<<< HEAD
var pw = fs.readFileSync("pw.txt", encoding='utf8').trim();


=======
var pw = fs.readFileSync("pw.txt", encoding='utf8').trim(); /*{
	if (error) throw error;
    console.log("it contained " + data);
    pw = data;
};*/
/*
>>>>>>> 0b08943cc036b3031c234e8e8c2f6688b2da1a6d
// imap package function to open the inbox
function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

// Set up imap connection
var imap = new Imap({
  user: 'cs546.dcinbox@gmail.com',
  password: pw,
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

// Marks emails as seen after we download them
function markMailSeen(uid) {
    imap.setFlags([uid], ['\\Seen'], (err) => {
      if (err) {
        throw err;
      }
      //console.log(err)
    });
}

var seq_list = [];

// Save all of the eml files from new emails to eml_directory
imap.once('ready', function() {
	openInbox(function(err, box) {
	  if (err) throw err;
	  imap.search([ 'UNSEEN' ], function(err, results) {
	    if (err) throw err;
	    if (results.length !== 0) {
		    var f = imap.fetch(results, { bodies: '' });
		    f.on('message', function(msg, seqno) {
		      console.log('Message #%d', seqno);
		      seq_list.push(seqno);
		      var prefix = '(#' + seqno + ') ';
		      msg.on('body', function(stream, info) {
		        //console.log(prefix + 'Body');
		        stream.pipe(fs.createWriteStream('eml_directory/msg' + seqno + '.eml'));
		      });
		      msg.once('attributes', function(attrs) {
		      	markMailSeen(attrs.uid);
		        //console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
		      });
		      msg.once('end', function() {
		        //console.log(prefix + 'Finished');
		      });
		    });
		    f.once('error', function(err) {
		      //console.log('Fetch error: ' + err);
		    });
		    f.once('end', function() {
		      console.log('Done fetching all messages!');
		      imap.end();
		    });
		} else console.log("Nothing to fetch");
	  });
	});
});

imap.once('error', function(err) {
  	console.log(err);
  	var currentdate = new Date();
  	var datetime = currentdate.getDate() + "-" + (currentdate.getMonth()+1) + "-" + currentdate.getFullYear()
  			+ "@" + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
  	var file = fs.createWriteStream('errors/seqno_error_' + datetime + '.txt');
	file.on('error', function(err) { });
	seq_list.forEach(function(v) { file.write(v.join(', ') + '\n'); });
	file.end();
  	imap.end();
  	throw err;
});

imap.once('end', function() {
  	console.log('Connection ended\nCalling email parser');

  	// Call the email_parser script, telling it to look in eml_directory
	var spawn = require('child_process').spawn,
    pythonProcess = spawn('python', ['email_parser.py', 'eml_directory', 'emails.json']);

	pythonProcess.stdout.on('data', function(data) {
	   console.log('stdout: ' + data);
	});

	pythonProcess.stderr.on('data', function (data) {
	  console.log('stderr: ' + data);
	});

	pythonProcess.on('close', function (code) {
	  console.log('child process exited with code ' + code);
	  // Add the new emails from emails.json to the database
	  var obj;
	  fs.readFile('emails.json', 'utf8', function (err, data) {
		  if (err) throw err;
		  obj = JSON.parse(data);
		  console.log(typeof obj);
		  var newEmails=[];
		  for(var i in obj)
		  	newEmails.push([i, obj[i]]);
		  for (var i = 0; i < newEmails.length; i++) {
		  	console.log(newEmails[i]);
		  	emails.addEmail(newEmails[i][1]);
		  }
	  });
	});
});

imap.connect();
*/

fs.readFile('emails.json', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);
  console.log(typeof obj);
  var newEmails=[];
  for(var i in obj)
  	newEmails.push([i, obj[i]]);
  for (var i = 0; i < newEmails.length; i++) {
  	console.log(newEmails[i]);
  	emails.addEmail(newEmails[i][1]);
  }
});

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
