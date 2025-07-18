import { Request } from 'express';
import path from 'path';

// Regular expressions for validation
const HOSTNAME_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;
const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Input validation functions
export function isValidHostname(hostname: string): boolean {
  if (!hostname || typeof hostname !== 'string') {
    return false;
  }
  
  // Length checks
  if (hostname.length === 0 || hostname.length > 253) {
    return false;
  }
  
  // Check for special cases
  if (hostname === 'unknown' || hostname === 'localhost') {
    return true;
  }
  
  // Validate against regex
  return HOSTNAME_REGEX.test(hostname);
}

export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }
  
  // Length checks (reasonable limits for 42 login)
  if (username.length < 1 || username.length > 32) {
    return false;
  }
  
  return USERNAME_REGEX.test(username);
}

export function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  return IP_REGEX.test(ip);
}

export function sanitizeString(input: string, maxLength: number = 255): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters (except newlines and tabs for messages)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().substring(0, maxLength);
  
  return sanitized;
}

export function sanitizeHostname(hostname: string): string {
  if (!hostname || typeof hostname !== 'string') {
    return 'unknown';
  }
  
  // Basic sanitization
  const sanitized = hostname.toLowerCase()
    .replace(/[^a-z0-9.-]/g, '')
    .substring(0, 253);
  
  if (!isValidHostname(sanitized)) {
    return 'unknown';
  }
  
  return sanitized;
}

export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return '';
  }
  
  // Remove dangerous characters and limit length
  const sanitized = username.replace(/[^a-zA-Z0-9._-]/g, '')
    .substring(0, 32);
  
  if (!isValidUsername(sanitized)) {
    return '';
  }
  
  return sanitized;
}

export function sanitizeFilePath(filePath: string): string {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }
  
  // Normalize path and prevent path traversal
  const normalized = path.normalize(filePath);
  
  // Prevent access to parent directories
  if (normalized.includes('..') || normalized.startsWith('/')) {
    return '';
  }
  
  return normalized;
}

// Request validation middleware helpers
export function validateHostnameParam(req: Request): string {
  const hostname = req.params.hostname;
  if (!hostname) {
    return 'unknown';
  }
  
  return sanitizeHostname(hostname);
}

export function validateUsernameParam(req: Request): string | null {
  const username = req.params.login;
  if (!username) {
    return null;
  }
  
  const sanitized = sanitizeUsername(username);
  return sanitized || null;
}

// Enhanced IP validation with sanitization
export function sanitizeAndValidateIP(ip: string): string | null {
  if (!ip || typeof ip !== 'string') {
    return null;
  }
  
  // Remove extra whitespace and limit length
  const sanitized = ip.trim().substring(0, 45); // Max IPv6 length
  
  if (!isValidIP(sanitized)) {
    return null;
  }
  
  return sanitized;
}

// Validation error class
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
