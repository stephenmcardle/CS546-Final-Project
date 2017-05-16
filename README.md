# CS546 Final Project - DC Inbox

Stephen McArdle, Andrew Neurohr, Kareem Mohamed, John Seebode
I pledge my honor that I have abided by the Stevens Honor System.

## Run the Project
```sh
$ npm install
$ npm start
```
Then open localhost:3000 in your web browser. The website is mostly self-explanatory. To start, try searching the database. To download search results, you must first register a new user and login.

## Behind the scenes
The project originally opened a Gmail inbox using IMAP, downloaded all unread emails as .eml, appended Congressman information from the ProPublica Congress API, and saved them into a single .json file called emails.json. The code for this can be seen in app.js and email_parser.py. However, our API key was rate limited, so we modified the program to add emails to the database from an emails.json file we had previously created.

### Note
Keep in mind that email_parser.py was created for a different project, so the format of emails.json is not ideal for this project.
Our demo video shows that some emails are repeated in search results. This is because we have been testing with the same emails.json file repeatedly to avoid abusing our API key.
This project was tested on Linux.