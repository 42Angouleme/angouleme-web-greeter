import fs from 'fs';
import express from 'express';
import { ExamForHost, Exam42 } from './interfaces';
import ipRangeCheck from 'ip-range-check';
import dns from 'dns';
import { sanitizeHostname, sanitizeAndValidateIP, isValidHostname, sanitizeFilePath } from './validation';

export const EXAM_MODE_ENABLED = process.env.EXAM_MODE_ENABLED === 'true' || false;

export const parseIpRanges = function(ipRanges: string): string[] {
	return ipRanges.split(',').map((range) => range.trim()).filter((range) => range.length > 0);
}

export const ipToHostName = async function(ip: string): Promise<string | null> {
	// Validate and sanitize IP address
	const sanitizedIp = sanitizeAndValidateIP(ip);
	if (!sanitizedIp) {
		console.warn(`Invalid IP address provided to ipToHostName: ${ip}`);
		return null;
	}

	try {
		const result = await dns.promises.reverse(sanitizedIp);
		const hostname = result[0];
		
		// Validate the returned hostname
		if (!isValidHostname(hostname)) {
			console.warn(`DNS reverse lookup returned invalid hostname: ${hostname}`);
			return null;
		}
		
		return hostname;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const hostNameToIp = async function(hostName: string): Promise<string | null> {
	// Validate and sanitize hostname
	const sanitizedHostname = sanitizeHostname(hostName);
	if (!sanitizedHostname || sanitizedHostname === 'unknown') {
		console.warn(`Invalid hostname provided to hostNameToIp: ${hostName}`);
		return null;
	}

	try {
		const result = await dns.promises.lookup(sanitizedHostname);
		
		// Validate the returned IP address
		const sanitizedIp = sanitizeAndValidateIP(result.address);
		if (!sanitizedIp) {
			console.warn(`DNS lookup returned invalid IP: ${result.address}`);
			return null;
		}
		
		return sanitizedIp;
	}
	catch (err) {
		console.error(err);
		return null;
	}
}

export const getIpFromRequest = function(req: express.Request): string | null {
	let ip = null;
	if ('x-forwarded-for' in req.headers) {
		if (typeof req.headers['x-forwarded-for'] === 'string') {
			ip = req.headers['x-forwarded-for'].split(',')[0];
		}
		else if (Array.isArray(req.headers['x-forwarded-for'])) {
			ip = req.headers['x-forwarded-for'][0];
		}
	}
	else if ('remoteAddress' in req.socket) {
		ip = req.socket.remoteAddress;
	}
	
	// Validate and sanitize the IP address before returning
	if (ip) {
		const sanitizedIp = sanitizeAndValidateIP(ip.trim());
		return sanitizedIp;
	}
	
	return null;
}

export const getHostNameFromRequest = async function(req: express.Request): Promise<string> {
	let hostname = req.params.hostname ?? 'unknown';

	// Validate and sanitize hostname parameter
	if (hostname !== 'unknown') {
		hostname = sanitizeHostname(hostname);
	}

	// If hostname is not defined or invalid, parse it from the IP address
	if (hostname === 'unknown') {
		const ip = getIpFromRequest(req);
		if (ip) {
			const resolvedHostname = await ipToHostName(ip);
			if (resolvedHostname) {
				hostname = resolvedHostname;
			}
		}
	}

	return hostname;
};

export const getExamForHost = function(exams: Exam42[], hostIp: string): ExamForHost[] {
	if (!EXAM_MODE_ENABLED) {
		return [];
	}

	return exams.filter((exam) => examAvailableForHost(exam, hostIp))
		.map((exam) => ({
			id: exam.id,
			name: exam.name,
			begin_at: exam.begin_at,
			end_at: exam.end_at,
		}));
};

export const examAvailableForHost = function(exam: Exam42, hostIp: string): boolean {
	return exam.ip_range.some(ipRange => ipRangeCheck(hostIp, ipRange));
};

export const getCurrentExams = function(exams: Exam42[]): Exam42[] {
	const now = new Date();
	return exams.filter((exam) => exam.begin_at < now && exam.end_at > now);
};

export const getExamForHostName = async function(exams: Exam42[], hostName: string): Promise<ExamForHost[]> {
	// Validate hostname input
	const sanitizedHostname = sanitizeHostname(hostName);
	if (sanitizedHostname === 'unknown') {
		console.warn('Hostname is unknown or invalid, unable to find exams for host');
		return [];
	}
	
	const hostIp = await hostNameToIp(sanitizedHostname);
	if (!hostIp) {
		console.warn(`Could not parse IP address from hostname "${sanitizedHostname}", unable to find exams for host`);
		return [];
	}
	
	return getExamForHost(exams, hostIp);
};

export const getMessageForHostName = async function(hostName: string): Promise<string> {
	// Validate hostname input
	const sanitizedHostname = sanitizeHostname(hostName);
	if (sanitizedHostname === 'unknown') {
		console.warn('Hostname is unknown or invalid, unable to find messages for host');
		return "";
	}
	
	const hostIp = await hostNameToIp(sanitizedHostname);
	if (!hostIp) {
		console.warn(`Could not parse IP address from hostname "${sanitizedHostname}", unable to find messages for host`);
		return "";
	}

	try {
		// Validate file path to prevent path traversal
		const messagesFilePath = 'messages.json';
		const sanitizedFilePath = sanitizeFilePath(messagesFilePath);
		if (!sanitizedFilePath || sanitizedFilePath !== 'messages.json') {
			console.warn('Invalid file path for messages.json');
			return "";
		}

		// Read messages.json with proper error handling
		// TODO: implement caching for messages
		let messagesContent: string;
		try {
			messagesContent = fs.readFileSync(sanitizedFilePath, 'utf8');
		} catch (fileError) {
			console.warn('Could not read messages.json file:', fileError);
			return "";
		}

		let messagesJson: Record<string, unknown>;
		try {
			messagesJson = JSON.parse(messagesContent);
		} catch (parseError) {
			console.warn('Could not parse messages.json, invalid JSON format:', parseError);
			return "";
		}

		if (!messagesJson || typeof messagesJson !== 'object') {
			console.warn('messages.json does not contain valid object data');
			return "";
		}
	
		// Find messages for host with proper validation
		const hostMessages: string[] = [];
		for (const [key, message] of Object.entries(messagesJson)) {
			// Validate key and message
			if (typeof key !== 'string' || typeof message !== 'string') {
				console.warn(`Invalid message entry: key="${key}", message type="${typeof message}"`);
				continue;
			}

			// Sanitize the key to prevent injection
			const sanitizedKey = sanitizeHostname(key);
			if (sanitizedKey && sanitizedHostname.startsWith(sanitizedKey)) {
				// Sanitize message content but allow newlines and basic formatting
				const sanitizedMessage = message
					.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars except \n and \t
					.substring(0, 1000); // Limit message length
				
				if (sanitizedMessage.trim()) {
					hostMessages.push(sanitizedMessage);
				}
			}
		}
	
		// Combine all messages into one
		return hostMessages.join('\n\n');
	} catch (error) {
		console.error('Error in getMessageForHostName:', error);
		return "";
	}
}
