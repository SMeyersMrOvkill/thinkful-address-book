require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { v4: uuid } = require('uuid');

const { NODE_ENV } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
	? 'tiny'
	: 'common';

app.use(morgan(morganOption))
app.use(express.json());
app.use(helmet())
app.use(cors())

let addresses = [
	{
		id: 'aaa-aaa-aaaa',
		firstName: 'Samuel',
		lastName: 'Meyers', 
		address1: '34477 w 135th st',
		address2: '',
		city: 'Olathe',
		state: 'KS',
		zip: 66061
	},
	{
		id: 'bbb-bbb-bbbb',
		firstName: 'Alexandra',
		lastName: 'Pelzer',
		address1: '418 Beverly st',
		address2: '',
		city: 'Excelsior Springs',
		state: 'MO',
		zip: 64024
	}
];

app.get('/address', (req, res) => {
	res.status(200).json(addresses);
})

app.post('/address', (req, res) => {
	const { firstName, lastName, address1, address2='', city, state, zip }  = req.body;
	if(!firstName) {
		return res.status(401)
			.send('firstName is required.');
	}
	if(!lastName) {
		return res.status(401)
			.send('lastName is required.');
	}
	if(!address1) {
		return res.status(401)
			.send('address1 is required.');
	}
	if(!city) {
		return res.status(401)
			.send('city is required.');
	}
	if(!state) {
		return res.status(401)
			.send('state is required.');
	}
	if(state.length !== 2) {
		return res.status(401)
			.send('state must be exactly 2 characters.')
	}
	if(!zip) {
		return res.status(401)
			.send('zip is required.');
	}
	if(parseInt(zip) < 10000) {
		return res.status(401)
			.send('zip must be a number with exactly 5 digits.');
	}
	let addr = {
		id: uuid(),
		firstName,
		lastName,
		address1,
		address2,
		city,
		state,
		zip: parseInt(zip)
	}

	addresses.push(addr);

	return res.status(201).json(addr);
});

app.delete('/address/:addressId', (req, res) => {
	const { addressId } = req.params;
	const index = addresses.findIndex(i => i.id === addressId);

	if(index === -1) {
		return res.status(404)
			.send(`No address found with id ${addressId}`);

	}

	addresses.splice(index, 1);

	res.status(204).end();
});

app.use(function errorHandler(error, req, res, next) {
	let response;
	if(NODE_ENV === 'production') {
		response = { error: { message: 'server error' } };
	} else {
		console.error(error);
		response = { message: error.message, error };
	}
	res.status(500).json(response); 
})

module.exports = app;
