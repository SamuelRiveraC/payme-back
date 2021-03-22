export default async function GetIp() {
	const ip = require('ip');
	return ip.address()
}


