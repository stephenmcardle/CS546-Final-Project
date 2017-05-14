const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const configRoutes = require("./routes");
const exphbs  = require('express-handlebars');
const data = ("../data");
const emails = data.emails;

var fs = require('fs'), fileStream;
const Imap = require('imap'),
	inspect = require('util').inspect;
const util = require('util');
const spawn = require('child_process').spawn;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutes(app);


// Delete all files from eml_directory
function removeFilesFrom(dirPath) {
	try { 
		var files = fs.readdirSync(dirPath);
	}
	catch(e) {
		console.log(e);
		return;
	}
	if (files.length > 0)
		for (var i = 0; i < files.length; i++) {
			var filePath = dirPath + '/' + files[i];
			if (fs.statSync(filePath).isFile())
				fs.unlinkSync(filePath);
			else
				removeFilesFrom(filePath);
		}

}
removeFilesFrom('eml_directory');


// Retrieve password
//TODO change this to asynchronous
var pw = fs.readFileSync("pw.txt", encoding='utf8'); /*{
	if (error) throw error;
    console.log("it contained " + data);
    pw = data;
};*/

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
        throw err
      }
      //console.log(err)
    });
}

var seq_list = []

// Save all of the eml files from new emails to eml_directory
imap.once('ready', function() {
	openInbox(function(err, box) {
	  if (err) throw err;
	  imap.search([ 'UNSEEN'/*, ['SINCE', 'May 07, 2017']*/ ], function(err, results) {
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
	file.on('error', function(err) { /* error handling */ });
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
	  fs.readFile('file', 'utf8', function (err, data) {
		  if (err) throw err;
		  obj = JSON.parse(data);
		  var newEmails = obj.toArray();
		  //Not sure if this loop will work because insertEmail() is async
		  for (var i = 0; i < newEmails.length; i++) {
		  	emails.insertEmail(newEmails[i]);
		  }
	  });
	});
});

imap.connect();

// TODO Add the new emails from emails.json to the database


app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});