var fs = require('fs'), fileStream;
var Imap = require('imap'),
	inspect = require('util').inspect;
var util = require('util');
var spawn = require('child_process').spawn;


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
var pw = fs.readFileSync("pw.txt" ,encoding='utf8'); /*{
	if (error) throw error;
    console.log("it contained " + data);
    pw = data;
};*/

// imap package function to open the inbox
function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

// Set up imap connection
var imap = new Imap({
  user: 'cs546.dcinbox@gmail.com',
  password: pw,
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

// Save all of the eml files from new emails to eml_directory
//TODO mark messages as read, the markSeen flag isn't currently working
imap.once('ready', function() {
	openInbox(function(err, box) {
	  if (err) throw err;
	  imap.search([ 'UNSEEN', ['SINCE', 'May 07, 2017'] ], function(err, results) {
	    if (err) throw err;
	    var f = imap.fetch(results, { markSeen: true, bodies: '' });
	    f.on('message', function(msg, seqno) {
	      console.log('Message #%d', seqno);
	      var prefix = '(#' + seqno + ') ';
	      msg.on('body', function(stream, info) {
	        //console.log(prefix + 'Body');
	        stream.pipe(fs.createWriteStream('eml_directory/msg' + seqno + '.eml'));
	      });
	      msg.once('attributes', function(attrs) {
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
	  });
	});
});

imap.once('error', function(err) {
  console.log(err);
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
	});
});

imap.connect();

// TODO Add the new emails from emails.json to the database
// TODO add express server