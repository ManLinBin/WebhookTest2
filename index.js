'use strict';

// Imports dependencies and set up http server
const
	express = require('express'),
	bodyParser = require('body-parser'),
	request = require('request'),
	app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => {
	
	console.log('webhook is listening')
	
	/* 定时发送测试
	setInterval(function() {
		
		console.log('Handle Game Play Event')
	
		let response;
		
		response = 
		{
			"attachment": 
			{
				"type": "template",
				"payload": 
				{
					"template_type": "generic",
					"elements": 
					[
						{
							"title": "Come back to win champion.",
							"image_url":"https://scontent.xx.fbcdn.net/v/t1.15752-9/42298943_2398399536842138_5302285187319595008_n.png?_nc_cat=110&_nc_ad=z-m&_nc_cid=0&oh=6db9f0325092f746b9973ad98bc919f5&oe=5C208FAB",
							"buttons": 
							[
								{
									"type":"game_play",
									"title":"Play"
									/*
									"payload":"{<SERIALIZED_JSON_PAYLOAD>}",
									"game_metadata": { // Only one of the below
									"player_id": "<PLAYER_ID>",
									"context_id": "<CONTEXT_ID>"
									}
									
								}
							]
						}
					]
				}
			}
		}
	
		// Send the message to acknowledge the postback
		callSendAPI("1401848636584259", response);
		
	}, 0.1 * 60 * 1000);
	*/
	
	}
	
	
);

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
 
	//console.log('PostReceived')
	let body = req.body;

	// Checks this is an event from a page subscription
	if (body.object === 'page') {

		// Iterates over each entry - there may be multiple if batched
		body.entry.forEach(function(entry) {

			// Gets the message. entry.messaging is an array, but 
			// will only ever contain one message, so we get index 0
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);
		  
			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log('Sender PSID: ' + sender_psid);
			
			// Check if the event is a message or postback and
			// pass the event to the appropriate handler function
			if (webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message);        
			} else if (webhook_event.postback) {
				handlePostback(sender_psid, webhook_event.postback);
			} else if (webhook_event.game_play) {
				handleGamePlay(sender_psid, webhook_event.game_play);
			}
		  
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send('EVENT_RECEIVED');
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

	// Your verify token. Should be a random string. - fb offer it
	let VERIFY_TOKEN = "EAAF0FIhhN7YBAF0RYmxxUslnpCCrjYY2z8Oq2qjgeCKtKo23mZAvifGwpWSRRK0RXWGuFYb0ZChoyfZABIizeGW3sHQZA9Ibr7dBj0ZBfJTHUCd0GkflrdxNGSyDZCHuKsZAkI3CVJRBFJ6vvMum3WhomShrXm9X3lPM1TgpwnAuyBuokbCYpNa"
    
	// Parse the query params
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
    
	// Checks if a token and mode is in the query string of the request
	if (mode && token) {
  
		// Checks the mode and token sent is correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
			// Responds with the challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
    
		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);      
		}
	}
});

// Handles messages events
function handleMessage(sender_psid, received_message) {

	console.log('HANDLE MESSAGE')
	let response;

	// Check if the message contains text
	if (received_message.text) {    

		// Create the payload for a basic text message
		response = {
			"text": `You sent the message: "${received_message.text}". Now send me an image!`
		}
		
	} else if (received_message.attachments) {
  
		// Gets the URL of the message attachment
		let attachment_url = received_message.attachments[0].payload.url;
		console.log('Handle image')
		console.log('PHOTO URL: ' + attachment_url)
		response = 
		{
			"attachment": 
			{
				"type": "template",
				"payload": 
				{
					"template_type": "generic",
					"elements": 
					[
						{
							"title": "Is this the right picture?",
							"subtitle": "Tap a button to answer.",
							"image_url": attachment_url,
							"buttons": 
							[
								{
								  "type": "postback",
								  "title": "Yes!",
								  "payload": "yes"
								},
								{
								  "type": "postback",
								  "title": "No!",
								  "payload": "no"
								}
							]
						}
					]
				}
			}
		}
	} 
  
	// Sends the response message
	callSendAPI(sender_psid, response); 
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
	
	let response;

	// Get the payload for the postback
	let payload = received_postback.payload;

	// Set the response based on the postback payload
	if (payload === 'yes') {
		response = { "text": "Thanks!We receive your image (*^▽^*)" }
	} else if (payload === 'no') {
		response = { "text": "Oops, try sending another image. Please" }
	}
	
	// Send the message to acknowledge the postback
	callSendAPI(sender_psid, response);
	
}

function handleGamePlay(sender_psid, received_game_play) {
	
	console.log('Handle Game Play Event')
	
	let response;

	
	response = 
	{
		"attachment": 
		{
			"type": "template",
			"payload": 
			{
				"template_type": "generic",
				"elements": 
				[
					{
						"title": "Someone passed you.Come back to beat them.",
						"image_url":"https://scontent.xx.fbcdn.net/v/t1.15752-9/42298943_2398399536842138_5302285187319595008_n.png?_nc_cat=110&_nc_ad=z-m&_nc_cid=0&oh=6db9f0325092f746b9973ad98bc919f5&oe=5C208FAB",
						"buttons": 
						[
							{
								"type":"game_play",
								"title":"Play"
								/*
								"payload":"{<SERIALIZED_JSON_PAYLOAD>}",
								"game_metadata": { // Only one of the below
								"player_id": "<PLAYER_ID>",
								"context_id": "<CONTEXT_ID>"
								}
								*/
							}
						]
					}
				]
			}
		}
	}
	
	
	/*
	response = {
		"text": `Thanks for playing, if you come back tomorrow, we will give you a gift.`
	}
	*/
	
	
	// Send the message to acknowledge the postback
	callSendAPI(sender_psid, response);
	
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
	// Construct the message body
	let request_body = {
    "recipient": {
		"id": sender_psid
    },
		"message": response
	}
	
	// Send the HTTP request to the Messenger Platform
	request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": "EAAF0FIhhN7YBAF0RYmxxUslnpCCrjYY2z8Oq2qjgeCKtKo23mZAvifGwpWSRRK0RXWGuFYb0ZChoyfZABIizeGW3sHQZA9Ibr7dBj0ZBfJTHUCd0GkflrdxNGSyDZCHuKsZAkI3CVJRBFJ6vvMum3WhomShrXm9X3lPM1TgpwnAuyBuokbCYpNa" },
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if (!err) {
			console.log('message sent!')
		} else {
			console.error("Unable to send message:" + err);
		}
	}); 
}