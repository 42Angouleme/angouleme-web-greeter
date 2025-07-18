import { LightDMMessageType, LightDMPromptType, lightdm } from 'nody-greeter-types/index';

export interface AuthenticatorEvents {
	/**
	 * This event gets called when the login process starts without error.
	 */
	authenticationStart: () => void;

	/**
	 * This event gets called when the login process completes without error.
	 */
	authenticationComplete: () => void;

	/**
	 * This event gets called when the login process fails due to an authentication failure (wrong username or password).
	 */
	authenticationFailure: () => void;

	/**
	 * This event gets called when LightDM wants to display an error message or when an error occurs in the Authenticator class.
	 * @param message The error message.
	 */
	errorMessage: (message: string) => void;

	/**
	 * This event gets called when LightDM wants to display an info message.
	 * @param message The info message.
	 */
	infoMessage: (message: string) => void;
}

export class Authenticator {
	private _authenticating: boolean = false;
	private _authenticated: boolean = false;

	private _authEvents: AuthenticatorEvents | null = null;

	private _username: string = "";
	private _password: string = "";
	private _session: string = "ubuntu"; // always start with ubuntu.desktop X11 session

	public static readonly MAX_LEN_USERNAME = 32;
	public static readonly MAX_LEN_PASSWORD = 128;

	// Validation patterns
	private static readonly USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;
	private static readonly FORBIDDEN_CHARS = /[\x00-\x1F\x7F]/g; // Control characters

	public constructor() {
		// Initialize LightDM event listeners
		this._initLightDMListeners();
	}

	private _initLightDMListeners(): void {
		// This event gets called when LightDM asks for more authentication data
		lightdm.show_prompt.connect((message: string, type: LightDMPromptType) => {
			try {
				switch (type) {
					case LightDMPromptType.Question: // Login (this should never happen as the username was provided by lightdm.authenticate before)
						console.log("LightDM requested username, responding...");
						lightdm.respond(this._username);
						break;
					case LightDMPromptType.Secret: // Password
						console.log("LightDM requested password, responding...");
						lightdm.respond(this._password);
						break;
					default:
						console.error(`Unknown lightDM prompt type: ${type}`);
						break;
				}
			}
			catch (err) {
				console.error(err);
				if (this._authEvents) {
					this._authEvents.errorMessage(String(err));
				}
			}
		});

		// This event gets called when LightDM wants to display a message in the greeter
		lightdm.show_message.connect((message: string, type: LightDMMessageType) => {
			try {
				switch (type) {
					case LightDMMessageType.Info:
						console.log(`LightDM info message: ${message}`);
						if (this._authEvents) {
							this._authEvents.infoMessage(message);
						}
						break;
					case LightDMMessageType.Error:
						console.error(`LightDM error message: ${message}`);
						if (this._authEvents) {
							this._authEvents.errorMessage(message);
						}
						break;
					default:
						console.warn(`Unknown lightDM message type: ${type}, message: ${message}`);
						break;
				}
			}
			catch (err) {
				console.error(err);
				if (this._authEvents) {
					this._authEvents.errorMessage(String(err));
				}
			}
		});

		// This event gets called when LightDM says the authentication was successful and a session should be started
		lightdm.authentication_complete.connect(() => {
			try {
				this._authenticating = false;
				console.log("LightDM authentication complete. Checking results...");
				if (lightdm.is_authenticated) {
					this._authenticated = true;
					console.log("LightDM authentication successful! Starting session...");
					if (this._authEvents) {
						this._authEvents.authenticationComplete();
					}
					lightdm.start_session(this._session ?? null);
				}
				else {
					console.log("LightDM authentication failed. User not found or password incorrect.");
					this._stopAuthentication();
					if (this._authEvents) {
						this._authEvents.authenticationFailure();
					}
				}
			}
			catch (err) {
				console.error(err);
				if (this._authEvents) {
					this._authEvents.errorMessage(String(err));
				}
			}
		});
	}

	/**
	 * Check if the authentication process has started.
	 * @returns True if the authentication process has started, false otherwise.
	 */
	public get authenticating(): boolean {
		return this._authenticating;
	}

	/**
	 * Check if the authentication process has completed.
	 * @returns True if the authentication process has completed, false otherwise.
	 */
	public get authenticated(): boolean {
		return this._authenticated;
	}

	/**
	 * Get the username that is currently being authenticated.
	 * @returns The username that is currently being authenticated.
	 */
	public get username(): string {
		return this._username;
	}

	/**
	 * Configure the callback functions that are called on certain events.
	 * @param authEvents The callback functions that are called on certain events.
	 * @returns void
	 */
	public set authEvents(authEvents: AuthenticatorEvents | null) {
		this._authEvents = authEvents;
	}

	/**
	 * Validate and sanitize username input
	 * @param username The username to validate
	 * @returns Sanitized username or empty string if invalid
	 */
	private _validateUsername(username: string): string {
		if (!username || typeof username !== 'string') {
			return '';
		}

		// Remove control characters and limit length
		let sanitized = username.replace(Authenticator.FORBIDDEN_CHARS, '').trim();
		sanitized = sanitized.substring(0, Authenticator.MAX_LEN_USERNAME);

		// Check against pattern (alphanumeric, dots, underscores, hyphens)
		if (!Authenticator.USERNAME_PATTERN.test(sanitized)) {
			console.warn('Username contains invalid characters');
			return '';
		}

		return sanitized;
	}

	/**
	 * Validate and sanitize password input
	 * @param password The password to validate
	 * @returns Sanitized password or empty string if invalid
	 */
	private _validatePassword(password: string): string {
		if (!password || typeof password !== 'string') {
			return '';
		}

		// Remove null bytes and other dangerous control characters but keep some like tabs
		let sanitized = password.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
		
		// Limit length but don't trim password as it could contain leading/trailing spaces
		sanitized = sanitized.substring(0, Authenticator.MAX_LEN_PASSWORD);

		return sanitized;
	}

	private _clearAuth(): void {
		this._username = "";
		this._password = "";
	}

	private _stopAuthentication(): void {
		lightdm.cancel_authentication();
		this._authenticating = false;
		this._authenticated = false;
		this._clearAuth();
	}

	private _startAuthentication(): void {
		try {
			console.log("Starting LightDM authentication...");
			lightdm.cancel_authentication();
			this._authenticating = true;
			lightdm.authenticate(this._username); // provide username to skip the username prompt
		}
		catch (err) {
			console.error(err);
			if (this._authEvents) {
				this._authEvents.errorMessage(String(err));
			}
		}
	}

	/**
	 * Start the login process. The authenticationStart auth event will be called when the login process starts without error.
	 * @param username The username to log in with.
	 * @param password The password to log in with.
	 * @returns void
	 */
	public login(username: string, password: string): void {
		// Validate and sanitize inputs
		const validatedUsername = this._validateUsername(username);
		const validatedPassword = this._validatePassword(password);

		if (!validatedUsername) {
			console.warn("Login() called with invalid username");
			if (this._authEvents) {
				this._authEvents.errorMessage("Invalid username format");
			}
			return;
		}

		if (!validatedPassword) {
			console.warn("Login() called with invalid password");
			if (this._authEvents) {
				this._authEvents.errorMessage("Invalid password format");
			}
			return;
		}

		this._username = validatedUsername;
		this._password = validatedPassword;

		if (this._authenticating || this._authenticated) {
			console.warn("Login() was called while already authenticating or authenticated. Stopping authentication.");
			return;
		}

		if (this._authEvents) {
			this._authEvents.authenticationStart();
		}
		this._startAuthentication();
	}
}
