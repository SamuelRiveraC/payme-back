/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by AdonisJs service providers for custom code.
|
*/

import 'reflect-metadata'
import sourceMapSupport from 'source-map-support'
import { Ignitor } from '@adonisjs/core/build/standalone'
import { createServer } from "https";
const fs = require('fs');

const privateKey = fs.readFileSync('key.pem');
const certificate = fs.readFileSync('cert.pem');
const credentials = {key: privateKey, cert: certificate};

sourceMapSupport.install({ handleUncaughtExceptions: false })
new Ignitor(__dirname)
	.httpServer()
	.start((handle) => {
		return createServer(credentials, handle );
	})
//fallback to http, but https works now it seems xd somewhat