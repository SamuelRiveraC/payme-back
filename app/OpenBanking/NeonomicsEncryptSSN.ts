import crypto from 'crypto'

export default async function NeonomicsEncryptSSN (SSN) {

	const iv = crypto.randomBytes(12);
	const key= Buffer.from(process.env.neonomics_raw_key, 'base64');
	const cipher = crypto.createCipheriv('aes-128-gcm', key, iv, { authTagLength:16 });
	const enc = Buffer.concat([cipher.update(SSN), cipher.final(), cipher.getAuthTag()]);

	return Buffer.concat([iv, enc]).toString('base64')
}