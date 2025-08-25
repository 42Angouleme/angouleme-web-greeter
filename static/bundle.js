/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/nody-greeter-types/index.js":
/*!**************************************************!*\
  !*** ./node_modules/nody-greeter-types/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LightDMMessageType: () => (/* binding */ LightDMMessageType),
/* harmony export */   LightDMPromptType: () => (/* binding */ LightDMPromptType),
/* harmony export */   _ready_event: () => (/* binding */ _ready_event),
/* harmony export */   greeter_comm: () => (/* binding */ greeter_comm),
/* harmony export */   greeter_config: () => (/* binding */ greeter_config),
/* harmony export */   lightdm: () => (/* binding */ lightdm),
/* harmony export */   theme_utils: () => (/* binding */ theme_utils)
/* harmony export */ });
const lightdm = window.lightdm;
const greeter_config = window.greeter_config;
const theme_utils = window.theme_utils;
const greeter_comm = window.greeter_comm;
const _ready_event = window._ready_event;

const LightDMPromptType = {
    Question: 0,
    Secret: 1,
};
const LightDMMessageType = {
    Info: 0,
    Error: 1,
};


/***/ }),

/***/ "./client/auth.ts":
/*!************************!*\
  !*** ./client/auth.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Authenticator = void 0;
const index_1 = __webpack_require__(/*! nody-greeter-types/index */ "./node_modules/nody-greeter-types/index.js");
class Authenticator {
    constructor() {
        this._authenticating = false;
        this._authenticated = false;
        this._authEvents = null;
        this._username = "";
        this._password = "";
        this._session = "ubuntu";
        this._initLightDMListeners();
    }
    _initLightDMListeners() {
        index_1.lightdm.show_prompt.connect((message, type) => {
            try {
                switch (type) {
                    case index_1.LightDMPromptType.Question:
                        console.log("LightDM requested username, responding...");
                        index_1.lightdm.respond(this._username);
                        break;
                    case index_1.LightDMPromptType.Secret:
                        console.log("LightDM requested password, responding...");
                        index_1.lightdm.respond(this._password);
                        break;
                    default:
                        window.ui.setDebugInfo(`Unknown lightDM prompt type: ${type}`);
                        break;
                }
            }
            catch (err) {
                window.ui.setDebugInfo(String(err));
                if (this._authEvents) {
                    this._authEvents.errorMessage(String(err));
                }
            }
        });
        index_1.lightdm.show_message.connect((message, type) => {
            try {
                switch (type) {
                    case index_1.LightDMMessageType.Info:
                        console.log(`LightDM info message: ${message}`);
                        if (this._authEvents) {
                            this._authEvents.infoMessage(message);
                        }
                        break;
                    case index_1.LightDMMessageType.Error:
                        window.ui.setDebugInfo(`LightDM error message: ${message}`);
                        if (this._authEvents) {
                            this._authEvents.errorMessage(message);
                        }
                        break;
                    default:
                        window.ui.setDebugInfo(`Unknown lightDM message type: ${type}, message: ${message}`);
                        break;
                }
            }
            catch (err) {
                window.ui.setDebugInfo(String(err));
                if (this._authEvents) {
                    this._authEvents.errorMessage(String(err));
                }
            }
        });
        index_1.lightdm.authentication_complete.connect(() => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log("LightDM authentication complete. Checking results...");
                if (!index_1.lightdm.is_authenticated) {
                    this._authenticating = false;
                    console.log("LightDM authentication failed. User not found or password incorrect.");
                    this._stopAuthentication();
                    if (this._authEvents) {
                        this._authEvents.authenticationFailure();
                    }
                    return;
                }
                this._authenticated = true;
                this._authenticating = false;
                console.log("LightDM authentication successful! Starting session...");
                const eventResult = (this._authEvents) ? yield this._authEvents.authenticationComplete() : Promise.resolve(true);
                if (eventResult) {
                    index_1.lightdm.start_session((_a = this._session) !== null && _a !== void 0 ? _a : null);
                }
                else {
                    this._stopAuthentication();
                }
            }
            catch (err) {
                this._authenticating = false;
                window.ui.setDebugInfo(String(err));
                if (this._authEvents) {
                    this._authEvents.errorMessage(String(err));
                }
            }
        }));
    }
    get authenticating() {
        return this._authenticating;
    }
    get authenticated() {
        return this._authenticated;
    }
    get username() {
        return this._username;
    }
    set authEvents(authEvents) {
        this._authEvents = authEvents;
    }
    _validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return '';
        }
        let sanitized = username.replace(Authenticator.FORBIDDEN_CHARS, '').trim();
        sanitized = sanitized.substring(0, Authenticator.MAX_LEN_USERNAME);
        if (!Authenticator.USERNAME_PATTERN.test(sanitized)) {
            console.warn('Username contains invalid characters');
            return '';
        }
        return sanitized;
    }
    _validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return '';
        }
        let sanitized = password.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        sanitized = sanitized.substring(0, Authenticator.MAX_LEN_PASSWORD);
        return sanitized;
    }
    _clearAuth() {
        this._username = "";
        this._password = "";
    }
    _stopAuthentication() {
        index_1.lightdm.cancel_authentication();
        this._authenticating = false;
        this._authenticated = false;
        this._clearAuth();
    }
    _startAuthentication() {
        try {
            console.log("Starting LightDM authentication...");
            index_1.lightdm.cancel_authentication();
            this._authenticating = true;
            index_1.lightdm.authenticate(this._username);
        }
        catch (err) {
            window.ui.setDebugInfo(String(err));
            if (this._authEvents) {
                this._authEvents.errorMessage(String(err));
            }
        }
    }
    login(username, password) {
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
            window.ui.setDebugInfo("login() was called while already authenticating or authenticated");
            return;
        }
        if (this._username === "" || this._password === "") {
            window.ui.setDebugInfo("login() was called while username or password is empty");
            return;
        }
        if (this._authEvents) {
            this._authEvents.authenticationStart();
        }
        this._startAuthentication();
    }
}
exports.Authenticator = Authenticator;
Authenticator.MAX_LEN_USERNAME = 32;
Authenticator.MAX_LEN_PASSWORD = 128;
Authenticator.USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;
Authenticator.FORBIDDEN_CHARS = /[\x00-\x1F\x7F]/g;


/***/ }),

/***/ "./client/data.ts":
/*!************************!*\
  !*** ./client/data.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Data = exports.GreeterImage = void 0;
const package_json_1 = __importDefault(__webpack_require__(/*! ../package.json */ "./package.json"));
const PATH_DATA_JSON = 'data.json';
const PATH_LOGO = '/usr/share/codam/web-greeter/logo.png';
const PATH_WALLPAPER_LOGIN = '/usr/share/codam/web-greeter/login-screen.png';
const PATH_WALLPAPER_LOCK_USER = '/tmp/codam-web-greeter-user-wallpaper';
const PATH_USER_IMAGE = '/tmp/codam-web-greeter-user-avatar';
const PATH_USER_DEFAULT_IMAGE = '/usr/share/codam/web-greeter/user.png';
class GreeterImage {
    constructor(path) {
        this._exists = null;
        this._path = path;
    }
    exists() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._exists !== null) {
                return this._exists;
            }
            const dir = this._path.split('/').slice(0, -1).join('/');
            const self = this;
            return new Promise((resolve) => {
                var _a;
                (_a = window.theme_utils) === null || _a === void 0 ? void 0 : _a.dirlist(dir, false, (dirFiles) => {
                    self._exists = dirFiles !== undefined && dirFiles.includes(self._path);
                    resolve(self._exists);
                });
            });
        });
    }
    get path() {
        return this._path;
    }
}
exports.GreeterImage = GreeterImage;
class Data {
    constructor() {
        var _a;
        this._dataJsonFetchInterval = 60 * 1000;
        this._dataChangeListeners = [];
        this.pkgName = package_json_1.default.name;
        this.pkgVersion = package_json_1.default.version;
        this.hostname = ((_a = window.lightdm) === null || _a === void 0 ? void 0 : _a.hostname) || 'unknown-hostname';
        this.loginScreenWallpaper = new GreeterImage(PATH_WALLPAPER_LOGIN);
        this.userLockScreenWallpaper = new GreeterImage(PATH_WALLPAPER_LOCK_USER);
        this.logo = new GreeterImage(PATH_LOGO);
        this.userImage = new GreeterImage(PATH_USER_IMAGE);
        this.userDefaultImage = new GreeterImage(PATH_USER_DEFAULT_IMAGE);
        setInterval(() => this._refetchDataJson(), this._dataJsonFetchInterval);
        this._refetchDataJson();
    }
    static examToEvent(exam) {
        const desc = `For ${exam.projects.map(c => c.name).join(', ')}`;
        return {
            id: exam.id,
            name: exam.name,
            description: desc,
            location: exam.location,
            kind: 'exam',
            max_people: exam.max_people,
            nbr_subscribers: exam.nbr_subscribers,
            begin_at: exam.begin_at,
            end_at: exam.end_at,
            campus_ids: [],
            cursus_ids: exam.cursus.map(c => c.id),
            created_at: exam.created_at,
            updated_at: exam.updated_at,
        };
    }
    addDataChangeListener(listener) {
        this._dataChangeListeners.push(listener);
    }
    removeDataChangeListener(listener) {
        this._dataChangeListeners = this._dataChangeListeners.filter(l => l !== listener);
    }
    get dataJson() {
        return this._dataJson;
    }
    _refetchDataJson() {
        const req = new XMLHttpRequest();
        req.addEventListener('load', () => {
            try {
                const data = JSON.parse(req.responseText);
                console.log("Fetched data.json", data);
                if ("error" in data) {
                    window.ui.setDebugInfo(`data.json response contains an error: ${data.error}`);
                    return;
                }
                if (!("message" in data)) {
                    data.message = "";
                }
                this._dataJson = data;
                for (const listener of this._dataChangeListeners) {
                    listener(this._dataJson);
                }
            }
            catch (err) {
                window.ui.setDebugInfo(`Failed to parse data.json: ${err}`);
            }
        });
        req.addEventListener('error', (err) => {
            if (window.ui) {
                window.ui.setDebugInfo(`Error fetching data.json: ${err}`);
            }
        });
        req.open('GET', PATH_DATA_JSON);
        req.send();
    }
}
exports.Data = Data;


/***/ }),

/***/ "./client/idler.ts":
/*!*************************!*\
  !*** ./client/idler.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Idler = void 0;
class Idler {
    constructor(isLockScreen = false) {
        this._idle = false;
        this._lastActivity = Date.now();
        this._idleAfter = 300000;
        this._takeActionAfter = 3600000;
        this._isLockScreen = isLockScreen;
        window.addEventListener("keydown", this._unidle.bind(this));
        window.addEventListener("mousemove", this._unidle.bind(this));
        window.addEventListener("mousedown", this._unidle.bind(this));
        setInterval(this._checkIdle.bind(this), 1000);
    }
    get idleAfter() {
        return this._idleAfter;
    }
    get idle() {
        return this._idle;
    }
    _unidle() {
        this._lastActivity = Date.now();
        this._idle = false;
    }
    _action() {
    }
    _checkIfActionNeeded() {
        if (this._idle) {
            if (Date.now() - this._lastActivity >= this._takeActionAfter) {
                this._action();
                return true;
            }
        }
        return false;
    }
    _checkIdle() {
        if (this._idle) {
            this._checkIfActionNeeded();
            return true;
        }
        if (Date.now() - this._lastActivity >= this._idleAfter) {
            this._idle = true;
            console.log("Now idling...");
            this._checkIfActionNeeded();
            return true;
        }
        return false;
    }
}
exports.Idler = Idler;


/***/ }),

/***/ "./client/main.ts":
/*!************************!*\
  !*** ./client/main.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const data_1 = __webpack_require__(/*! ./data */ "./client/data.ts");
const ui_1 = __webpack_require__(/*! ./ui */ "./client/ui.ts");
const auth_1 = __webpack_require__(/*! ./auth */ "./client/auth.ts");
const idler_1 = __webpack_require__(/*! ./idler */ "./client/idler.ts");
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    });
}
window.sleep = sleep;
window.restartComputer = () => {
    var _a, _b;
    try {
        if (!((_a = window.lightdm) === null || _a === void 0 ? void 0 : _a.can_restart)) {
            window.ui.setDebugInfo("Rebooting failed: lightdm.can_restart is false");
            return false;
        }
        (_b = window.lightdm) === null || _b === void 0 ? void 0 : _b.restart();
        return true;
    }
    catch (err) {
        window.ui.setDebugInfo(`Rebooting failed: ${err}`);
        return false;
    }
};
window.brightness = {
    decrease: () => {
        var _a, _b;
        if (!((_a = window.lightdm) === null || _a === void 0 ? void 0 : _a.can_access_brightness)) {
            window.ui.setDebugInfo('Brightness control failed: lightdm.can_access_brightness is false');
            return;
        }
        (_b = window.lightdm) === null || _b === void 0 ? void 0 : _b.brightness_decrease(10);
    },
    increase: () => {
        var _a, _b;
        if (!((_a = window.lightdm) === null || _a === void 0 ? void 0 : _a.can_access_brightness)) {
            window.ui.setDebugInfo('Brightness control failed: lightdm.can_access_brightness is false');
            return;
        }
        (_b = window.lightdm) === null || _b === void 0 ? void 0 : _b.brightness_increase(10);
    }
};
function initGreeter() {
    return __awaiter(this, void 0, void 0, function* () {
        window.data = new data_1.Data();
        window.auth = new auth_1.Authenticator();
        window.ui = new ui_1.UI(window.data, window.auth);
        window.idler = new idler_1.Idler(window.ui.isLockScreen);
        window.debugKeys = false;
        document.addEventListener('keydown', (e) => {
            var _a, _b;
            const isPasswordInput = (((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.tagName) === 'INPUT' && ((_b = document.activeElement) === null || _b === void 0 ? void 0 : _b.getAttribute('type')) === 'password');
            if (window.debugKeys && !isPasswordInput) {
                window.ui.setDebugInfo(`Key pressed: ${e.code} (${e.key})${e.ctrlKey ? ' + Ctrl' : ''}${e.altKey ? ' + Alt' : ''}${e.shiftKey ? ' + Shift' : ''}${e.metaKey ? ' + Meta' : ''}`);
            }
            if (e.ctrlKey && e.altKey) {
                switch (e.key) {
                    case 'Delete':
                        window.ui.setDebugInfo('Reboot requested through LightDM');
                        window.restartComputer();
                        break;
                    case 'e':
                        window.ui.setDebugInfo('Exam mode override enabled');
                        window.ui.overrideExamMode();
                        break;
                    case 'd':
                        window.debugKeys = (window.debugKeys) ? false : true;
                        window.ui.setDebugInfo(`Debug keys: ${(window.debugKeys ? 'enabled' : 'disabled')}`);
                        return;
                    case 'z':
                        window.ui.setDebugInfo('Force zoom recalibration');
                        window.ui.forceZoomRecalibration();
                        break;
                }
            }
            else {
                switch (e.key) {
                    case 'BrightnessDown':
                    case 'F1':
                    case 'F14':
                        window.brightness.decrease();
                        break;
                    case 'BrightnessUp':
                    case 'F2':
                    case 'F15':
                        window.brightness.increase();
                        break;
                }
            }
        });
    });
}
function resetBrowserZoom() {
    try {
        if (window.ui) {
            window.ui.resetZoom();
        }
        else {
            document.body.style.zoom = "1";
            document.documentElement.style.setProperty('--zoom', "1");
            console.log('Zoom reset to default (1) - UI not available');
        }
    }
    catch (error) {
        console.error('Error resetting zoom:', error);
    }
}
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.ui) {
            resetBrowserZoom();
        }
    }, 100);
    setTimeout(() => {
        if (window.ui) {
            resetBrowserZoom();
        }
    }, 500);
    setTimeout(() => {
        if (window.ui) {
            resetBrowserZoom();
        }
    }, 1000);
});
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
        console.log('Zoom shortcut prevented:', e.key);
        return false;
    }
}, { capture: true });
document.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        console.log('Zoom wheel prevented');
        return false;
    }
}, { passive: false, capture: true });
window.addEventListener("GreeterReady", () => {
    initGreeter();
});


/***/ }),

/***/ "./client/ui.ts":
/*!**********************!*\
  !*** ./client/ui.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UI = void 0;
const infobars_1 = __webpack_require__(/*! ./uis/infobars */ "./client/uis/infobars.ts");
const lockscreen_1 = __webpack_require__(/*! ./uis/screens/lockscreen */ "./client/uis/screens/lockscreen.ts");
const loginscreen_1 = __webpack_require__(/*! ./uis/screens/loginscreen */ "./client/uis/screens/loginscreen.ts");
const nody_greeter_types_1 = __webpack_require__(/*! nody-greeter-types */ "./node_modules/nody-greeter-types/index.js");
const wallpaper_1 = __webpack_require__(/*! ./uis/wallpaper */ "./client/uis/wallpaper.ts");
const calendar_1 = __webpack_require__(/*! ./uis/calendar */ "./client/uis/calendar.ts");
const examscreen_1 = __webpack_require__(/*! ./uis/screens/examscreen */ "./client/uis/screens/examscreen.ts");
class UI {
    constructor(data, auth) {
        this._lockScreen = null;
        this._loginScreen = null;
        this._examModeScreen = null;
        this._isLockScreen = false;
        this._examModeDisabled = false;
        this._scalingFactor = 1;
        this._infoBars = new infobars_1.InfoBarsUI();
        this._logo = document.getElementById('logo');
        this._message = document.getElementById('message');
        this.forceResetZoom();
        this.applyHiDpiScaling();
        this._logo.src = data.logo.path;
        this._logo.addEventListener('error', () => {
            console.log(`Logo image not found at ${data.logo.path}`);
        });
        const activeSession = nody_greeter_types_1.lightdm.users.find((user) => user.logged_in);
        if (activeSession !== undefined) {
            this._lockScreen = new lockscreen_1.LockScreenUI(auth, activeSession);
            this._isLockScreen = true;
            this._logo.style.display = 'none';
            this._lockScreen.showForm();
        }
        else {
            this._loginScreen = new loginscreen_1.LoginScreenUI(auth);
            this._examModeScreen = new examscreen_1.ExamModeUI(auth, this._loginScreen);
            data.addDataChangeListener((data) => {
                this.checkForExamMode();
            });
            setInterval(() => {
                this.checkForExamMode();
            }, UI.EXAM_MODE_CHECK_INTERVAL);
            this.checkForExamMode();
        }
        data.addDataChangeListener((data) => {
            if (data !== undefined) {
                this.setMessage(data.message);
            }
        });
        if (data.dataJson !== undefined) {
            this.setMessage(data.dataJson.message);
        }
        this._wallpaper = new wallpaper_1.WallpaperUI(this._isLockScreen);
        this._calendar = new calendar_1.CalendarUI(data);
    }
    get isLockScreen() {
        return this._isLockScreen;
    }
    overrideExamMode() {
        this._examModeDisabled = true;
        this.checkForExamMode();
    }
    forceZoomRecalibration() {
        console.log('Force zoom recalibration requested');
        this.forceResetZoom();
        this.applyHiDpiScaling();
    }
    setDebugInfo(info) {
        console.log("Debug info:", info);
        this._infoBars.setDebugInfo(info);
    }
    setMessage(message) {
        message = message.replace(/(<([^>]+)>)/gi, "");
        message = message.replace(/\n/g, '<br>');
        message = message.replace(/\*(.*?)\*/g, '<b>$1</b>');
        message = message.replace(/_(.*?)_/g, '<i>$1</i>');
        message = message.replace(/  +/g, '&nbsp;&nbsp;');
        this._message.innerHTML = message;
    }
    getMessage() {
        return this._message.innerText;
    }
    checkForExamMode() {
        var _a, _b, _c, _d, _e, _f;
        if (this.isLockScreen) {
            return false;
        }
        if (window.data.dataJson === undefined) {
            (_a = this._examModeScreen) === null || _a === void 0 ? void 0 : _a.hideForm();
            (_b = this._loginScreen) === null || _b === void 0 ? void 0 : _b.showForm();
            return false;
        }
        const examsForHost = window.data.dataJson.exams_for_host;
        const ongoingExams = examsForHost.filter((exam) => {
            const now = new Date();
            const beginAt = new Date(exam.begin_at);
            const beginExamModeAt = new Date(beginAt.getTime() - UI.SHOW_EXAM_MODE_MINUTES_BEFORE_BEGIN * 60 * 1000);
            const endAt = new Date(exam.end_at);
            return now >= beginExamModeAt && now < endAt;
        });
        if (!this._examModeDisabled && ongoingExams.length > 0) {
            if (!((_c = this._examModeScreen) === null || _c === void 0 ? void 0 : _c.examMode) || !ongoingExams.some((exam) => { var _a; return (_a = this._examModeScreen) === null || _a === void 0 ? void 0 : _a.examIds.includes(exam.id); })) {
                console.log("Activating exam mode login UI");
                (_d = this._examModeScreen) === null || _d === void 0 ? void 0 : _d.enableExamMode(ongoingExams);
            }
            return true;
        }
        else {
            if ((_e = this._examModeScreen) === null || _e === void 0 ? void 0 : _e.examMode) {
                console.log('Deactivating exam mode login UI');
                (_f = this._examModeScreen) === null || _f === void 0 ? void 0 : _f.disableExamMode();
            }
            return false;
        }
    }
    static getPadding(element = document.body) {
        return getComputedStyle(element).getPropertyValue('--padding');
    }
    setPrimaryThemeColor(color) {
        const root = document.documentElement;
        if (color === null) {
            root.style.setProperty('--color-primary', 'var(--color-blue)');
        }
        else {
            root.style.setProperty('--color-primary', color);
        }
    }
    getPrimaryThemeColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
    }
    get scalingFactor() {
        return this._scalingFactor;
    }
    applyHiDpiScaling() {
        let pixelRatio = 1;
        if (window.outerWidth > 2560 || window.devicePixelRatio != 1) {
            pixelRatio = window.devicePixelRatio > 1 ? window.devicePixelRatio : 1.7;
        }
        this.resetZoom(pixelRatio);
    }
    resetZoom(scalingFactor = this._scalingFactor) {
        document.body.style.zoom = `${scalingFactor}`;
        const root = document.documentElement;
        root.style.setProperty('--zoom', `${scalingFactor}`);
        this._scalingFactor = scalingFactor;
        console.log(`Zoom reset to scaling factor: ${scalingFactor}`);
    }
    forceResetZoom() {
        document.body.style.zoom = "1";
        document.documentElement.style.zoom = "1";
        document.documentElement.style.setProperty('--zoom', "1");
        this._scalingFactor = 1;
        console.log('Zoom force reset to 1.0 (clearing any user zoom)');
    }
}
exports.UI = UI;
UI.EXAM_MODE_CHECK_INTERVAL = 5 * 1000;
UI.SHOW_EXAM_MODE_MINUTES_BEFORE_BEGIN = 20;


/***/ }),

/***/ "./client/uis/calendar.ts":
/*!********************************!*\
  !*** ./client/uis/calendar.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CalendarUI = void 0;
const data_1 = __webpack_require__(/*! ../data */ "./client/data.ts");
const ui_1 = __webpack_require__(/*! ../ui */ "./client/ui.ts");
class CalendarUI {
    constructor(dataHolder) {
        this._greyEvents = ["bocal q&a", "bocal stand-up", "open hour", "open hour with the student council"];
        this._calendar = document.getElementById('intra-calendar');
        this.populateCalendar();
        dataHolder.addDataChangeListener(this.populateCalendar.bind(this));
    }
    _estimateDuration(beginAt, endAt) {
        const duration = endAt.getTime() - beginAt.getTime();
        const days = Math.floor(duration / 1000 / 60 / 60 / 24);
        const hours = Math.floor(duration / 1000 / 60 / 60);
        const minutes = Math.floor(duration / 1000 / 60);
        if (days > 1) {
            return `${days} days`;
        }
        else if (hours > 0) {
            return `About ${hours} hour${hours === 1 ? '' : 's'}`;
        }
        else if (minutes > 0) {
            return `About ${minutes} minute${minutes === 1 ? '' : 's'}`;
        }
        return "";
    }
    _removeMarkdownSyntax(text) {
        text = text.replace(/\*\*(.*?)\*\*/g, '$1');
        text = text.replace(/\*(.*?)\*/g, '$1');
        text = text.replace(/\_(.*?)\_/g, '$1');
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
        return text;
    }
    _isGreyEvent(event) {
        return this._greyEvents.some(greyEvent => event.name.toLowerCase().includes(greyEvent));
    }
    _eventFitsOnScreen(eventElement = undefined) {
        const availableWindowHeight = window.innerHeight;
        const infoBarHeight = parseInt(getComputedStyle(this._calendar).getPropertyValue('--header-footer-height')) * window.ui.scalingFactor;
        const calendarHeight = this._calendar.clientHeight * window.ui.scalingFactor;
        const eventHeight = 78 * window.ui.scalingFactor;
        const eventMargin = parseInt(ui_1.UI.getPadding(this._calendar)) * window.ui.scalingFactor;
        const requiredSpace = eventHeight + eventMargin;
        const spaceLeft = availableWindowHeight - calendarHeight - (infoBarHeight * 2) - (eventMargin * 2);
        console.debug("Calculated if event fits on screen", "availableWindowHeight", availableWindowHeight, "calendarHeight", calendarHeight, "eventHeight", eventHeight, "eventMargin", eventMargin, "requiredSpace", requiredSpace, "spaceLeft", spaceLeft, "scalingFactor", window.ui.scalingFactor);
        return requiredSpace < spaceLeft;
    }
    populateCalendar(dataJSON = window.data.dataJson) {
        if (dataJSON === undefined) {
            this._destroyAllEvents();
            return;
        }
        const eventsForCalendar = [];
        for (const event of dataJSON.events) {
            eventsForCalendar.push(this._createEventElement(event));
        }
        for (const exam of dataJSON.exams) {
            const event = data_1.Data.examToEvent(exam);
            eventsForCalendar.push(this._createEventElement(event));
        }
        eventsForCalendar.sort((a, b) => {
            var _a, _b;
            return parseInt((_a = a.getAttribute("data-event-timestamp")) !== null && _a !== void 0 ? _a : "0") - parseInt((_b = b.getAttribute("data-event-timestamp")) !== null && _b !== void 0 ? _b : "0");
        });
        this._destroyAllEvents();
        for (const event of eventsForCalendar) {
            if (!this._eventFitsOnScreen(event)) {
                console.log("Event doesn't fit on screen");
                break;
            }
            this._calendar.appendChild(event);
        }
    }
    _destroyAllEvents() {
        const events = this._calendar.getElementsByClassName('calendar-event');
        while (events.length > 0) {
            events[0].remove();
        }
    }
    _createEventElement(event) {
        var _a;
        const beginDate = new Date(event.begin_at);
        const endDate = new Date(event.end_at);
        const calendarEvent = document.createElement('div');
        calendarEvent.classList.add('calendar-event');
        calendarEvent.setAttribute("data-event-kind", (this._isGreyEvent(event) ? "recurring" : event.kind));
        calendarEvent.setAttribute("data-event-id", event.id.toString());
        calendarEvent.setAttribute("data-event-timestamp", beginDate.getTime().toString());
        const calendarEventDate = document.createElement('div');
        calendarEventDate.classList.add('calendar-event-date');
        calendarEvent.appendChild(calendarEventDate);
        const calendarEventDateDay = document.createElement('span');
        calendarEventDateDay.classList.add('calendar-event-date-day');
        calendarEventDateDay.innerText = beginDate.toLocaleString('en-NL', { weekday: 'short' });
        calendarEventDate.appendChild(calendarEventDateDay);
        const calendarEventDateDate = document.createElement('span');
        calendarEventDateDate.classList.add('calendar-event-date-date');
        calendarEventDateDate.innerText = beginDate.toLocaleString('en-NL', { day: 'numeric' });
        calendarEventDate.appendChild(calendarEventDateDate);
        const calendarEventDateMonth = document.createElement('span');
        calendarEventDateMonth.classList.add('calendar-event-date-month');
        calendarEventDateMonth.innerText = beginDate.toLocaleString('en-NL', { month: 'short' });
        calendarEventDate.appendChild(calendarEventDateMonth);
        const calendarEventWrapper = document.createElement('div');
        calendarEventWrapper.classList.add('calendar-event-wrapper');
        calendarEvent.appendChild(calendarEventWrapper);
        const calendarEventTitle = document.createElement('div');
        calendarEventTitle.classList.add('calendar-event-title');
        calendarEventTitle.innerText = event.name;
        calendarEventWrapper.appendChild(calendarEventTitle);
        const calendarEventDesc = document.createElement('div');
        calendarEventDesc.classList.add('calendar-event-description');
        calendarEventDesc.innerText = this._removeMarkdownSyntax(event.description);
        calendarEventWrapper.appendChild(calendarEventDesc);
        const calendarEventDetails = document.createElement('div');
        calendarEventDetails.classList.add('calendar-event-details');
        calendarEventWrapper.appendChild(calendarEventDetails);
        const calendarEventTime = document.createElement('span');
        calendarEventTime.classList.add('calendar-event-time');
        calendarEventTime.innerText = beginDate.toLocaleString('en-NL', { timeStyle: 'short' });
        calendarEventDetails.appendChild(calendarEventTime);
        const calendarEventDuration = document.createElement('span');
        calendarEventDuration.classList.add('calendar-event-duration');
        calendarEventDuration.innerText = this._estimateDuration(beginDate, endDate);
        calendarEventDetails.appendChild(calendarEventDuration);
        const calendarEventSpots = document.createElement('span');
        calendarEventSpots.classList.add('calendar-event-spots');
        calendarEventSpots.innerText = (event.max_people ? `${event.nbr_subscribers} / ${event.max_people}` : '');
        calendarEventDetails.appendChild(calendarEventSpots);
        const calendarEventLocation = document.createElement('span');
        calendarEventLocation.classList.add('calendar-event-location');
        calendarEventLocation.innerText = (_a = event.location) !== null && _a !== void 0 ? _a : '';
        calendarEventDetails.appendChild(calendarEventLocation);
        this._addDialogToEvent(calendarEvent);
        return calendarEvent;
    }
    _addDialogToEvent(eventElement) {
        eventElement.addEventListener('click', () => {
            var _a;
            console.log("Clicked event", eventElement);
            const dialog = document.createElement('dialog');
            dialog.classList.add('calendar-event-dialog');
            dialog.setAttribute("data-event-kind", (_a = eventElement.getAttribute("data-event-kind")) !== null && _a !== void 0 ? _a : "event");
            const dialogCloseButton = document.createElement('button');
            dialogCloseButton.classList.add('dialog-close-button');
            dialogCloseButton.innerHTML = '&times;';
            dialog.appendChild(dialogCloseButton);
            const dialogContents = document.createElement('div');
            dialogContents.classList.add('event-dialog-contents');
            dialog.appendChild(dialogContents);
            for (const child of eventElement.children) {
                dialogContents.appendChild(child.cloneNode(true));
            }
            dialogContents.addEventListener('click', (ev) => {
                ev.stopPropagation();
            });
            dialog.addEventListener('click', (ev) => {
                dialog.close();
                dialog.remove();
            });
            document.body.appendChild(dialog);
            dialog.showModal();
        });
    }
    _addDialogToEvents() {
        const events = this._calendar.getElementsByClassName('calendar-event');
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            this._addDialogToEvent(event);
        }
    }
}
exports.CalendarUI = CalendarUI;


/***/ }),

/***/ "./client/uis/infobars.ts":
/*!********************************!*\
  !*** ./client/uis/infobars.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InfoBarsUI = void 0;
class InfoBarsUI {
    constructor() {
        this._infoElements = {
            hostname: document.getElementById('info-hostname'),
            version: document.getElementById('info-version'),
            clock: document.getElementById('info-clock'),
            date: document.getElementById('info-date'),
            networkIcon: document.getElementById('info-network-icon'),
            debug: document.getElementById('info-debug'),
        };
        this._populateInfoElements();
    }
    setDebugInfo(info) {
        this._infoElements.debug.innerText = info;
        console.debug("Changed text in debug info: ", info);
    }
    _populateInfoElements() {
        this._infoElements.debug.innerText = '';
        window.addEventListener('error', (event) => {
            this._infoElements.debug.innerText += event.error + '\n';
        });
        this._infoElements.version.innerText = window.data.pkgName + " v" + window.data.pkgVersion;
        this._infoElements.hostname.innerText = window.data.hostname;
        this._updateClock();
        setInterval(() => this._updateClock(), 1000);
        this._infoElements.networkIcon.classList.toggle("offline", !navigator.onLine);
        window.addEventListener("online", () => this._infoElements.networkIcon.classList.remove("offline"));
        window.addEventListener("offline", () => this._infoElements.networkIcon.classList.add("offline"));
    }
    _updateClock() {
        const now = new Date();
        this._infoElements.date.innerText = now.toLocaleString('en-NL', { dateStyle: 'medium' });
        this._infoElements.clock.innerText = now.toLocaleString('en-NL', { timeStyle: 'medium' });
    }
}
exports.InfoBarsUI = InfoBarsUI;


/***/ }),

/***/ "./client/uis/screen.ts":
/*!******************************!*\
  !*** ./client/uis/screen.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UIScreen = void 0;
class UIScreen {
    constructor(auth) {
        this._formShown = false;
        this._auth = auth;
    }
    ;
    _connectEvents() {
        this._auth.authEvents = this._events;
    }
    _disconnectEvents() {
        this._auth.authEvents = null;
    }
    showForm() {
        if (!this._formShown) {
            this._formShown = true;
            this._form.form.style.display = "block";
            const inputToFocusOn = this._getInputToFocusOn();
            if (inputToFocusOn !== null) {
                inputToFocusOn.focus();
            }
            this._connectEvents();
        }
    }
    hideForm() {
        if (this._formShown) {
            this._formShown = false;
            this._form.form.style.display = "none";
            this._disconnectEvents();
        }
    }
    get formShown() {
        return this._formShown;
    }
    _disableForm() {
        for (const element of Object.values(this._form)) {
            if ("disabled" in element && typeof element.disabled === "boolean") {
                element.disabled = true;
            }
        }
        if (document.activeElement) {
            document.activeElement.blur();
        }
    }
    _enableForm(focusElement = null) {
        for (const element of Object.values(this._form)) {
            if ("disabled" in element && typeof element.disabled === "boolean") {
                element.disabled = false;
            }
        }
        if (focusElement !== null) {
            focusElement.focus();
        }
    }
}
exports.UIScreen = UIScreen;


/***/ }),

/***/ "./client/uis/screens/examscreen.ts":
/*!******************************************!*\
  !*** ./client/uis/screens/examscreen.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExamModeUI = void 0;
const screen_1 = __webpack_require__(/*! ../screen */ "./client/uis/screen.ts");
class ExamModeUI extends screen_1.UIScreen {
    constructor(auth, loginUI) {
        super(auth);
        this._examMode = false;
        this._examIds = [];
        this._examStartButtonEnableInterval = null;
        this._examStartTime = new Date("2099-01-01T00:00:00Z");
        this._events = {
            authenticationStart: () => {
                this._disableForm();
            },
            authenticationComplete: () => __awaiter(this, void 0, void 0, function* () {
                return true;
            }),
            authenticationFailure: () => {
                this._enableForm();
                this._wigglePasswordInput();
            },
            errorMessage: (message) => {
                alert(message);
                window.ui.setDebugInfo(message);
            },
            infoMessage: (message) => {
                alert(message);
            },
        };
        this._loginScreen = loginUI;
        this._form = {
            form: document.getElementById('exam-form'),
            examProjectsText: document.getElementById('exam-mode-projects'),
            examStartText: document.getElementById('exam-mode-start'),
            examEndText: document.getElementById('exam-mode-end'),
            examStartButton: document.getElementById('exam-mode-start-button'),
            examStartTimer: document.getElementById('exam-mode-start-timer'),
        };
        this._initForm();
    }
    enableExamMode(exams) {
        if (exams.length === 0) {
            return;
        }
        this._examMode = true;
        this._examIds = exams.map((exam) => exam.id);
        this._populateData(exams);
        this._loginScreen.hideForm();
        this.showForm();
    }
    disableExamMode() {
        this._examMode = false;
        this._examIds = [];
        this._populateData([]);
        this.hideForm();
        this._loginScreen.showForm();
    }
    get examMode() {
        return this._examMode;
    }
    get examIds() {
        return this._examIds;
    }
    _initForm() {
        const form = this._form;
        form.examStartButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (this._examMode) {
                this._auth.login(ExamModeUI.EXAM_USERNAME, ExamModeUI.EXAM_PASSWORD);
            }
        });
    }
    _clearExamStartTimer() {
        const form = this._form;
        if (this._examStartButtonEnableInterval) {
            clearTimeout(this._examStartButtonEnableInterval);
            this._examStartButtonEnableInterval = null;
        }
        form.examStartTimer.innerText = "Click the arrow below to start your exam.";
        this._enableOrDisableSubmitButton();
    }
    _populateData(examsToPopulate) {
        var _a;
        const form = this._form;
        if (examsToPopulate.length === 0) {
            form.examProjectsText.innerText = '';
            form.examStartText.innerText = 'unknown';
            form.examEndText.innerText = 'unknown';
            this._examStartTime = new Date("2099-01-01T00:00:00Z");
            this._clearExamStartTimer();
        }
        else {
            const exams = (_a = window.data.dataJson) === null || _a === void 0 ? void 0 : _a.exams.filter((exam) => examsToPopulate.some((examToPopulate) => exam.id === examToPopulate.id));
            if (exams === undefined) {
                window.ui.setDebugInfo('Failed to find exams in data.json');
                return;
            }
            const earliestExam = exams.reduce((earliest, exam) => {
                const beginAt = new Date(exam.begin_at);
                if (earliest === null || beginAt < earliest) {
                    return beginAt;
                }
                return earliest;
            }, new Date(exams[0].begin_at));
            const latestExam = exams.reduce((latest, exam) => {
                const endAt = new Date(exam.end_at);
                if (latest === null || endAt > latest) {
                    return endAt;
                }
                return latest;
            }, new Date(exams[0].end_at));
            const projectsText = exams.flatMap((exam) => exam.projects.map((project) => project.name)).join(', ');
            form.examProjectsText.innerText = projectsText;
            form.examStartText.innerText = earliestExam.toLocaleTimeString("en-NL", { hour: '2-digit', minute: '2-digit' });
            form.examEndText.innerText = latestExam.toLocaleTimeString("en-NL", { hour: '2-digit', minute: '2-digit' });
            this._clearExamStartTimer();
            this._examStartTime = earliestExam;
            this._enableOrDisableSubmitButton();
            if (this._examStartTime.getTime() > Date.now()) {
                this._examStartButtonEnableInterval = setInterval(() => {
                    const timeLeft = Math.floor((this._examStartTime.getTime() - Date.now()) / 1000);
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    const formattedTime = `${(minutes > 0 ? `${minutes} minutes and ` : '')} ${seconds} seconds`;
                    form.examStartTimer.innerText = `You may start your exam in ${formattedTime}.`;
                    if (this._examStartTime.getTime() <= Date.now()) {
                        this._clearExamStartTimer();
                        return;
                    }
                }, 1000);
            }
        }
    }
    _enableOrDisableSubmitButton() {
        const form = this._form;
        const buttonDisabled = this._examStartTime.getTime() > Date.now();
        form.examStartButton.disabled = buttonDisabled;
        if (!buttonDisabled) {
            form.examStartTimer.innerText = "Click the arrow below to start your exam.";
            const focusInput = this._getInputToFocusOn();
            if (focusInput) {
                focusInput.focus();
            }
        }
        return buttonDisabled;
    }
    _wigglePasswordInput(clearInput = true) {
        window.ui.setDebugInfo(`Failed to login with username "${ExamModeUI.EXAM_USERNAME}" and password "${ExamModeUI.EXAM_PASSWORD}" to start an exam session`);
    }
    _getInputToFocusOn() {
        return null;
    }
}
exports.ExamModeUI = ExamModeUI;
ExamModeUI.EXAM_USERNAME = 'exam';
ExamModeUI.EXAM_PASSWORD = 'exam';


/***/ }),

/***/ "./client/uis/screens/lockscreen.ts":
/*!******************************************!*\
  !*** ./client/uis/screens/lockscreen.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LockScreenUI = void 0;
const screen_1 = __webpack_require__(/*! ../screen */ "./client/uis/screen.ts");
const ui_1 = __webpack_require__(/*! ../../ui */ "./client/ui.ts");
const PATH_LOCK_TIMESTAMP_PREFIX = '/tmp/codam_web_greeter_lock_timestamp';
class LockScreenUI extends screen_1.UIScreen {
    constructor(auth, activeSession) {
        super(auth);
        this._isExamMode = false;
        this._lockedTime = null;
        this._events = {
            authenticationStart: () => {
                this._disableForm();
            },
            authenticationComplete: () => __awaiter(this, void 0, void 0, function* () {
                return true;
            }),
            authenticationFailure: () => {
                this._enableForm();
                this._wigglePasswordInput();
            },
            errorMessage: (message) => {
                alert(message);
                window.ui.setDebugInfo(message);
            },
            infoMessage: (message) => {
                alert(message);
            },
        };
        this._activeSession = activeSession;
        this._form = {
            form: document.getElementById('lock-form'),
            avatar: document.getElementById('active-user-session-avatar'),
            displayName: document.getElementById('active-user-session-display-name'),
            loginName: document.getElementById('active-user-session-login-name'),
            lockedTimeAgo: document.getElementById('active-user-session-locked-ago'),
            passwordInput: document.getElementById('active-user-session-password'),
            unlockButton: document.getElementById('unlock-button'),
        };
        this._initForm();
        setInterval(this._getAndSetLockedTimestamp.bind(this), 60000);
        this._getAndSetLockedTimestamp();
    }
    _initForm() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const form = this._form;
            if (this._activeSession.username === "exam") {
                this._isExamMode = true;
                form.avatar.style.display = "none";
                form.displayName.innerText = "Exam in progress";
                form.loginName.innerText = "Click the arrow below to resume your exam.";
                form.loginName.style.marginTop = ui_1.UI.getPadding();
                form.passwordInput.value = "exam";
                form.passwordInput.style.display = "none";
                this._enableOrDisableSubmitButton();
            }
            else {
                form.avatar.addEventListener('error', () => {
                    form.avatar.src = "assets/default-user.png";
                });
                if (yield window.data.userImage.exists) {
                    form.avatar.src = window.data.userImage.path;
                }
                else if (this._activeSession.image) {
                    form.avatar.src = this._activeSession.image;
                }
                else if (yield window.data.userDefaultImage.exists) {
                    form.avatar.src = window.data.userDefaultImage.path;
                }
                form.displayName.innerText = (_a = this._activeSession.display_name) !== null && _a !== void 0 ? _a : this._activeSession.username;
                form.loginName.innerText = this._activeSession.username;
            }
            setInterval(this._lockedTimer.bind(this), 10000);
            form.form.addEventListener('submit', (event) => {
                event.preventDefault();
                this._auth.login(this._activeSession.username, form.passwordInput.value);
            });
            form.passwordInput.addEventListener('input', () => {
                this._enableOrDisableSubmitButton();
            });
        });
    }
    _enableOrDisableSubmitButton() {
        const form = this._form;
        const buttonDisabled = form.passwordInput.value === "" && this._isExamMode === false;
        form.unlockButton.disabled = buttonDisabled;
        return buttonDisabled;
    }
    _wigglePasswordInput(clearInput = true) {
        const passwordInput = this._form.passwordInput;
        passwordInput.classList.add('wiggle');
        passwordInput.addEventListener('keydown', () => {
            passwordInput.classList.remove('wiggle');
        }, { once: true });
        if (clearInput) {
            passwordInput.value = "";
            passwordInput.focus();
            this._enableOrDisableSubmitButton();
        }
    }
    _getInputToFocusOn() {
        return this._form.passwordInput;
    }
    get lockedTime() {
        return this._lockedTime;
    }
    _getScreenLockedTimestamp(login) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.addEventListener('load', () => {
                try {
                    const timestamp = req.responseText.split(' ')[0];
                    if (timestamp) {
                        resolve(new Date(parseInt(timestamp) * 1000));
                    }
                    else {
                        reject(new Error("No timestamp found in response"));
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
            req.addEventListener('error', (err) => {
                reject(err);
            });
            req.open('GET', `${PATH_LOCK_TIMESTAMP_PREFIX}_${login}`);
            req.send();
        });
    }
    _getAndSetLockedTimestamp() {
        this._getScreenLockedTimestamp(this._activeSession.username)
            .then((timestamp) => {
            this._lockedTime = timestamp;
            this._lockedTimer();
        })
            .catch(() => {
            this._lockedTime = null;
        });
    }
    _lockedTimer() {
        if (!this._lockedTime) {
            return;
        }
        const logoutAfter = 60;
        const lockedMinutesAgo = (Date.now() - this._lockedTime.getTime()) / 1000 / 60;
        const timeRemaining = logoutAfter - lockedMinutesAgo;
        if (timeRemaining <= 0.25) {
            this._disableForm();
            this._form.lockedTimeAgo.innerText = "Automated logout in progress...";
            if (timeRemaining < -5) {
                window.ui.setDebugInfo("Automated logout appears to take a while. Is the systemd idling service from codam-web-greeter installed and enabled?");
                this._enableForm();
            }
        }
        else {
            const flooredTime = Math.floor(timeRemaining);
            this._form.lockedTimeAgo.innerText = "Automated logout occurs in " + flooredTime.toString() + " minute" + (flooredTime === 1 ? "" : "s");
        }
    }
}
exports.LockScreenUI = LockScreenUI;


/***/ }),

/***/ "./client/uis/screens/loginscreen.ts":
/*!*******************************************!*\
  !*** ./client/uis/screens/loginscreen.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginScreenUI = void 0;
const screen_1 = __webpack_require__(/*! ../screen */ "./client/uis/screen.ts");
class LoginScreenUI extends screen_1.UIScreen {
    constructor(auth) {
        super(auth);
        this._events = {
            authenticationStart: () => {
                this._disableForm();
            },
            authenticationComplete: () => __awaiter(this, void 0, void 0, function* () {
                return true;
            }),
            authenticationFailure: () => {
                this._enableForm();
                this._wigglePasswordInput();
            },
            errorMessage: (message) => {
                alert(message);
                window.ui.setDebugInfo(message);
            },
            infoMessage: (message) => {
                alert(message);
            },
        };
        this._form = {
            form: document.getElementById('login-form'),
            loginInput: document.getElementById('login'),
            passwordInput: document.getElementById('password'),
            loginButton: document.getElementById('login-button'),
        };
        this._initForm();
    }
    _initForm() {
        const form = this._form;
        this._form.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this._auth.login(form.loginInput.value, form.passwordInput.value);
        });
        form.loginInput.addEventListener('input', () => {
            this._enableOrDisableSubmitButton();
        });
        form.passwordInput.addEventListener('input', () => {
            this._enableOrDisableSubmitButton();
        });
    }
    _enableOrDisableSubmitButton() {
        const form = this._form;
        const buttonDisabled = form.loginInput.value.trim() === "" || form.passwordInput.value === "";
        form.loginButton.disabled = buttonDisabled;
        return buttonDisabled;
    }
    _wigglePasswordInput(clearInput = true) {
        const passwordInput = this._form.passwordInput;
        passwordInput.classList.add('wiggle');
        passwordInput.addEventListener('keydown', () => {
            passwordInput.classList.remove('wiggle');
        }, { once: true });
        if (clearInput) {
            passwordInput.value = "";
            passwordInput.focus();
            this._enableOrDisableSubmitButton();
        }
    }
    _getInputToFocusOn() {
        const form = this._form;
        if (form.loginInput.value.trim() === "") {
            return form.loginInput;
        }
        return form.passwordInput;
    }
}
exports.LoginScreenUI = LoginScreenUI;


/***/ }),

/***/ "./client/uis/wallpaper.ts":
/*!*********************************!*\
  !*** ./client/uis/wallpaper.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WallpaperUI = void 0;
class WallpaperUI {
    constructor(isLockScreen, wallpaperElement = null) {
        this._element = wallpaperElement !== null && wallpaperElement !== void 0 ? wallpaperElement : document.body;
        this._blurFilter = document.getElementById('blur-filter');
        this._isLockScreen = isLockScreen;
        this.displayWallpaper();
    }
    displayWallpaper() {
        return __awaiter(this, void 0, void 0, function* () {
            let wallpaper = window.data.loginScreenWallpaper;
            if (this._isLockScreen) {
                this._blurFilter.style.display = 'block';
                if (yield window.data.userLockScreenWallpaper.exists) {
                    wallpaper = window.data.userLockScreenWallpaper;
                }
            }
            if (yield wallpaper.exists) {
                this._element.style.backgroundImage = 'url("' + wallpaper.path + '")';
            }
            else {
                this._element.style.backgroundImage = window.getComputedStyle(this._element).getPropertyValue('--default-bg-img');
            }
            return true;
        });
    }
}
exports.WallpaperUI = WallpaperUI;


/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"name":"codam-web-greeter","version":"1.3.5","description":"LightDM greeter theme for Codam Coding College, compatible with nody-greeter and web-greeter","main":"main.js","scripts":{"build":"tsc","bundle":"webpack --mode=production","bundle-dev":"webpack --mode=development","test":"echo \\"Error: no test specified\\" && exit 1"},"repository":{"type":"git","url":"git+https://github.com/codam-coding-college/codam-web-greeter.git"},"keywords":["codam","42born2code","lightdm","nody-greeter-theme","web-greeter-theme","lightdm-greeter"],"author":"Codam Coding College","license":"MIT","bugs":{"url":"https://github.com/codam-coding-college/codam-web-greeter/issues"},"homepage":"https://github.com/codam-coding-college/codam-web-greeter#readme","devDependencies":{"nody-greeter-types":"^1.1.0","ts-loader":"^9.5.0","typescript":"^4.9.5","webpack":"^5.94.0","webpack-cli":"^5.1.4"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./client/main.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQSxtQkFBbUI7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDdENuQjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7VUVOQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2NvZGFtLXdlYi1ncmVldGVyLy4vbm9kZV9tb2R1bGVzL25vZHktZ3JlZXRlci10eXBlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9jb2RhbS13ZWItZ3JlZXRlci8uL2NsaWVudC9hdXRoLnRzIiwid2VicGFjazovL2NvZGFtLXdlYi1ncmVldGVyLy4vY2xpZW50L2RhdGEudHMiLCJ3ZWJwYWNrOi8vY29kYW0td2ViLWdyZWV0ZXIvLi9jbGllbnQvaWRsZXIudHMiLCJ3ZWJwYWNrOi8vY29kYW0td2ViLWdyZWV0ZXIvLi9jbGllbnQvbWFpbi50cyIsIndlYnBhY2s6Ly9jb2RhbS13ZWItZ3JlZXRlci8uL2NsaWVudC91aS50cyIsIndlYnBhY2s6Ly9jb2RhbS13ZWItZ3JlZXRlci8uL2NsaWVudC91aXMvY2FsZW5kYXIudHMiLCJ3ZWJwYWNrOi8vY29kYW0td2ViLWdyZWV0ZXIvLi9jbGllbnQvdWlzL2luZm9iYXJzLnRzIiwid2VicGFjazovL2NvZGFtLXdlYi1ncmVldGVyLy4vY2xpZW50L3Vpcy9zY3JlZW4udHMiLCJ3ZWJwYWNrOi8vY29kYW0td2ViLWdyZWV0ZXIvLi9jbGllbnQvdWlzL3NjcmVlbnMvZXhhbXNjcmVlbi50cyIsIndlYnBhY2s6Ly9jb2RhbS13ZWItZ3JlZXRlci8uL2NsaWVudC91aXMvc2NyZWVucy9sb2Nrc2NyZWVuLnRzIiwid2VicGFjazovL2NvZGFtLXdlYi1ncmVldGVyLy4vY2xpZW50L3Vpcy9zY3JlZW5zL2xvZ2luc2NyZWVuLnRzIiwid2VicGFjazovL2NvZGFtLXdlYi1ncmVldGVyLy4vY2xpZW50L3Vpcy93YWxscGFwZXIudHMiLCJ3ZWJwYWNrOi8vY29kYW0td2ViLWdyZWV0ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY29kYW0td2ViLWdyZWV0ZXIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NvZGFtLXdlYi1ncmVldGVyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY29kYW0td2ViLWdyZWV0ZXIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jb2RhbS13ZWItZ3JlZXRlci93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2NvZGFtLXdlYi1ncmVldGVyL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9jb2RhbS13ZWItZ3JlZXRlci93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGxpZ2h0ZG0gPSB3aW5kb3cubGlnaHRkbTtcbmV4cG9ydCBjb25zdCBncmVldGVyX2NvbmZpZyA9IHdpbmRvdy5ncmVldGVyX2NvbmZpZztcbmV4cG9ydCBjb25zdCB0aGVtZV91dGlscyA9IHdpbmRvdy50aGVtZV91dGlscztcbmV4cG9ydCBjb25zdCBncmVldGVyX2NvbW0gPSB3aW5kb3cuZ3JlZXRlcl9jb21tO1xuZXhwb3J0IGNvbnN0IF9yZWFkeV9ldmVudCA9IHdpbmRvdy5fcmVhZHlfZXZlbnQ7XG5cbmV4cG9ydCBjb25zdCBMaWdodERNUHJvbXB0VHlwZSA9IHtcbiAgICBRdWVzdGlvbjogMCxcbiAgICBTZWNyZXQ6IDEsXG59O1xuZXhwb3J0IGNvbnN0IExpZ2h0RE1NZXNzYWdlVHlwZSA9IHtcbiAgICBJbmZvOiAwLFxuICAgIEVycm9yOiAxLFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkF1dGhlbnRpY2F0b3IgPSB2b2lkIDA7XG5jb25zdCBpbmRleF8xID0gcmVxdWlyZShcIm5vZHktZ3JlZXRlci10eXBlcy9pbmRleFwiKTtcbmNsYXNzIEF1dGhlbnRpY2F0b3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9hdXRoZW50aWNhdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9hdXRoZW50aWNhdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2F1dGhFdmVudHMgPSBudWxsO1xuICAgICAgICB0aGlzLl91c2VybmFtZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuX3Bhc3N3b3JkID0gXCJcIjtcbiAgICAgICAgdGhpcy5fc2Vzc2lvbiA9IFwidWJ1bnR1XCI7XG4gICAgICAgIHRoaXMuX2luaXRMaWdodERNTGlzdGVuZXJzKCk7XG4gICAgfVxuICAgIF9pbml0TGlnaHRETUxpc3RlbmVycygpIHtcbiAgICAgICAgaW5kZXhfMS5saWdodGRtLnNob3dfcHJvbXB0LmNvbm5lY3QoKG1lc3NhZ2UsIHR5cGUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgaW5kZXhfMS5MaWdodERNUHJvbXB0VHlwZS5RdWVzdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTGlnaHRETSByZXF1ZXN0ZWQgdXNlcm5hbWUsIHJlc3BvbmRpbmcuLi5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleF8xLmxpZ2h0ZG0ucmVzcG9uZCh0aGlzLl91c2VybmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBpbmRleF8xLkxpZ2h0RE1Qcm9tcHRUeXBlLlNlY3JldDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTGlnaHRETSByZXF1ZXN0ZWQgcGFzc3dvcmQsIHJlc3BvbmRpbmcuLi5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleF8xLmxpZ2h0ZG0ucmVzcG9uZCh0aGlzLl9wYXNzd29yZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8oYFVua25vd24gbGlnaHRETSBwcm9tcHQgdHlwZTogJHt0eXBlfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8oU3RyaW5nKGVycikpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9hdXRoRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2F1dGhFdmVudHMuZXJyb3JNZXNzYWdlKFN0cmluZyhlcnIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpbmRleF8xLmxpZ2h0ZG0uc2hvd19tZXNzYWdlLmNvbm5lY3QoKG1lc3NhZ2UsIHR5cGUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgaW5kZXhfMS5MaWdodERNTWVzc2FnZVR5cGUuSW5mbzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMaWdodERNIGluZm8gbWVzc2FnZTogJHttZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2F1dGhFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdXRoRXZlbnRzLmluZm9NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgaW5kZXhfMS5MaWdodERNTWVzc2FnZVR5cGUuRXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cudWkuc2V0RGVidWdJbmZvKGBMaWdodERNIGVycm9yIG1lc3NhZ2U6ICR7bWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9hdXRoRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXV0aEV2ZW50cy5lcnJvck1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8oYFVua25vd24gbGlnaHRETSBtZXNzYWdlIHR5cGU6ICR7dHlwZX0sIG1lc3NhZ2U6ICR7bWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cudWkuc2V0RGVidWdJbmZvKFN0cmluZyhlcnIpKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fYXV0aEV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdXRoRXZlbnRzLmVycm9yTWVzc2FnZShTdHJpbmcoZXJyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaW5kZXhfMS5saWdodGRtLmF1dGhlbnRpY2F0aW9uX2NvbXBsZXRlLmNvbm5lY3QoKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxpZ2h0RE0gYXV0aGVudGljYXRpb24gY29tcGxldGUuIENoZWNraW5nIHJlc3VsdHMuLi5cIik7XG4gICAgICAgICAgICAgICAgaWYgKCFpbmRleF8xLmxpZ2h0ZG0uaXNfYXV0aGVudGljYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdXRoZW50aWNhdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxpZ2h0RE0gYXV0aGVudGljYXRpb24gZmFpbGVkLiBVc2VyIG5vdCBmb3VuZCBvciBwYXNzd29yZCBpbmNvcnJlY3QuXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdG9wQXV0aGVudGljYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2F1dGhFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2F1dGhFdmVudHMuYXV0aGVudGljYXRpb25GYWlsdXJlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9hdXRoZW50aWNhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hdXRoZW50aWNhdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTGlnaHRETSBhdXRoZW50aWNhdGlvbiBzdWNjZXNzZnVsISBTdGFydGluZyBzZXNzaW9uLi4uXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50UmVzdWx0ID0gKHRoaXMuX2F1dGhFdmVudHMpID8geWllbGQgdGhpcy5fYXV0aEV2ZW50cy5hdXRoZW50aWNhdGlvbkNvbXBsZXRlKCkgOiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50UmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4XzEubGlnaHRkbS5zdGFydF9zZXNzaW9uKChfYSA9IHRoaXMuX3Nlc3Npb24pICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RvcEF1dGhlbnRpY2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2F1dGhlbnRpY2F0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgd2luZG93LnVpLnNldERlYnVnSW5mbyhTdHJpbmcoZXJyKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2F1dGhFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXV0aEV2ZW50cy5lcnJvck1lc3NhZ2UoU3RyaW5nKGVycikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBnZXQgYXV0aGVudGljYXRpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hdXRoZW50aWNhdGluZztcbiAgICB9XG4gICAgZ2V0IGF1dGhlbnRpY2F0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hdXRoZW50aWNhdGVkO1xuICAgIH1cbiAgICBnZXQgdXNlcm5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl91c2VybmFtZTtcbiAgICB9XG4gICAgc2V0IGF1dGhFdmVudHMoYXV0aEV2ZW50cykge1xuICAgICAgICB0aGlzLl9hdXRoRXZlbnRzID0gYXV0aEV2ZW50cztcbiAgICB9XG4gICAgX3ZhbGlkYXRlVXNlcm5hbWUodXNlcm5hbWUpIHtcbiAgICAgICAgaWYgKCF1c2VybmFtZSB8fCB0eXBlb2YgdXNlcm5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNhbml0aXplZCA9IHVzZXJuYW1lLnJlcGxhY2UoQXV0aGVudGljYXRvci5GT1JCSURERU5fQ0hBUlMsICcnKS50cmltKCk7XG4gICAgICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgQXV0aGVudGljYXRvci5NQVhfTEVOX1VTRVJOQU1FKTtcbiAgICAgICAgaWYgKCFBdXRoZW50aWNhdG9yLlVTRVJOQU1FX1BBVFRFUk4udGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1VzZXJuYW1lIGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVycycpO1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzYW5pdGl6ZWQ7XG4gICAgfVxuICAgIF92YWxpZGF0ZVBhc3N3b3JkKHBhc3N3b3JkKSB7XG4gICAgICAgIGlmICghcGFzc3dvcmQgfHwgdHlwZW9mIHBhc3N3b3JkICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzYW5pdGl6ZWQgPSBwYXNzd29yZC5yZXBsYWNlKC9bXFx4MDAtXFx4MDhcXHgwQlxceDBDXFx4MEUtXFx4MUZcXHg3Rl0vZywgJycpO1xuICAgICAgICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQuc3Vic3RyaW5nKDAsIEF1dGhlbnRpY2F0b3IuTUFYX0xFTl9QQVNTV09SRCk7XG4gICAgICAgIHJldHVybiBzYW5pdGl6ZWQ7XG4gICAgfVxuICAgIF9jbGVhckF1dGgoKSB7XG4gICAgICAgIHRoaXMuX3VzZXJuYW1lID0gXCJcIjtcbiAgICAgICAgdGhpcy5fcGFzc3dvcmQgPSBcIlwiO1xuICAgIH1cbiAgICBfc3RvcEF1dGhlbnRpY2F0aW9uKCkge1xuICAgICAgICBpbmRleF8xLmxpZ2h0ZG0uY2FuY2VsX2F1dGhlbnRpY2F0aW9uKCk7XG4gICAgICAgIHRoaXMuX2F1dGhlbnRpY2F0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY2xlYXJBdXRoKCk7XG4gICAgfVxuICAgIF9zdGFydEF1dGhlbnRpY2F0aW9uKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdGFydGluZyBMaWdodERNIGF1dGhlbnRpY2F0aW9uLi4uXCIpO1xuICAgICAgICAgICAgaW5kZXhfMS5saWdodGRtLmNhbmNlbF9hdXRoZW50aWNhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5fYXV0aGVudGljYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgaW5kZXhfMS5saWdodGRtLmF1dGhlbnRpY2F0ZSh0aGlzLl91c2VybmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgd2luZG93LnVpLnNldERlYnVnSW5mbyhTdHJpbmcoZXJyKSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fYXV0aEV2ZW50cykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2F1dGhFdmVudHMuZXJyb3JNZXNzYWdlKFN0cmluZyhlcnIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBsb2dpbih1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkVXNlcm5hbWUgPSB0aGlzLl92YWxpZGF0ZVVzZXJuYW1lKHVzZXJuYW1lKTtcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkUGFzc3dvcmQgPSB0aGlzLl92YWxpZGF0ZVBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZWRVc2VybmFtZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiTG9naW4oKSBjYWxsZWQgd2l0aCBpbnZhbGlkIHVzZXJuYW1lXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2F1dGhFdmVudHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hdXRoRXZlbnRzLmVycm9yTWVzc2FnZShcIkludmFsaWQgdXNlcm5hbWUgZm9ybWF0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsaWRhdGVkUGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkxvZ2luKCkgY2FsbGVkIHdpdGggaW52YWxpZCBwYXNzd29yZFwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hdXRoRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXV0aEV2ZW50cy5lcnJvck1lc3NhZ2UoXCJJbnZhbGlkIHBhc3N3b3JkIGZvcm1hdFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91c2VybmFtZSA9IHZhbGlkYXRlZFVzZXJuYW1lO1xuICAgICAgICB0aGlzLl9wYXNzd29yZCA9IHZhbGlkYXRlZFBhc3N3b3JkO1xuICAgICAgICBpZiAodGhpcy5fYXV0aGVudGljYXRpbmcgfHwgdGhpcy5fYXV0aGVudGljYXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiTG9naW4oKSB3YXMgY2FsbGVkIHdoaWxlIGFscmVhZHkgYXV0aGVudGljYXRpbmcgb3IgYXV0aGVudGljYXRlZC4gU3RvcHBpbmcgYXV0aGVudGljYXRpb24uXCIpO1xuICAgICAgICAgICAgd2luZG93LnVpLnNldERlYnVnSW5mbyhcImxvZ2luKCkgd2FzIGNhbGxlZCB3aGlsZSBhbHJlYWR5IGF1dGhlbnRpY2F0aW5nIG9yIGF1dGhlbnRpY2F0ZWRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3VzZXJuYW1lID09PSBcIlwiIHx8IHRoaXMuX3Bhc3N3b3JkID09PSBcIlwiKSB7XG4gICAgICAgICAgICB3aW5kb3cudWkuc2V0RGVidWdJbmZvKFwibG9naW4oKSB3YXMgY2FsbGVkIHdoaWxlIHVzZXJuYW1lIG9yIHBhc3N3b3JkIGlzIGVtcHR5XCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9hdXRoRXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9hdXRoRXZlbnRzLmF1dGhlbnRpY2F0aW9uU3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdGFydEF1dGhlbnRpY2F0aW9uKCk7XG4gICAgfVxufVxuZXhwb3J0cy5BdXRoZW50aWNhdG9yID0gQXV0aGVudGljYXRvcjtcbkF1dGhlbnRpY2F0b3IuTUFYX0xFTl9VU0VSTkFNRSA9IDMyO1xuQXV0aGVudGljYXRvci5NQVhfTEVOX1BBU1NXT1JEID0gMTI4O1xuQXV0aGVudGljYXRvci5VU0VSTkFNRV9QQVRURVJOID0gL15bYS16QS1aMC05Ll8tXSskLztcbkF1dGhlbnRpY2F0b3IuRk9SQklEREVOX0NIQVJTID0gL1tcXHgwMC1cXHgxRlxceDdGXS9nO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRGF0YSA9IGV4cG9ydHMuR3JlZXRlckltYWdlID0gdm9pZCAwO1xuY29uc3QgcGFja2FnZV9qc29uXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3BhY2thZ2UuanNvblwiKSk7XG5jb25zdCBQQVRIX0RBVEFfSlNPTiA9ICdkYXRhLmpzb24nO1xuY29uc3QgUEFUSF9MT0dPID0gJy91c3Ivc2hhcmUvY29kYW0vd2ViLWdyZWV0ZXIvbG9nby5wbmcnO1xuY29uc3QgUEFUSF9XQUxMUEFQRVJfTE9HSU4gPSAnL3Vzci9zaGFyZS9jb2RhbS93ZWItZ3JlZXRlci9sb2dpbi1zY3JlZW4ucG5nJztcbmNvbnN0IFBBVEhfV0FMTFBBUEVSX0xPQ0tfVVNFUiA9ICcvdG1wL2NvZGFtLXdlYi1ncmVldGVyLXVzZXItd2FsbHBhcGVyJztcbmNvbnN0IFBBVEhfVVNFUl9JTUFHRSA9ICcvdG1wL2NvZGFtLXdlYi1ncmVldGVyLXVzZXItYXZhdGFyJztcbmNvbnN0IFBBVEhfVVNFUl9ERUZBVUxUX0lNQUdFID0gJy91c3Ivc2hhcmUvY29kYW0vd2ViLWdyZWV0ZXIvdXNlci5wbmcnO1xuY2xhc3MgR3JlZXRlckltYWdlIHtcbiAgICBjb25zdHJ1Y3RvcihwYXRoKSB7XG4gICAgICAgIHRoaXMuX2V4aXN0cyA9IG51bGw7XG4gICAgICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgIH1cbiAgICBleGlzdHMoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZXhpc3RzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4aXN0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRpciA9IHRoaXMuX3BhdGguc3BsaXQoJy8nKS5zbGljZSgwLCAtMSkuam9pbignLycpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICAgICAgKF9hID0gd2luZG93LnRoZW1lX3V0aWxzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZGlybGlzdChkaXIsIGZhbHNlLCAoZGlyRmlsZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXhpc3RzID0gZGlyRmlsZXMgIT09IHVuZGVmaW5lZCAmJiBkaXJGaWxlcy5pbmNsdWRlcyhzZWxmLl9wYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzZWxmLl9leGlzdHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgcGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhdGg7XG4gICAgfVxufVxuZXhwb3J0cy5HcmVldGVySW1hZ2UgPSBHcmVldGVySW1hZ2U7XG5jbGFzcyBEYXRhIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB0aGlzLl9kYXRhSnNvbkZldGNoSW50ZXJ2YWwgPSA2MCAqIDEwMDA7XG4gICAgICAgIHRoaXMuX2RhdGFDaGFuZ2VMaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgdGhpcy5wa2dOYW1lID0gcGFja2FnZV9qc29uXzEuZGVmYXVsdC5uYW1lO1xuICAgICAgICB0aGlzLnBrZ1ZlcnNpb24gPSBwYWNrYWdlX2pzb25fMS5kZWZhdWx0LnZlcnNpb247XG4gICAgICAgIHRoaXMuaG9zdG5hbWUgPSAoKF9hID0gd2luZG93LmxpZ2h0ZG0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5ob3N0bmFtZSkgfHwgJ3Vua25vd24taG9zdG5hbWUnO1xuICAgICAgICB0aGlzLmxvZ2luU2NyZWVuV2FsbHBhcGVyID0gbmV3IEdyZWV0ZXJJbWFnZShQQVRIX1dBTExQQVBFUl9MT0dJTik7XG4gICAgICAgIHRoaXMudXNlckxvY2tTY3JlZW5XYWxscGFwZXIgPSBuZXcgR3JlZXRlckltYWdlKFBBVEhfV0FMTFBBUEVSX0xPQ0tfVVNFUik7XG4gICAgICAgIHRoaXMubG9nbyA9IG5ldyBHcmVldGVySW1hZ2UoUEFUSF9MT0dPKTtcbiAgICAgICAgdGhpcy51c2VySW1hZ2UgPSBuZXcgR3JlZXRlckltYWdlKFBBVEhfVVNFUl9JTUFHRSk7XG4gICAgICAgIHRoaXMudXNlckRlZmF1bHRJbWFnZSA9IG5ldyBHcmVldGVySW1hZ2UoUEFUSF9VU0VSX0RFRkFVTFRfSU1BR0UpO1xuICAgICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLl9yZWZldGNoRGF0YUpzb24oKSwgdGhpcy5fZGF0YUpzb25GZXRjaEludGVydmFsKTtcbiAgICAgICAgdGhpcy5fcmVmZXRjaERhdGFKc29uKCk7XG4gICAgfVxuICAgIHN0YXRpYyBleGFtVG9FdmVudChleGFtKSB7XG4gICAgICAgIGNvbnN0IGRlc2MgPSBgRm9yICR7ZXhhbS5wcm9qZWN0cy5tYXAoYyA9PiBjLm5hbWUpLmpvaW4oJywgJyl9YDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBleGFtLmlkLFxuICAgICAgICAgICAgbmFtZTogZXhhbS5uYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2MsXG4gICAgICAgICAgICBsb2NhdGlvbjogZXhhbS5sb2NhdGlvbixcbiAgICAgICAgICAgIGtpbmQ6ICdleGFtJyxcbiAgICAgICAgICAgIG1heF9wZW9wbGU6IGV4YW0ubWF4X3Blb3BsZSxcbiAgICAgICAgICAgIG5icl9zdWJzY3JpYmVyczogZXhhbS5uYnJfc3Vic2NyaWJlcnMsXG4gICAgICAgICAgICBiZWdpbl9hdDogZXhhbS5iZWdpbl9hdCxcbiAgICAgICAgICAgIGVuZF9hdDogZXhhbS5lbmRfYXQsXG4gICAgICAgICAgICBjYW1wdXNfaWRzOiBbXSxcbiAgICAgICAgICAgIGN1cnN1c19pZHM6IGV4YW0uY3Vyc3VzLm1hcChjID0+IGMuaWQpLFxuICAgICAgICAgICAgY3JlYXRlZF9hdDogZXhhbS5jcmVhdGVkX2F0LFxuICAgICAgICAgICAgdXBkYXRlZF9hdDogZXhhbS51cGRhdGVkX2F0LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBhZGREYXRhQ2hhbmdlTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5fZGF0YUNoYW5nZUxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG4gICAgcmVtb3ZlRGF0YUNoYW5nZUxpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMuX2RhdGFDaGFuZ2VMaXN0ZW5lcnMgPSB0aGlzLl9kYXRhQ2hhbmdlTGlzdGVuZXJzLmZpbHRlcihsID0+IGwgIT09IGxpc3RlbmVyKTtcbiAgICB9XG4gICAgZ2V0IGRhdGFKc29uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YUpzb247XG4gICAgfVxuICAgIF9yZWZldGNoRGF0YUpzb24oKSB7XG4gICAgICAgIGNvbnN0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UocmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJGZXRjaGVkIGRhdGEuanNvblwiLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAoXCJlcnJvclwiIGluIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnVpLnNldERlYnVnSW5mbyhgZGF0YS5qc29uIHJlc3BvbnNlIGNvbnRhaW5zIGFuIGVycm9yOiAke2RhdGEuZXJyb3J9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEoXCJtZXNzYWdlXCIgaW4gZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5tZXNzYWdlID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YUpzb24gPSBkYXRhO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgdGhpcy5fZGF0YUNoYW5nZUxpc3RlbmVycykge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcih0aGlzLl9kYXRhSnNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8oYEZhaWxlZCB0byBwYXJzZSBkYXRhLmpzb246ICR7ZXJyfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKHdpbmRvdy51aSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8oYEVycm9yIGZldGNoaW5nIGRhdGEuanNvbjogJHtlcnJ9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXEub3BlbignR0VUJywgUEFUSF9EQVRBX0pTT04pO1xuICAgICAgICByZXEuc2VuZCgpO1xuICAgIH1cbn1cbmV4cG9ydHMuRGF0YSA9IERhdGE7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuSWRsZXIgPSB2b2lkIDA7XG5jbGFzcyBJZGxlciB7XG4gICAgY29uc3RydWN0b3IoaXNMb2NrU2NyZWVuID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5faWRsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9sYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLl9pZGxlQWZ0ZXIgPSAzMDAwMDA7XG4gICAgICAgIHRoaXMuX3Rha2VBY3Rpb25BZnRlciA9IDM2MDAwMDA7XG4gICAgICAgIHRoaXMuX2lzTG9ja1NjcmVlbiA9IGlzTG9ja1NjcmVlbjtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX3VuaWRsZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5fdW5pZGxlLmJpbmQodGhpcykpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLl91bmlkbGUuYmluZCh0aGlzKSk7XG4gICAgICAgIHNldEludGVydmFsKHRoaXMuX2NoZWNrSWRsZS5iaW5kKHRoaXMpLCAxMDAwKTtcbiAgICB9XG4gICAgZ2V0IGlkbGVBZnRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkbGVBZnRlcjtcbiAgICB9XG4gICAgZ2V0IGlkbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZGxlO1xuICAgIH1cbiAgICBfdW5pZGxlKCkge1xuICAgICAgICB0aGlzLl9sYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLl9pZGxlID0gZmFsc2U7XG4gICAgfVxuICAgIF9hY3Rpb24oKSB7XG4gICAgfVxuICAgIF9jaGVja0lmQWN0aW9uTmVlZGVkKCkge1xuICAgICAgICBpZiAodGhpcy5faWRsZSkge1xuICAgICAgICAgICAgaWYgKERhdGUubm93KCkgLSB0aGlzLl9sYXN0QWN0aXZpdHkgPj0gdGhpcy5fdGFrZUFjdGlvbkFmdGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBfY2hlY2tJZGxlKCkge1xuICAgICAgICBpZiAodGhpcy5faWRsZSkge1xuICAgICAgICAgICAgdGhpcy5fY2hlY2tJZkFjdGlvbk5lZWRlZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKERhdGUubm93KCkgLSB0aGlzLl9sYXN0QWN0aXZpdHkgPj0gdGhpcy5faWRsZUFmdGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9pZGxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTm93IGlkbGluZy4uLlwiKTtcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrSWZBY3Rpb25OZWVkZWQoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5leHBvcnRzLklkbGVyID0gSWRsZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgZGF0YV8xID0gcmVxdWlyZShcIi4vZGF0YVwiKTtcbmNvbnN0IHVpXzEgPSByZXF1aXJlKFwiLi91aVwiKTtcbmNvbnN0IGF1dGhfMSA9IHJlcXVpcmUoXCIuL2F1dGhcIik7XG5jb25zdCBpZGxlcl8xID0gcmVxdWlyZShcIi4vaWRsZXJcIik7XG5mdW5jdGlvbiBzbGVlcChtcykge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCBtcyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxud2luZG93LnNsZWVwID0gc2xlZXA7XG53aW5kb3cucmVzdGFydENvbXB1dGVyID0gKCkgPT4ge1xuICAgIHZhciBfYSwgX2I7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKCEoKF9hID0gd2luZG93LmxpZ2h0ZG0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5jYW5fcmVzdGFydCkpIHtcbiAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8oXCJSZWJvb3RpbmcgZmFpbGVkOiBsaWdodGRtLmNhbl9yZXN0YXJ0IGlzIGZhbHNlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIChfYiA9IHdpbmRvdy5saWdodGRtKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IucmVzdGFydCgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICB3aW5kb3cudWkuc2V0RGVidWdJbmZvKGBSZWJvb3RpbmcgZmFpbGVkOiAke2Vycn1gKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG53aW5kb3cuYnJpZ2h0bmVzcyA9IHtcbiAgICBkZWNyZWFzZTogKCkgPT4ge1xuICAgICAgICB2YXIgX2EsIF9iO1xuICAgICAgICBpZiAoISgoX2EgPSB3aW5kb3cubGlnaHRkbSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmNhbl9hY2Nlc3NfYnJpZ2h0bmVzcykpIHtcbiAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8oJ0JyaWdodG5lc3MgY29udHJvbCBmYWlsZWQ6IGxpZ2h0ZG0uY2FuX2FjY2Vzc19icmlnaHRuZXNzIGlzIGZhbHNlJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgKF9iID0gd2luZG93LmxpZ2h0ZG0pID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5icmlnaHRuZXNzX2RlY3JlYXNlKDEwKTtcbiAgICB9LFxuICAgIGluY3JlYXNlOiAoKSA9PiB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIGlmICghKChfYSA9IHdpbmRvdy5saWdodGRtKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuY2FuX2FjY2Vzc19icmlnaHRuZXNzKSkge1xuICAgICAgICAgICAgd2luZG93LnVpLnNldERlYnVnSW5mbygnQnJpZ2h0bmVzcyBjb250cm9sIGZhaWxlZDogbGlnaHRkbS5jYW5fYWNjZXNzX2JyaWdodG5lc3MgaXMgZmFsc2UnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAoX2IgPSB3aW5kb3cubGlnaHRkbSkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmJyaWdodG5lc3NfaW5jcmVhc2UoMTApO1xuICAgIH1cbn07XG5mdW5jdGlvbiBpbml0R3JlZXRlcigpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICB3aW5kb3cuZGF0YSA9IG5ldyBkYXRhXzEuRGF0YSgpO1xuICAgICAgICB3aW5kb3cuYXV0aCA9IG5ldyBhdXRoXzEuQXV0aGVudGljYXRvcigpO1xuICAgICAgICB3aW5kb3cudWkgPSBuZXcgdWlfMS5VSSh3aW5kb3cuZGF0YSwgd2luZG93LmF1dGgpO1xuICAgICAgICB3aW5kb3cuaWRsZXIgPSBuZXcgaWRsZXJfMS5JZGxlcih3aW5kb3cudWkuaXNMb2NrU2NyZWVuKTtcbiAgICAgICAgd2luZG93LmRlYnVnS2V5cyA9IGZhbHNlO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgICAgICBjb25zdCBpc1Bhc3N3b3JkSW5wdXQgPSAoKChfYSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50YWdOYW1lKSA9PT0gJ0lOUFVUJyAmJiAoKF9iID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmdldEF0dHJpYnV0ZSgndHlwZScpKSA9PT0gJ3Bhc3N3b3JkJyk7XG4gICAgICAgICAgICBpZiAod2luZG93LmRlYnVnS2V5cyAmJiAhaXNQYXNzd29yZElucHV0KSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnVpLnNldERlYnVnSW5mbyhgS2V5IHByZXNzZWQ6ICR7ZS5jb2RlfSAoJHtlLmtleX0pJHtlLmN0cmxLZXkgPyAnICsgQ3RybCcgOiAnJ30ke2UuYWx0S2V5ID8gJyArIEFsdCcgOiAnJ30ke2Uuc2hpZnRLZXkgPyAnICsgU2hpZnQnIDogJyd9JHtlLm1ldGFLZXkgPyAnICsgTWV0YScgOiAnJ31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlLmN0cmxLZXkgJiYgZS5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RlbGV0ZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cudWkuc2V0RGVidWdJbmZvKCdSZWJvb3QgcmVxdWVzdGVkIHRocm91Z2ggTGlnaHRETScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlc3RhcnRDb21wdXRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnVpLnNldERlYnVnSW5mbygnRXhhbSBtb2RlIG92ZXJyaWRlIGVuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy51aS5vdmVycmlkZUV4YW1Nb2RlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZGVidWdLZXlzID0gKHdpbmRvdy5kZWJ1Z0tleXMpID8gZmFsc2UgOiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnVpLnNldERlYnVnSW5mbyhgRGVidWcga2V5czogJHsod2luZG93LmRlYnVnS2V5cyA/ICdlbmFibGVkJyA6ICdkaXNhYmxlZCcpfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd6JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8oJ0ZvcmNlIHpvb20gcmVjYWxpYnJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnVpLmZvcmNlWm9vbVJlY2FsaWJyYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQnJpZ2h0bmVzc0Rvd24nOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdGMSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0YxNCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuYnJpZ2h0bmVzcy5kZWNyZWFzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0JyaWdodG5lc3NVcCc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0YyJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnRjE1JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5icmlnaHRuZXNzLmluY3JlYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gcmVzZXRCcm93c2VyWm9vbSgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAod2luZG93LnVpKSB7XG4gICAgICAgICAgICB3aW5kb3cudWkucmVzZXRab29tKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnpvb20gPSBcIjFcIjtcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS16b29tJywgXCIxXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1pvb20gcmVzZXQgdG8gZGVmYXVsdCAoMSkgLSBVSSBub3QgYXZhaWxhYmxlJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlc2V0dGluZyB6b29tOicsIGVycm9yKTtcbiAgICB9XG59XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy51aSkge1xuICAgICAgICAgICAgcmVzZXRCcm93c2VyWm9vbSgpO1xuICAgICAgICB9XG4gICAgfSwgMTAwKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy51aSkge1xuICAgICAgICAgICAgcmVzZXRCcm93c2VyWm9vbSgpO1xuICAgICAgICB9XG4gICAgfSwgNTAwKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy51aSkge1xuICAgICAgICAgICAgcmVzZXRCcm93c2VyWm9vbSgpO1xuICAgICAgICB9XG4gICAgfSwgMTAwMCk7XG59KTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgIGlmICgoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkgJiYgKGUua2V5ID09PSAnKycgfHwgZS5rZXkgPT09ICctJyB8fCBlLmtleSA9PT0gJz0nIHx8IGUua2V5ID09PSAnMCcpKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1pvb20gc2hvcnRjdXQgcHJldmVudGVkOicsIGUua2V5KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0sIHsgY2FwdHVyZTogdHJ1ZSB9KTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgKGUpID0+IHtcbiAgICBpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdab29tIHdoZWVsIHByZXZlbnRlZCcpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufSwgeyBwYXNzaXZlOiBmYWxzZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiR3JlZXRlclJlYWR5XCIsICgpID0+IHtcbiAgICBpbml0R3JlZXRlcigpO1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuVUkgPSB2b2lkIDA7XG5jb25zdCBpbmZvYmFyc18xID0gcmVxdWlyZShcIi4vdWlzL2luZm9iYXJzXCIpO1xuY29uc3QgbG9ja3NjcmVlbl8xID0gcmVxdWlyZShcIi4vdWlzL3NjcmVlbnMvbG9ja3NjcmVlblwiKTtcbmNvbnN0IGxvZ2luc2NyZWVuXzEgPSByZXF1aXJlKFwiLi91aXMvc2NyZWVucy9sb2dpbnNjcmVlblwiKTtcbmNvbnN0IG5vZHlfZ3JlZXRlcl90eXBlc18xID0gcmVxdWlyZShcIm5vZHktZ3JlZXRlci10eXBlc1wiKTtcbmNvbnN0IHdhbGxwYXBlcl8xID0gcmVxdWlyZShcIi4vdWlzL3dhbGxwYXBlclwiKTtcbmNvbnN0IGNhbGVuZGFyXzEgPSByZXF1aXJlKFwiLi91aXMvY2FsZW5kYXJcIik7XG5jb25zdCBleGFtc2NyZWVuXzEgPSByZXF1aXJlKFwiLi91aXMvc2NyZWVucy9leGFtc2NyZWVuXCIpO1xuY2xhc3MgVUkge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEsIGF1dGgpIHtcbiAgICAgICAgdGhpcy5fbG9ja1NjcmVlbiA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xvZ2luU2NyZWVuID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZXhhbU1vZGVTY3JlZW4gPSBudWxsO1xuICAgICAgICB0aGlzLl9pc0xvY2tTY3JlZW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZXhhbU1vZGVEaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9zY2FsaW5nRmFjdG9yID0gMTtcbiAgICAgICAgdGhpcy5faW5mb0JhcnMgPSBuZXcgaW5mb2JhcnNfMS5JbmZvQmFyc1VJKCk7XG4gICAgICAgIHRoaXMuX2xvZ28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9nbycpO1xuICAgICAgICB0aGlzLl9tZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lc3NhZ2UnKTtcbiAgICAgICAgdGhpcy5mb3JjZVJlc2V0Wm9vbSgpO1xuICAgICAgICB0aGlzLmFwcGx5SGlEcGlTY2FsaW5nKCk7XG4gICAgICAgIHRoaXMuX2xvZ28uc3JjID0gZGF0YS5sb2dvLnBhdGg7XG4gICAgICAgIHRoaXMuX2xvZ28uYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTG9nbyBpbWFnZSBub3QgZm91bmQgYXQgJHtkYXRhLmxvZ28ucGF0aH1gKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGFjdGl2ZVNlc3Npb24gPSBub2R5X2dyZWV0ZXJfdHlwZXNfMS5saWdodGRtLnVzZXJzLmZpbmQoKHVzZXIpID0+IHVzZXIubG9nZ2VkX2luKTtcbiAgICAgICAgaWYgKGFjdGl2ZVNlc3Npb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fbG9ja1NjcmVlbiA9IG5ldyBsb2Nrc2NyZWVuXzEuTG9ja1NjcmVlblVJKGF1dGgsIGFjdGl2ZVNlc3Npb24pO1xuICAgICAgICAgICAgdGhpcy5faXNMb2NrU2NyZWVuID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2xvZ28uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIHRoaXMuX2xvY2tTY3JlZW4uc2hvd0Zvcm0oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2luU2NyZWVuID0gbmV3IGxvZ2luc2NyZWVuXzEuTG9naW5TY3JlZW5VSShhdXRoKTtcbiAgICAgICAgICAgIHRoaXMuX2V4YW1Nb2RlU2NyZWVuID0gbmV3IGV4YW1zY3JlZW5fMS5FeGFtTW9kZVVJKGF1dGgsIHRoaXMuX2xvZ2luU2NyZWVuKTtcbiAgICAgICAgICAgIGRhdGEuYWRkRGF0YUNoYW5nZUxpc3RlbmVyKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0ZvckV4YW1Nb2RlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrRm9yRXhhbU1vZGUoKTtcbiAgICAgICAgICAgIH0sIFVJLkVYQU1fTU9ERV9DSEVDS19JTlRFUlZBTCk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRm9yRXhhbU1vZGUoKTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhLmFkZERhdGFDaGFuZ2VMaXN0ZW5lcigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0TWVzc2FnZShkYXRhLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGRhdGEuZGF0YUpzb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRNZXNzYWdlKGRhdGEuZGF0YUpzb24ubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fd2FsbHBhcGVyID0gbmV3IHdhbGxwYXBlcl8xLldhbGxwYXBlclVJKHRoaXMuX2lzTG9ja1NjcmVlbik7XG4gICAgICAgIHRoaXMuX2NhbGVuZGFyID0gbmV3IGNhbGVuZGFyXzEuQ2FsZW5kYXJVSShkYXRhKTtcbiAgICB9XG4gICAgZ2V0IGlzTG9ja1NjcmVlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9ja1NjcmVlbjtcbiAgICB9XG4gICAgb3ZlcnJpZGVFeGFtTW9kZSgpIHtcbiAgICAgICAgdGhpcy5fZXhhbU1vZGVEaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY2hlY2tGb3JFeGFtTW9kZSgpO1xuICAgIH1cbiAgICBmb3JjZVpvb21SZWNhbGlicmF0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnRm9yY2Ugem9vbSByZWNhbGlicmF0aW9uIHJlcXVlc3RlZCcpO1xuICAgICAgICB0aGlzLmZvcmNlUmVzZXRab29tKCk7XG4gICAgICAgIHRoaXMuYXBwbHlIaURwaVNjYWxpbmcoKTtcbiAgICB9XG4gICAgc2V0RGVidWdJbmZvKGluZm8pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJEZWJ1ZyBpbmZvOlwiLCBpbmZvKTtcbiAgICAgICAgdGhpcy5faW5mb0JhcnMuc2V0RGVidWdJbmZvKGluZm8pO1xuICAgIH1cbiAgICBzZXRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UucmVwbGFjZSgvKDwoW14+XSspPikvZ2ksIFwiXCIpO1xuICAgICAgICBtZXNzYWdlID0gbWVzc2FnZS5yZXBsYWNlKC9cXG4vZywgJzxicj4nKTtcbiAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UucmVwbGFjZSgvXFwqKC4qPylcXCovZywgJzxiPiQxPC9iPicpO1xuICAgICAgICBtZXNzYWdlID0gbWVzc2FnZS5yZXBsYWNlKC9fKC4qPylfL2csICc8aT4kMTwvaT4nKTtcbiAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UucmVwbGFjZSgvICArL2csICcmbmJzcDsmbmJzcDsnKTtcbiAgICAgICAgdGhpcy5fbWVzc2FnZS5pbm5lckhUTUwgPSBtZXNzYWdlO1xuICAgIH1cbiAgICBnZXRNZXNzYWdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWVzc2FnZS5pbm5lclRleHQ7XG4gICAgfVxuICAgIGNoZWNrRm9yRXhhbU1vZGUoKSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mO1xuICAgICAgICBpZiAodGhpcy5pc0xvY2tTY3JlZW4pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod2luZG93LmRhdGEuZGF0YUpzb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgKF9hID0gdGhpcy5fZXhhbU1vZGVTY3JlZW4pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5oaWRlRm9ybSgpO1xuICAgICAgICAgICAgKF9iID0gdGhpcy5fbG9naW5TY3JlZW4pID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5zaG93Rm9ybSgpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4YW1zRm9ySG9zdCA9IHdpbmRvdy5kYXRhLmRhdGFKc29uLmV4YW1zX2Zvcl9ob3N0O1xuICAgICAgICBjb25zdCBvbmdvaW5nRXhhbXMgPSBleGFtc0Zvckhvc3QuZmlsdGVyKChleGFtKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgYmVnaW5BdCA9IG5ldyBEYXRlKGV4YW0uYmVnaW5fYXQpO1xuICAgICAgICAgICAgY29uc3QgYmVnaW5FeGFtTW9kZUF0ID0gbmV3IERhdGUoYmVnaW5BdC5nZXRUaW1lKCkgLSBVSS5TSE9XX0VYQU1fTU9ERV9NSU5VVEVTX0JFRk9SRV9CRUdJTiAqIDYwICogMTAwMCk7XG4gICAgICAgICAgICBjb25zdCBlbmRBdCA9IG5ldyBEYXRlKGV4YW0uZW5kX2F0KTtcbiAgICAgICAgICAgIHJldHVybiBub3cgPj0gYmVnaW5FeGFtTW9kZUF0ICYmIG5vdyA8IGVuZEF0O1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF0aGlzLl9leGFtTW9kZURpc2FibGVkICYmIG9uZ29pbmdFeGFtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoISgoX2MgPSB0aGlzLl9leGFtTW9kZVNjcmVlbikgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmV4YW1Nb2RlKSB8fCAhb25nb2luZ0V4YW1zLnNvbWUoKGV4YW0pID0+IHsgdmFyIF9hOyByZXR1cm4gKF9hID0gdGhpcy5fZXhhbU1vZGVTY3JlZW4pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5leGFtSWRzLmluY2x1ZGVzKGV4YW0uaWQpOyB9KSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWN0aXZhdGluZyBleGFtIG1vZGUgbG9naW4gVUlcIik7XG4gICAgICAgICAgICAgICAgKF9kID0gdGhpcy5fZXhhbU1vZGVTY3JlZW4pID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5lbmFibGVFeGFtTW9kZShvbmdvaW5nRXhhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoKF9lID0gdGhpcy5fZXhhbU1vZGVTY3JlZW4pID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5leGFtTW9kZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEZWFjdGl2YXRpbmcgZXhhbSBtb2RlIGxvZ2luIFVJJyk7XG4gICAgICAgICAgICAgICAgKF9mID0gdGhpcy5fZXhhbU1vZGVTY3JlZW4pID09PSBudWxsIHx8IF9mID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZi5kaXNhYmxlRXhhbU1vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgZ2V0UGFkZGluZyhlbGVtZW50ID0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICByZXR1cm4gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKCctLXBhZGRpbmcnKTtcbiAgICB9XG4gICAgc2V0UHJpbWFyeVRoZW1lQ29sb3IoY29sb3IpIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgaWYgKGNvbG9yID09PSBudWxsKSB7XG4gICAgICAgICAgICByb290LnN0eWxlLnNldFByb3BlcnR5KCctLWNvbG9yLXByaW1hcnknLCAndmFyKC0tY29sb3ItYmx1ZSknKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tY29sb3ItcHJpbWFyeScsIGNvbG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRQcmltYXJ5VGhlbWVDb2xvcigpIHtcbiAgICAgICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKCctLWNvbG9yLXByaW1hcnknKTtcbiAgICB9XG4gICAgZ2V0IHNjYWxpbmdGYWN0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY2FsaW5nRmFjdG9yO1xuICAgIH1cbiAgICBhcHBseUhpRHBpU2NhbGluZygpIHtcbiAgICAgICAgbGV0IHBpeGVsUmF0aW8gPSAxO1xuICAgICAgICBpZiAod2luZG93Lm91dGVyV2lkdGggPiAyNTYwIHx8IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICE9IDEpIHtcbiAgICAgICAgICAgIHBpeGVsUmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+IDEgPyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA6IDEuNztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc2V0Wm9vbShwaXhlbFJhdGlvKTtcbiAgICB9XG4gICAgcmVzZXRab29tKHNjYWxpbmdGYWN0b3IgPSB0aGlzLl9zY2FsaW5nRmFjdG9yKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuem9vbSA9IGAke3NjYWxpbmdGYWN0b3J9YDtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS16b29tJywgYCR7c2NhbGluZ0ZhY3Rvcn1gKTtcbiAgICAgICAgdGhpcy5fc2NhbGluZ0ZhY3RvciA9IHNjYWxpbmdGYWN0b3I7XG4gICAgICAgIGNvbnNvbGUubG9nKGBab29tIHJlc2V0IHRvIHNjYWxpbmcgZmFjdG9yOiAke3NjYWxpbmdGYWN0b3J9YCk7XG4gICAgfVxuICAgIGZvcmNlUmVzZXRab29tKCkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnpvb20gPSBcIjFcIjtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnpvb20gPSBcIjFcIjtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLXpvb20nLCBcIjFcIik7XG4gICAgICAgIHRoaXMuX3NjYWxpbmdGYWN0b3IgPSAxO1xuICAgICAgICBjb25zb2xlLmxvZygnWm9vbSBmb3JjZSByZXNldCB0byAxLjAgKGNsZWFyaW5nIGFueSB1c2VyIHpvb20pJyk7XG4gICAgfVxufVxuZXhwb3J0cy5VSSA9IFVJO1xuVUkuRVhBTV9NT0RFX0NIRUNLX0lOVEVSVkFMID0gNSAqIDEwMDA7XG5VSS5TSE9XX0VYQU1fTU9ERV9NSU5VVEVTX0JFRk9SRV9CRUdJTiA9IDIwO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNhbGVuZGFyVUkgPSB2b2lkIDA7XG5jb25zdCBkYXRhXzEgPSByZXF1aXJlKFwiLi4vZGF0YVwiKTtcbmNvbnN0IHVpXzEgPSByZXF1aXJlKFwiLi4vdWlcIik7XG5jbGFzcyBDYWxlbmRhclVJIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhSG9sZGVyKSB7XG4gICAgICAgIHRoaXMuX2dyZXlFdmVudHMgPSBbXCJib2NhbCBxJmFcIiwgXCJib2NhbCBzdGFuZC11cFwiLCBcIm9wZW4gaG91clwiLCBcIm9wZW4gaG91ciB3aXRoIHRoZSBzdHVkZW50IGNvdW5jaWxcIl07XG4gICAgICAgIHRoaXMuX2NhbGVuZGFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ludHJhLWNhbGVuZGFyJyk7XG4gICAgICAgIHRoaXMucG9wdWxhdGVDYWxlbmRhcigpO1xuICAgICAgICBkYXRhSG9sZGVyLmFkZERhdGFDaGFuZ2VMaXN0ZW5lcih0aGlzLnBvcHVsYXRlQ2FsZW5kYXIuYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIF9lc3RpbWF0ZUR1cmF0aW9uKGJlZ2luQXQsIGVuZEF0KSB7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gZW5kQXQuZ2V0VGltZSgpIC0gYmVnaW5BdC5nZXRUaW1lKCk7XG4gICAgICAgIGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKGR1cmF0aW9uIC8gMTAwMCAvIDYwIC8gNjAgLyAyNCk7XG4gICAgICAgIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihkdXJhdGlvbiAvIDEwMDAgLyA2MCAvIDYwKTtcbiAgICAgICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoZHVyYXRpb24gLyAxMDAwIC8gNjApO1xuICAgICAgICBpZiAoZGF5cyA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtkYXlzfSBkYXlzYDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChob3VycyA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBgQWJvdXQgJHtob3Vyc30gaG91ciR7aG91cnMgPT09IDEgPyAnJyA6ICdzJ31gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbnV0ZXMgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gYEFib3V0ICR7bWludXRlc30gbWludXRlJHttaW51dGVzID09PSAxID8gJycgOiAncyd9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgX3JlbW92ZU1hcmtkb3duU3ludGF4KHRleHQpIHtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFwqXFwqKC4qPylcXCpcXCovZywgJyQxJyk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcKiguKj8pXFwqL2csICckMScpO1xuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXF8oLio/KVxcXy9nLCAnJDEnKTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxbKC4qPylcXF1cXCgoLio/KVxcKS9nLCAnJDEgKCQyKScpO1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgX2lzR3JleUV2ZW50KGV2ZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ncmV5RXZlbnRzLnNvbWUoZ3JleUV2ZW50ID0+IGV2ZW50Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhncmV5RXZlbnQpKTtcbiAgICB9XG4gICAgX2V2ZW50Rml0c09uU2NyZWVuKGV2ZW50RWxlbWVudCA9IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBhdmFpbGFibGVXaW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGNvbnN0IGluZm9CYXJIZWlnaHQgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKHRoaXMuX2NhbGVuZGFyKS5nZXRQcm9wZXJ0eVZhbHVlKCctLWhlYWRlci1mb290ZXItaGVpZ2h0JykpICogd2luZG93LnVpLnNjYWxpbmdGYWN0b3I7XG4gICAgICAgIGNvbnN0IGNhbGVuZGFySGVpZ2h0ID0gdGhpcy5fY2FsZW5kYXIuY2xpZW50SGVpZ2h0ICogd2luZG93LnVpLnNjYWxpbmdGYWN0b3I7XG4gICAgICAgIGNvbnN0IGV2ZW50SGVpZ2h0ID0gNzggKiB3aW5kb3cudWkuc2NhbGluZ0ZhY3RvcjtcbiAgICAgICAgY29uc3QgZXZlbnRNYXJnaW4gPSBwYXJzZUludCh1aV8xLlVJLmdldFBhZGRpbmcodGhpcy5fY2FsZW5kYXIpKSAqIHdpbmRvdy51aS5zY2FsaW5nRmFjdG9yO1xuICAgICAgICBjb25zdCByZXF1aXJlZFNwYWNlID0gZXZlbnRIZWlnaHQgKyBldmVudE1hcmdpbjtcbiAgICAgICAgY29uc3Qgc3BhY2VMZWZ0ID0gYXZhaWxhYmxlV2luZG93SGVpZ2h0IC0gY2FsZW5kYXJIZWlnaHQgLSAoaW5mb0JhckhlaWdodCAqIDIpIC0gKGV2ZW50TWFyZ2luICogMik7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJDYWxjdWxhdGVkIGlmIGV2ZW50IGZpdHMgb24gc2NyZWVuXCIsIFwiYXZhaWxhYmxlV2luZG93SGVpZ2h0XCIsIGF2YWlsYWJsZVdpbmRvd0hlaWdodCwgXCJjYWxlbmRhckhlaWdodFwiLCBjYWxlbmRhckhlaWdodCwgXCJldmVudEhlaWdodFwiLCBldmVudEhlaWdodCwgXCJldmVudE1hcmdpblwiLCBldmVudE1hcmdpbiwgXCJyZXF1aXJlZFNwYWNlXCIsIHJlcXVpcmVkU3BhY2UsIFwic3BhY2VMZWZ0XCIsIHNwYWNlTGVmdCwgXCJzY2FsaW5nRmFjdG9yXCIsIHdpbmRvdy51aS5zY2FsaW5nRmFjdG9yKTtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmVkU3BhY2UgPCBzcGFjZUxlZnQ7XG4gICAgfVxuICAgIHBvcHVsYXRlQ2FsZW5kYXIoZGF0YUpTT04gPSB3aW5kb3cuZGF0YS5kYXRhSnNvbikge1xuICAgICAgICBpZiAoZGF0YUpTT04gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fZGVzdHJveUFsbEV2ZW50cygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV2ZW50c0ZvckNhbGVuZGFyID0gW107XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgZGF0YUpTT04uZXZlbnRzKSB7XG4gICAgICAgICAgICBldmVudHNGb3JDYWxlbmRhci5wdXNoKHRoaXMuX2NyZWF0ZUV2ZW50RWxlbWVudChldmVudCkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZXhhbSBvZiBkYXRhSlNPTi5leGFtcykge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBkYXRhXzEuRGF0YS5leGFtVG9FdmVudChleGFtKTtcbiAgICAgICAgICAgIGV2ZW50c0ZvckNhbGVuZGFyLnB1c2godGhpcy5fY3JlYXRlRXZlbnRFbGVtZW50KGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgZXZlbnRzRm9yQ2FsZW5kYXIuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCgoX2EgPSBhLmdldEF0dHJpYnV0ZShcImRhdGEtZXZlbnQtdGltZXN0YW1wXCIpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBcIjBcIikgLSBwYXJzZUludCgoX2IgPSBiLmdldEF0dHJpYnV0ZShcImRhdGEtZXZlbnQtdGltZXN0YW1wXCIpKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBcIjBcIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9kZXN0cm95QWxsRXZlbnRzKCk7XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgZXZlbnRzRm9yQ2FsZW5kYXIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fZXZlbnRGaXRzT25TY3JlZW4oZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudCBkb2Vzbid0IGZpdCBvbiBzY3JlZW5cIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jYWxlbmRhci5hcHBlbmRDaGlsZChldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2Rlc3Ryb3lBbGxFdmVudHMoKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuX2NhbGVuZGFyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NhbGVuZGFyLWV2ZW50Jyk7XG4gICAgICAgIHdoaWxlIChldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZXZlbnRzWzBdLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9jcmVhdGVFdmVudEVsZW1lbnQoZXZlbnQpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBiZWdpbkRhdGUgPSBuZXcgRGF0ZShldmVudC5iZWdpbl9hdCk7XG4gICAgICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZShldmVudC5lbmRfYXQpO1xuICAgICAgICBjb25zdCBjYWxlbmRhckV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnQuY2xhc3NMaXN0LmFkZCgnY2FsZW5kYXItZXZlbnQnKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWV2ZW50LWtpbmRcIiwgKHRoaXMuX2lzR3JleUV2ZW50KGV2ZW50KSA/IFwicmVjdXJyaW5nXCIgOiBldmVudC5raW5kKSk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1ldmVudC1pZFwiLCBldmVudC5pZC50b1N0cmluZygpKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWV2ZW50LXRpbWVzdGFtcFwiLCBiZWdpbkRhdGUuZ2V0VGltZSgpLnRvU3RyaW5nKCkpO1xuICAgICAgICBjb25zdCBjYWxlbmRhckV2ZW50RGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjYWxlbmRhckV2ZW50RGF0ZS5jbGFzc0xpc3QuYWRkKCdjYWxlbmRhci1ldmVudC1kYXRlJyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnQuYXBwZW5kQ2hpbGQoY2FsZW5kYXJFdmVudERhdGUpO1xuICAgICAgICBjb25zdCBjYWxlbmRhckV2ZW50RGF0ZURheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudERhdGVEYXkuY2xhc3NMaXN0LmFkZCgnY2FsZW5kYXItZXZlbnQtZGF0ZS1kYXknKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudERhdGVEYXkuaW5uZXJUZXh0ID0gYmVnaW5EYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1OTCcsIHsgd2Vla2RheTogJ3Nob3J0JyB9KTtcbiAgICAgICAgY2FsZW5kYXJFdmVudERhdGUuYXBwZW5kQ2hpbGQoY2FsZW5kYXJFdmVudERhdGVEYXkpO1xuICAgICAgICBjb25zdCBjYWxlbmRhckV2ZW50RGF0ZURhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnREYXRlRGF0ZS5jbGFzc0xpc3QuYWRkKCdjYWxlbmRhci1ldmVudC1kYXRlLWRhdGUnKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudERhdGVEYXRlLmlubmVyVGV4dCA9IGJlZ2luRGF0ZS50b0xvY2FsZVN0cmluZygnZW4tTkwnLCB7IGRheTogJ251bWVyaWMnIH0pO1xuICAgICAgICBjYWxlbmRhckV2ZW50RGF0ZS5hcHBlbmRDaGlsZChjYWxlbmRhckV2ZW50RGF0ZURhdGUpO1xuICAgICAgICBjb25zdCBjYWxlbmRhckV2ZW50RGF0ZU1vbnRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBjYWxlbmRhckV2ZW50RGF0ZU1vbnRoLmNsYXNzTGlzdC5hZGQoJ2NhbGVuZGFyLWV2ZW50LWRhdGUtbW9udGgnKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudERhdGVNb250aC5pbm5lclRleHQgPSBiZWdpbkRhdGUudG9Mb2NhbGVTdHJpbmcoJ2VuLU5MJywgeyBtb250aDogJ3Nob3J0JyB9KTtcbiAgICAgICAgY2FsZW5kYXJFdmVudERhdGUuYXBwZW5kQ2hpbGQoY2FsZW5kYXJFdmVudERhdGVNb250aCk7XG4gICAgICAgIGNvbnN0IGNhbGVuZGFyRXZlbnRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2NhbGVuZGFyLWV2ZW50LXdyYXBwZXInKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudC5hcHBlbmRDaGlsZChjYWxlbmRhckV2ZW50V3JhcHBlcik7XG4gICAgICAgIGNvbnN0IGNhbGVuZGFyRXZlbnRUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjYWxlbmRhckV2ZW50VGl0bGUuY2xhc3NMaXN0LmFkZCgnY2FsZW5kYXItZXZlbnQtdGl0bGUnKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudFRpdGxlLmlubmVyVGV4dCA9IGV2ZW50Lm5hbWU7XG4gICAgICAgIGNhbGVuZGFyRXZlbnRXcmFwcGVyLmFwcGVuZENoaWxkKGNhbGVuZGFyRXZlbnRUaXRsZSk7XG4gICAgICAgIGNvbnN0IGNhbGVuZGFyRXZlbnREZXNjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnREZXNjLmNsYXNzTGlzdC5hZGQoJ2NhbGVuZGFyLWV2ZW50LWRlc2NyaXB0aW9uJyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnREZXNjLmlubmVyVGV4dCA9IHRoaXMuX3JlbW92ZU1hcmtkb3duU3ludGF4KGV2ZW50LmRlc2NyaXB0aW9uKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudFdyYXBwZXIuYXBwZW5kQ2hpbGQoY2FsZW5kYXJFdmVudERlc2MpO1xuICAgICAgICBjb25zdCBjYWxlbmRhckV2ZW50RGV0YWlscyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjYWxlbmRhckV2ZW50RGV0YWlscy5jbGFzc0xpc3QuYWRkKCdjYWxlbmRhci1ldmVudC1kZXRhaWxzJyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnRXcmFwcGVyLmFwcGVuZENoaWxkKGNhbGVuZGFyRXZlbnREZXRhaWxzKTtcbiAgICAgICAgY29uc3QgY2FsZW5kYXJFdmVudFRpbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnRUaW1lLmNsYXNzTGlzdC5hZGQoJ2NhbGVuZGFyLWV2ZW50LXRpbWUnKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudFRpbWUuaW5uZXJUZXh0ID0gYmVnaW5EYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1OTCcsIHsgdGltZVN0eWxlOiAnc2hvcnQnIH0pO1xuICAgICAgICBjYWxlbmRhckV2ZW50RGV0YWlscy5hcHBlbmRDaGlsZChjYWxlbmRhckV2ZW50VGltZSk7XG4gICAgICAgIGNvbnN0IGNhbGVuZGFyRXZlbnREdXJhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudER1cmF0aW9uLmNsYXNzTGlzdC5hZGQoJ2NhbGVuZGFyLWV2ZW50LWR1cmF0aW9uJyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnREdXJhdGlvbi5pbm5lclRleHQgPSB0aGlzLl9lc3RpbWF0ZUR1cmF0aW9uKGJlZ2luRGF0ZSwgZW5kRGF0ZSk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnREZXRhaWxzLmFwcGVuZENoaWxkKGNhbGVuZGFyRXZlbnREdXJhdGlvbik7XG4gICAgICAgIGNvbnN0IGNhbGVuZGFyRXZlbnRTcG90cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudFNwb3RzLmNsYXNzTGlzdC5hZGQoJ2NhbGVuZGFyLWV2ZW50LXNwb3RzJyk7XG4gICAgICAgIGNhbGVuZGFyRXZlbnRTcG90cy5pbm5lclRleHQgPSAoZXZlbnQubWF4X3Blb3BsZSA/IGAke2V2ZW50Lm5icl9zdWJzY3JpYmVyc30gLyAke2V2ZW50Lm1heF9wZW9wbGV9YCA6ICcnKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudERldGFpbHMuYXBwZW5kQ2hpbGQoY2FsZW5kYXJFdmVudFNwb3RzKTtcbiAgICAgICAgY29uc3QgY2FsZW5kYXJFdmVudExvY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBjYWxlbmRhckV2ZW50TG9jYXRpb24uY2xhc3NMaXN0LmFkZCgnY2FsZW5kYXItZXZlbnQtbG9jYXRpb24nKTtcbiAgICAgICAgY2FsZW5kYXJFdmVudExvY2F0aW9uLmlubmVyVGV4dCA9IChfYSA9IGV2ZW50LmxvY2F0aW9uKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAnJztcbiAgICAgICAgY2FsZW5kYXJFdmVudERldGFpbHMuYXBwZW5kQ2hpbGQoY2FsZW5kYXJFdmVudExvY2F0aW9uKTtcbiAgICAgICAgdGhpcy5fYWRkRGlhbG9nVG9FdmVudChjYWxlbmRhckV2ZW50KTtcbiAgICAgICAgcmV0dXJuIGNhbGVuZGFyRXZlbnQ7XG4gICAgfVxuICAgIF9hZGREaWFsb2dUb0V2ZW50KGV2ZW50RWxlbWVudCkge1xuICAgICAgICBldmVudEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgZXZlbnRcIiwgZXZlbnRFbGVtZW50KTtcbiAgICAgICAgICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpYWxvZycpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoJ2NhbGVuZGFyLWV2ZW50LWRpYWxvZycpO1xuICAgICAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZShcImRhdGEtZXZlbnQta2luZFwiLCAoX2EgPSBldmVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1ldmVudC1raW5kXCIpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBcImV2ZW50XCIpO1xuICAgICAgICAgICAgY29uc3QgZGlhbG9nQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGRpYWxvZ0Nsb3NlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2RpYWxvZy1jbG9zZS1idXR0b24nKTtcbiAgICAgICAgICAgIGRpYWxvZ0Nsb3NlQnV0dG9uLmlubmVySFRNTCA9ICcmdGltZXM7JztcbiAgICAgICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChkaWFsb2dDbG9zZUJ1dHRvbik7XG4gICAgICAgICAgICBjb25zdCBkaWFsb2dDb250ZW50cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZGlhbG9nQ29udGVudHMuY2xhc3NMaXN0LmFkZCgnZXZlbnQtZGlhbG9nLWNvbnRlbnRzJyk7XG4gICAgICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoZGlhbG9nQ29udGVudHMpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBldmVudEVsZW1lbnQuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBkaWFsb2dDb250ZW50cy5hcHBlbmRDaGlsZChjaGlsZC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlhbG9nQ29udGVudHMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXYpID0+IHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgZGlhbG9nLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgICAgICAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkRGlhbG9nVG9FdmVudHMoKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuX2NhbGVuZGFyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NhbGVuZGFyLWV2ZW50Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGV2ZW50c1tpXTtcbiAgICAgICAgICAgIHRoaXMuX2FkZERpYWxvZ1RvRXZlbnQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5DYWxlbmRhclVJID0gQ2FsZW5kYXJVSTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5JbmZvQmFyc1VJID0gdm9pZCAwO1xuY2xhc3MgSW5mb0JhcnNVSSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2luZm9FbGVtZW50cyA9IHtcbiAgICAgICAgICAgIGhvc3RuYW1lOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5mby1ob3N0bmFtZScpLFxuICAgICAgICAgICAgdmVyc2lvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8tdmVyc2lvbicpLFxuICAgICAgICAgICAgY2xvY2s6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbmZvLWNsb2NrJyksXG4gICAgICAgICAgICBkYXRlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5mby1kYXRlJyksXG4gICAgICAgICAgICBuZXR3b3JrSWNvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8tbmV0d29yay1pY29uJyksXG4gICAgICAgICAgICBkZWJ1ZzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8tZGVidWcnKSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fcG9wdWxhdGVJbmZvRWxlbWVudHMoKTtcbiAgICB9XG4gICAgc2V0RGVidWdJbmZvKGluZm8pIHtcbiAgICAgICAgdGhpcy5faW5mb0VsZW1lbnRzLmRlYnVnLmlubmVyVGV4dCA9IGluZm87XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJDaGFuZ2VkIHRleHQgaW4gZGVidWcgaW5mbzogXCIsIGluZm8pO1xuICAgIH1cbiAgICBfcG9wdWxhdGVJbmZvRWxlbWVudHMoKSB7XG4gICAgICAgIHRoaXMuX2luZm9FbGVtZW50cy5kZWJ1Zy5pbm5lclRleHQgPSAnJztcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9pbmZvRWxlbWVudHMuZGVidWcuaW5uZXJUZXh0ICs9IGV2ZW50LmVycm9yICsgJ1xcbic7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9pbmZvRWxlbWVudHMudmVyc2lvbi5pbm5lclRleHQgPSB3aW5kb3cuZGF0YS5wa2dOYW1lICsgXCIgdlwiICsgd2luZG93LmRhdGEucGtnVmVyc2lvbjtcbiAgICAgICAgdGhpcy5faW5mb0VsZW1lbnRzLmhvc3RuYW1lLmlubmVyVGV4dCA9IHdpbmRvdy5kYXRhLmhvc3RuYW1lO1xuICAgICAgICB0aGlzLl91cGRhdGVDbG9jaygpO1xuICAgICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLl91cGRhdGVDbG9jaygpLCAxMDAwKTtcbiAgICAgICAgdGhpcy5faW5mb0VsZW1lbnRzLm5ldHdvcmtJY29uLmNsYXNzTGlzdC50b2dnbGUoXCJvZmZsaW5lXCIsICFuYXZpZ2F0b3Iub25MaW5lKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvbmxpbmVcIiwgKCkgPT4gdGhpcy5faW5mb0VsZW1lbnRzLm5ldHdvcmtJY29uLmNsYXNzTGlzdC5yZW1vdmUoXCJvZmZsaW5lXCIpKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvZmZsaW5lXCIsICgpID0+IHRoaXMuX2luZm9FbGVtZW50cy5uZXR3b3JrSWNvbi5jbGFzc0xpc3QuYWRkKFwib2ZmbGluZVwiKSk7XG4gICAgfVxuICAgIF91cGRhdGVDbG9jaygpIHtcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcy5faW5mb0VsZW1lbnRzLmRhdGUuaW5uZXJUZXh0ID0gbm93LnRvTG9jYWxlU3RyaW5nKCdlbi1OTCcsIHsgZGF0ZVN0eWxlOiAnbWVkaXVtJyB9KTtcbiAgICAgICAgdGhpcy5faW5mb0VsZW1lbnRzLmNsb2NrLmlubmVyVGV4dCA9IG5vdy50b0xvY2FsZVN0cmluZygnZW4tTkwnLCB7IHRpbWVTdHlsZTogJ21lZGl1bScgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5JbmZvQmFyc1VJID0gSW5mb0JhcnNVSTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5VSVNjcmVlbiA9IHZvaWQgMDtcbmNsYXNzIFVJU2NyZWVuIHtcbiAgICBjb25zdHJ1Y3RvcihhdXRoKSB7XG4gICAgICAgIHRoaXMuX2Zvcm1TaG93biA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9hdXRoID0gYXV0aDtcbiAgICB9XG4gICAgO1xuICAgIF9jb25uZWN0RXZlbnRzKCkge1xuICAgICAgICB0aGlzLl9hdXRoLmF1dGhFdmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgfVxuICAgIF9kaXNjb25uZWN0RXZlbnRzKCkge1xuICAgICAgICB0aGlzLl9hdXRoLmF1dGhFdmVudHMgPSBudWxsO1xuICAgIH1cbiAgICBzaG93Rm9ybSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9mb3JtU2hvd24pIHtcbiAgICAgICAgICAgIHRoaXMuX2Zvcm1TaG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9mb3JtLmZvcm0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0VG9Gb2N1c09uID0gdGhpcy5fZ2V0SW5wdXRUb0ZvY3VzT24oKTtcbiAgICAgICAgICAgIGlmIChpbnB1dFRvRm9jdXNPbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlucHV0VG9Gb2N1c09uLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0RXZlbnRzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaGlkZUZvcm0oKSB7XG4gICAgICAgIGlmICh0aGlzLl9mb3JtU2hvd24pIHtcbiAgICAgICAgICAgIHRoaXMuX2Zvcm1TaG93biA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZm9ybS5mb3JtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RFdmVudHMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgZm9ybVNob3duKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZm9ybVNob3duO1xuICAgIH1cbiAgICBfZGlzYWJsZUZvcm0oKSB7XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBPYmplY3QudmFsdWVzKHRoaXMuX2Zvcm0pKSB7XG4gICAgICAgICAgICBpZiAoXCJkaXNhYmxlZFwiIGluIGVsZW1lbnQgJiYgdHlwZW9mIGVsZW1lbnQuZGlzYWJsZWQgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9lbmFibGVGb3JtKGZvY3VzRWxlbWVudCA9IG51bGwpIHtcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIE9iamVjdC52YWx1ZXModGhpcy5fZm9ybSkpIHtcbiAgICAgICAgICAgIGlmIChcImRpc2FibGVkXCIgaW4gZWxlbWVudCAmJiB0eXBlb2YgZWxlbWVudC5kaXNhYmxlZCA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvY3VzRWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZm9jdXNFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLlVJU2NyZWVuID0gVUlTY3JlZW47XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5FeGFtTW9kZVVJID0gdm9pZCAwO1xuY29uc3Qgc2NyZWVuXzEgPSByZXF1aXJlKFwiLi4vc2NyZWVuXCIpO1xuY2xhc3MgRXhhbU1vZGVVSSBleHRlbmRzIHNjcmVlbl8xLlVJU2NyZWVuIHtcbiAgICBjb25zdHJ1Y3RvcihhdXRoLCBsb2dpblVJKSB7XG4gICAgICAgIHN1cGVyKGF1dGgpO1xuICAgICAgICB0aGlzLl9leGFtTW9kZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9leGFtSWRzID0gW107XG4gICAgICAgIHRoaXMuX2V4YW1TdGFydEJ1dHRvbkVuYWJsZUludGVydmFsID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZXhhbVN0YXJ0VGltZSA9IG5ldyBEYXRlKFwiMjA5OS0wMS0wMVQwMDowMDowMFpcIik7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uU3RhcnQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlRm9ybSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uQ29tcGxldGU6ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgYXV0aGVudGljYXRpb25GYWlsdXJlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlRm9ybSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3dpZ2dsZVBhc3N3b3JkSW5wdXQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgYWxlcnQobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgd2luZG93LnVpLnNldERlYnVnSW5mbyhtZXNzYWdlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbmZvTWVzc2FnZTogKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICBhbGVydChtZXNzYWdlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2xvZ2luU2NyZWVuID0gbG9naW5VSTtcbiAgICAgICAgdGhpcy5fZm9ybSA9IHtcbiAgICAgICAgICAgIGZvcm06IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleGFtLWZvcm0nKSxcbiAgICAgICAgICAgIGV4YW1Qcm9qZWN0c1RleHQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleGFtLW1vZGUtcHJvamVjdHMnKSxcbiAgICAgICAgICAgIGV4YW1TdGFydFRleHQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleGFtLW1vZGUtc3RhcnQnKSxcbiAgICAgICAgICAgIGV4YW1FbmRUZXh0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXhhbS1tb2RlLWVuZCcpLFxuICAgICAgICAgICAgZXhhbVN0YXJ0QnV0dG9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXhhbS1tb2RlLXN0YXJ0LWJ1dHRvbicpLFxuICAgICAgICAgICAgZXhhbVN0YXJ0VGltZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleGFtLW1vZGUtc3RhcnQtdGltZXInKSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faW5pdEZvcm0oKTtcbiAgICB9XG4gICAgZW5hYmxlRXhhbU1vZGUoZXhhbXMpIHtcbiAgICAgICAgaWYgKGV4YW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V4YW1Nb2RlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fZXhhbUlkcyA9IGV4YW1zLm1hcCgoZXhhbSkgPT4gZXhhbS5pZCk7XG4gICAgICAgIHRoaXMuX3BvcHVsYXRlRGF0YShleGFtcyk7XG4gICAgICAgIHRoaXMuX2xvZ2luU2NyZWVuLmhpZGVGb3JtKCk7XG4gICAgICAgIHRoaXMuc2hvd0Zvcm0oKTtcbiAgICB9XG4gICAgZGlzYWJsZUV4YW1Nb2RlKCkge1xuICAgICAgICB0aGlzLl9leGFtTW9kZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9leGFtSWRzID0gW107XG4gICAgICAgIHRoaXMuX3BvcHVsYXRlRGF0YShbXSk7XG4gICAgICAgIHRoaXMuaGlkZUZvcm0oKTtcbiAgICAgICAgdGhpcy5fbG9naW5TY3JlZW4uc2hvd0Zvcm0oKTtcbiAgICB9XG4gICAgZ2V0IGV4YW1Nb2RlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXhhbU1vZGU7XG4gICAgfVxuICAgIGdldCBleGFtSWRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXhhbUlkcztcbiAgICB9XG4gICAgX2luaXRGb3JtKCkge1xuICAgICAgICBjb25zdCBmb3JtID0gdGhpcy5fZm9ybTtcbiAgICAgICAgZm9ybS5leGFtU3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5fZXhhbU1vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hdXRoLmxvZ2luKEV4YW1Nb2RlVUkuRVhBTV9VU0VSTkFNRSwgRXhhbU1vZGVVSS5FWEFNX1BBU1NXT1JEKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9jbGVhckV4YW1TdGFydFRpbWVyKCkge1xuICAgICAgICBjb25zdCBmb3JtID0gdGhpcy5fZm9ybTtcbiAgICAgICAgaWYgKHRoaXMuX2V4YW1TdGFydEJ1dHRvbkVuYWJsZUludGVydmFsKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fZXhhbVN0YXJ0QnV0dG9uRW5hYmxlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhpcy5fZXhhbVN0YXJ0QnV0dG9uRW5hYmxlSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGZvcm0uZXhhbVN0YXJ0VGltZXIuaW5uZXJUZXh0ID0gXCJDbGljayB0aGUgYXJyb3cgYmVsb3cgdG8gc3RhcnQgeW91ciBleGFtLlwiO1xuICAgICAgICB0aGlzLl9lbmFibGVPckRpc2FibGVTdWJtaXRCdXR0b24oKTtcbiAgICB9XG4gICAgX3BvcHVsYXRlRGF0YShleGFtc1RvUG9wdWxhdGUpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBmb3JtID0gdGhpcy5fZm9ybTtcbiAgICAgICAgaWYgKGV4YW1zVG9Qb3B1bGF0ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGZvcm0uZXhhbVByb2plY3RzVGV4dC5pbm5lclRleHQgPSAnJztcbiAgICAgICAgICAgIGZvcm0uZXhhbVN0YXJ0VGV4dC5pbm5lclRleHQgPSAndW5rbm93bic7XG4gICAgICAgICAgICBmb3JtLmV4YW1FbmRUZXh0LmlubmVyVGV4dCA9ICd1bmtub3duJztcbiAgICAgICAgICAgIHRoaXMuX2V4YW1TdGFydFRpbWUgPSBuZXcgRGF0ZShcIjIwOTktMDEtMDFUMDA6MDA6MDBaXCIpO1xuICAgICAgICAgICAgdGhpcy5fY2xlYXJFeGFtU3RhcnRUaW1lcigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXhhbXMgPSAoX2EgPSB3aW5kb3cuZGF0YS5kYXRhSnNvbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmV4YW1zLmZpbHRlcigoZXhhbSkgPT4gZXhhbXNUb1BvcHVsYXRlLnNvbWUoKGV4YW1Ub1BvcHVsYXRlKSA9PiBleGFtLmlkID09PSBleGFtVG9Qb3B1bGF0ZS5pZCkpO1xuICAgICAgICAgICAgaWYgKGV4YW1zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cudWkuc2V0RGVidWdJbmZvKCdGYWlsZWQgdG8gZmluZCBleGFtcyBpbiBkYXRhLmpzb24nKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBlYXJsaWVzdEV4YW0gPSBleGFtcy5yZWR1Y2UoKGVhcmxpZXN0LCBleGFtKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYmVnaW5BdCA9IG5ldyBEYXRlKGV4YW0uYmVnaW5fYXQpO1xuICAgICAgICAgICAgICAgIGlmIChlYXJsaWVzdCA9PT0gbnVsbCB8fCBiZWdpbkF0IDwgZWFybGllc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlZ2luQXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBlYXJsaWVzdDtcbiAgICAgICAgICAgIH0sIG5ldyBEYXRlKGV4YW1zWzBdLmJlZ2luX2F0KSk7XG4gICAgICAgICAgICBjb25zdCBsYXRlc3RFeGFtID0gZXhhbXMucmVkdWNlKChsYXRlc3QsIGV4YW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmRBdCA9IG5ldyBEYXRlKGV4YW0uZW5kX2F0KTtcbiAgICAgICAgICAgICAgICBpZiAobGF0ZXN0ID09PSBudWxsIHx8IGVuZEF0ID4gbGF0ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbmRBdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhdGVzdDtcbiAgICAgICAgICAgIH0sIG5ldyBEYXRlKGV4YW1zWzBdLmVuZF9hdCkpO1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdHNUZXh0ID0gZXhhbXMuZmxhdE1hcCgoZXhhbSkgPT4gZXhhbS5wcm9qZWN0cy5tYXAoKHByb2plY3QpID0+IHByb2plY3QubmFtZSkpLmpvaW4oJywgJyk7XG4gICAgICAgICAgICBmb3JtLmV4YW1Qcm9qZWN0c1RleHQuaW5uZXJUZXh0ID0gcHJvamVjdHNUZXh0O1xuICAgICAgICAgICAgZm9ybS5leGFtU3RhcnRUZXh0LmlubmVyVGV4dCA9IGVhcmxpZXN0RXhhbS50b0xvY2FsZVRpbWVTdHJpbmcoXCJlbi1OTFwiLCB7IGhvdXI6ICcyLWRpZ2l0JywgbWludXRlOiAnMi1kaWdpdCcgfSk7XG4gICAgICAgICAgICBmb3JtLmV4YW1FbmRUZXh0LmlubmVyVGV4dCA9IGxhdGVzdEV4YW0udG9Mb2NhbGVUaW1lU3RyaW5nKFwiZW4tTkxcIiwgeyBob3VyOiAnMi1kaWdpdCcsIG1pbnV0ZTogJzItZGlnaXQnIH0pO1xuICAgICAgICAgICAgdGhpcy5fY2xlYXJFeGFtU3RhcnRUaW1lcigpO1xuICAgICAgICAgICAgdGhpcy5fZXhhbVN0YXJ0VGltZSA9IGVhcmxpZXN0RXhhbTtcbiAgICAgICAgICAgIHRoaXMuX2VuYWJsZU9yRGlzYWJsZVN1Ym1pdEJ1dHRvbigpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2V4YW1TdGFydFRpbWUuZ2V0VGltZSgpID4gRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V4YW1TdGFydEJ1dHRvbkVuYWJsZUludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lTGVmdCA9IE1hdGguZmxvb3IoKHRoaXMuX2V4YW1TdGFydFRpbWUuZ2V0VGltZSgpIC0gRGF0ZS5ub3coKSkgLyAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IodGltZUxlZnQgLyA2MCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlY29uZHMgPSB0aW1lTGVmdCAlIDYwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3JtYXR0ZWRUaW1lID0gYCR7KG1pbnV0ZXMgPiAwID8gYCR7bWludXRlc30gbWludXRlcyBhbmQgYCA6ICcnKX0gJHtzZWNvbmRzfSBzZWNvbmRzYDtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5leGFtU3RhcnRUaW1lci5pbm5lclRleHQgPSBgWW91IG1heSBzdGFydCB5b3VyIGV4YW0gaW4gJHtmb3JtYXR0ZWRUaW1lfS5gO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZXhhbVN0YXJ0VGltZS5nZXRUaW1lKCkgPD0gRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJFeGFtU3RhcnRUaW1lcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2VuYWJsZU9yRGlzYWJsZVN1Ym1pdEJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgZm9ybSA9IHRoaXMuX2Zvcm07XG4gICAgICAgIGNvbnN0IGJ1dHRvbkRpc2FibGVkID0gdGhpcy5fZXhhbVN0YXJ0VGltZS5nZXRUaW1lKCkgPiBEYXRlLm5vdygpO1xuICAgICAgICBmb3JtLmV4YW1TdGFydEJ1dHRvbi5kaXNhYmxlZCA9IGJ1dHRvbkRpc2FibGVkO1xuICAgICAgICBpZiAoIWJ1dHRvbkRpc2FibGVkKSB7XG4gICAgICAgICAgICBmb3JtLmV4YW1TdGFydFRpbWVyLmlubmVyVGV4dCA9IFwiQ2xpY2sgdGhlIGFycm93IGJlbG93IHRvIHN0YXJ0IHlvdXIgZXhhbS5cIjtcbiAgICAgICAgICAgIGNvbnN0IGZvY3VzSW5wdXQgPSB0aGlzLl9nZXRJbnB1dFRvRm9jdXNPbigpO1xuICAgICAgICAgICAgaWYgKGZvY3VzSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBmb2N1c0lucHV0LmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1dHRvbkRpc2FibGVkO1xuICAgIH1cbiAgICBfd2lnZ2xlUGFzc3dvcmRJbnB1dChjbGVhcklucHV0ID0gdHJ1ZSkge1xuICAgICAgICB3aW5kb3cudWkuc2V0RGVidWdJbmZvKGBGYWlsZWQgdG8gbG9naW4gd2l0aCB1c2VybmFtZSBcIiR7RXhhbU1vZGVVSS5FWEFNX1VTRVJOQU1FfVwiIGFuZCBwYXNzd29yZCBcIiR7RXhhbU1vZGVVSS5FWEFNX1BBU1NXT1JEfVwiIHRvIHN0YXJ0IGFuIGV4YW0gc2Vzc2lvbmApO1xuICAgIH1cbiAgICBfZ2V0SW5wdXRUb0ZvY3VzT24oKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuRXhhbU1vZGVVSSA9IEV4YW1Nb2RlVUk7XG5FeGFtTW9kZVVJLkVYQU1fVVNFUk5BTUUgPSAnZXhhbSc7XG5FeGFtTW9kZVVJLkVYQU1fUEFTU1dPUkQgPSAnZXhhbSc7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Mb2NrU2NyZWVuVUkgPSB2b2lkIDA7XG5jb25zdCBzY3JlZW5fMSA9IHJlcXVpcmUoXCIuLi9zY3JlZW5cIik7XG5jb25zdCB1aV8xID0gcmVxdWlyZShcIi4uLy4uL3VpXCIpO1xuY29uc3QgUEFUSF9MT0NLX1RJTUVTVEFNUF9QUkVGSVggPSAnL3RtcC9jb2RhbV93ZWJfZ3JlZXRlcl9sb2NrX3RpbWVzdGFtcCc7XG5jbGFzcyBMb2NrU2NyZWVuVUkgZXh0ZW5kcyBzY3JlZW5fMS5VSVNjcmVlbiB7XG4gICAgY29uc3RydWN0b3IoYXV0aCwgYWN0aXZlU2Vzc2lvbikge1xuICAgICAgICBzdXBlcihhdXRoKTtcbiAgICAgICAgdGhpcy5faXNFeGFtTW9kZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9sb2NrZWRUaW1lID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0ge1xuICAgICAgICAgICAgYXV0aGVudGljYXRpb25TdGFydDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVGb3JtKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXV0aGVudGljYXRpb25Db21wbGV0ZTogKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBhdXRoZW50aWNhdGlvbkZhaWx1cmU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVGb3JtKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fd2lnZ2xlUGFzc3dvcmRJbnB1dCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICBhbGVydChtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cudWkuc2V0RGVidWdJbmZvKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluZm9NZXNzYWdlOiAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgIGFsZXJ0KG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fYWN0aXZlU2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb247XG4gICAgICAgIHRoaXMuX2Zvcm0gPSB7XG4gICAgICAgICAgICBmb3JtOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9jay1mb3JtJyksXG4gICAgICAgICAgICBhdmF0YXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY3RpdmUtdXNlci1zZXNzaW9uLWF2YXRhcicpLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY3RpdmUtdXNlci1zZXNzaW9uLWRpc3BsYXktbmFtZScpLFxuICAgICAgICAgICAgbG9naW5OYW1lOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWN0aXZlLXVzZXItc2Vzc2lvbi1sb2dpbi1uYW1lJyksXG4gICAgICAgICAgICBsb2NrZWRUaW1lQWdvOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWN0aXZlLXVzZXItc2Vzc2lvbi1sb2NrZWQtYWdvJyksXG4gICAgICAgICAgICBwYXNzd29yZElucHV0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWN0aXZlLXVzZXItc2Vzc2lvbi1wYXNzd29yZCcpLFxuICAgICAgICAgICAgdW5sb2NrQnV0dG9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndW5sb2NrLWJ1dHRvbicpLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9pbml0Rm9ybSgpO1xuICAgICAgICBzZXRJbnRlcnZhbCh0aGlzLl9nZXRBbmRTZXRMb2NrZWRUaW1lc3RhbXAuYmluZCh0aGlzKSwgNjAwMDApO1xuICAgICAgICB0aGlzLl9nZXRBbmRTZXRMb2NrZWRUaW1lc3RhbXAoKTtcbiAgICB9XG4gICAgX2luaXRGb3JtKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtID0gdGhpcy5fZm9ybTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hY3RpdmVTZXNzaW9uLnVzZXJuYW1lID09PSBcImV4YW1cIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzRXhhbU1vZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGZvcm0uYXZhdGFyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICBmb3JtLmRpc3BsYXlOYW1lLmlubmVyVGV4dCA9IFwiRXhhbSBpbiBwcm9ncmVzc1wiO1xuICAgICAgICAgICAgICAgIGZvcm0ubG9naW5OYW1lLmlubmVyVGV4dCA9IFwiQ2xpY2sgdGhlIGFycm93IGJlbG93IHRvIHJlc3VtZSB5b3VyIGV4YW0uXCI7XG4gICAgICAgICAgICAgICAgZm9ybS5sb2dpbk5hbWUuc3R5bGUubWFyZ2luVG9wID0gdWlfMS5VSS5nZXRQYWRkaW5nKCk7XG4gICAgICAgICAgICAgICAgZm9ybS5wYXNzd29yZElucHV0LnZhbHVlID0gXCJleGFtXCI7XG4gICAgICAgICAgICAgICAgZm9ybS5wYXNzd29yZElucHV0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVPckRpc2FibGVTdWJtaXRCdXR0b24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcm0uYXZhdGFyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmb3JtLmF2YXRhci5zcmMgPSBcImFzc2V0cy9kZWZhdWx0LXVzZXIucG5nXCI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHlpZWxkIHdpbmRvdy5kYXRhLnVzZXJJbWFnZS5leGlzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5hdmF0YXIuc3JjID0gd2luZG93LmRhdGEudXNlckltYWdlLnBhdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX2FjdGl2ZVNlc3Npb24uaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5hdmF0YXIuc3JjID0gdGhpcy5fYWN0aXZlU2Vzc2lvbi5pbWFnZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoeWllbGQgd2luZG93LmRhdGEudXNlckRlZmF1bHRJbWFnZS5leGlzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5hdmF0YXIuc3JjID0gd2luZG93LmRhdGEudXNlckRlZmF1bHRJbWFnZS5wYXRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3JtLmRpc3BsYXlOYW1lLmlubmVyVGV4dCA9IChfYSA9IHRoaXMuX2FjdGl2ZVNlc3Npb24uZGlzcGxheV9uYW1lKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiB0aGlzLl9hY3RpdmVTZXNzaW9uLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIGZvcm0ubG9naW5OYW1lLmlubmVyVGV4dCA9IHRoaXMuX2FjdGl2ZVNlc3Npb24udXNlcm5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRJbnRlcnZhbCh0aGlzLl9sb2NrZWRUaW1lci5iaW5kKHRoaXMpLCAxMDAwMCk7XG4gICAgICAgICAgICBmb3JtLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hdXRoLmxvZ2luKHRoaXMuX2FjdGl2ZVNlc3Npb24udXNlcm5hbWUsIGZvcm0ucGFzc3dvcmRJbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvcm0ucGFzc3dvcmRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVPckRpc2FibGVTdWJtaXRCdXR0b24oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2VuYWJsZU9yRGlzYWJsZVN1Ym1pdEJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgZm9ybSA9IHRoaXMuX2Zvcm07XG4gICAgICAgIGNvbnN0IGJ1dHRvbkRpc2FibGVkID0gZm9ybS5wYXNzd29yZElucHV0LnZhbHVlID09PSBcIlwiICYmIHRoaXMuX2lzRXhhbU1vZGUgPT09IGZhbHNlO1xuICAgICAgICBmb3JtLnVubG9ja0J1dHRvbi5kaXNhYmxlZCA9IGJ1dHRvbkRpc2FibGVkO1xuICAgICAgICByZXR1cm4gYnV0dG9uRGlzYWJsZWQ7XG4gICAgfVxuICAgIF93aWdnbGVQYXNzd29yZElucHV0KGNsZWFySW5wdXQgPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IHBhc3N3b3JkSW5wdXQgPSB0aGlzLl9mb3JtLnBhc3N3b3JkSW5wdXQ7XG4gICAgICAgIHBhc3N3b3JkSW5wdXQuY2xhc3NMaXN0LmFkZCgnd2lnZ2xlJyk7XG4gICAgICAgIHBhc3N3b3JkSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsICgpID0+IHtcbiAgICAgICAgICAgIHBhc3N3b3JkSW5wdXQuY2xhc3NMaXN0LnJlbW92ZSgnd2lnZ2xlJyk7XG4gICAgICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKGNsZWFySW5wdXQpIHtcbiAgICAgICAgICAgIHBhc3N3b3JkSW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgcGFzc3dvcmRJbnB1dC5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlT3JEaXNhYmxlU3VibWl0QnV0dG9uKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2dldElucHV0VG9Gb2N1c09uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZm9ybS5wYXNzd29yZElucHV0O1xuICAgIH1cbiAgICBnZXQgbG9ja2VkVGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2tlZFRpbWU7XG4gICAgfVxuICAgIF9nZXRTY3JlZW5Mb2NrZWRUaW1lc3RhbXAobG9naW4pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZXN0YW1wID0gcmVxLnJlc3BvbnNlVGV4dC5zcGxpdCgnICcpWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBEYXRlKHBhcnNlSW50KHRpbWVzdGFtcCkgKiAxMDAwKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiTm8gdGltZXN0YW1wIGZvdW5kIGluIHJlc3BvbnNlXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXEub3BlbignR0VUJywgYCR7UEFUSF9MT0NLX1RJTUVTVEFNUF9QUkVGSVh9XyR7bG9naW59YCk7XG4gICAgICAgICAgICByZXEuc2VuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2dldEFuZFNldExvY2tlZFRpbWVzdGFtcCgpIHtcbiAgICAgICAgdGhpcy5fZ2V0U2NyZWVuTG9ja2VkVGltZXN0YW1wKHRoaXMuX2FjdGl2ZVNlc3Npb24udXNlcm5hbWUpXG4gICAgICAgICAgICAudGhlbigodGltZXN0YW1wKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9sb2NrZWRUaW1lID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgdGhpcy5fbG9ja2VkVGltZXIoKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9sb2NrZWRUaW1lID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9sb2NrZWRUaW1lcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9sb2NrZWRUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9nb3V0QWZ0ZXIgPSA2MDtcbiAgICAgICAgY29uc3QgbG9ja2VkTWludXRlc0FnbyA9IChEYXRlLm5vdygpIC0gdGhpcy5fbG9ja2VkVGltZS5nZXRUaW1lKCkpIC8gMTAwMCAvIDYwO1xuICAgICAgICBjb25zdCB0aW1lUmVtYWluaW5nID0gbG9nb3V0QWZ0ZXIgLSBsb2NrZWRNaW51dGVzQWdvO1xuICAgICAgICBpZiAodGltZVJlbWFpbmluZyA8PSAwLjI1KSB7XG4gICAgICAgICAgICB0aGlzLl9kaXNhYmxlRm9ybSgpO1xuICAgICAgICAgICAgdGhpcy5fZm9ybS5sb2NrZWRUaW1lQWdvLmlubmVyVGV4dCA9IFwiQXV0b21hdGVkIGxvZ291dCBpbiBwcm9ncmVzcy4uLlwiO1xuICAgICAgICAgICAgaWYgKHRpbWVSZW1haW5pbmcgPCAtNSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8oXCJBdXRvbWF0ZWQgbG9nb3V0IGFwcGVhcnMgdG8gdGFrZSBhIHdoaWxlLiBJcyB0aGUgc3lzdGVtZCBpZGxpbmcgc2VydmljZSBmcm9tIGNvZGFtLXdlYi1ncmVldGVyIGluc3RhbGxlZCBhbmQgZW5hYmxlZD9cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlRm9ybSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZmxvb3JlZFRpbWUgPSBNYXRoLmZsb29yKHRpbWVSZW1haW5pbmcpO1xuICAgICAgICAgICAgdGhpcy5fZm9ybS5sb2NrZWRUaW1lQWdvLmlubmVyVGV4dCA9IFwiQXV0b21hdGVkIGxvZ291dCBvY2N1cnMgaW4gXCIgKyBmbG9vcmVkVGltZS50b1N0cmluZygpICsgXCIgbWludXRlXCIgKyAoZmxvb3JlZFRpbWUgPT09IDEgPyBcIlwiIDogXCJzXCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5Mb2NrU2NyZWVuVUkgPSBMb2NrU2NyZWVuVUk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Mb2dpblNjcmVlblVJID0gdm9pZCAwO1xuY29uc3Qgc2NyZWVuXzEgPSByZXF1aXJlKFwiLi4vc2NyZWVuXCIpO1xuY2xhc3MgTG9naW5TY3JlZW5VSSBleHRlbmRzIHNjcmVlbl8xLlVJU2NyZWVuIHtcbiAgICBjb25zdHJ1Y3RvcihhdXRoKSB7XG4gICAgICAgIHN1cGVyKGF1dGgpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGlvblN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZUZvcm0oKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhdXRoZW50aWNhdGlvbkNvbXBsZXRlOiAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uRmFpbHVyZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZUZvcm0oKTtcbiAgICAgICAgICAgICAgICB0aGlzLl93aWdnbGVQYXNzd29yZElucHV0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgIGFsZXJ0KG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy51aS5zZXREZWJ1Z0luZm8obWVzc2FnZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW5mb01lc3NhZ2U6IChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgYWxlcnQobWVzc2FnZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9mb3JtID0ge1xuICAgICAgICAgICAgZm9ybTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLWZvcm0nKSxcbiAgICAgICAgICAgIGxvZ2luSW5wdXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbicpLFxuICAgICAgICAgICAgcGFzc3dvcmRJbnB1dDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkJyksXG4gICAgICAgICAgICBsb2dpbkJ1dHRvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLWJ1dHRvbicpLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9pbml0Rm9ybSgpO1xuICAgIH1cbiAgICBfaW5pdEZvcm0oKSB7XG4gICAgICAgIGNvbnN0IGZvcm0gPSB0aGlzLl9mb3JtO1xuICAgICAgICB0aGlzLl9mb3JtLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5fYXV0aC5sb2dpbihmb3JtLmxvZ2luSW5wdXQudmFsdWUsIGZvcm0ucGFzc3dvcmRJbnB1dC52YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBmb3JtLmxvZ2luSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9lbmFibGVPckRpc2FibGVTdWJtaXRCdXR0b24oKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvcm0ucGFzc3dvcmRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2VuYWJsZU9yRGlzYWJsZVN1Ym1pdEJ1dHRvbigpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2VuYWJsZU9yRGlzYWJsZVN1Ym1pdEJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgZm9ybSA9IHRoaXMuX2Zvcm07XG4gICAgICAgIGNvbnN0IGJ1dHRvbkRpc2FibGVkID0gZm9ybS5sb2dpbklucHV0LnZhbHVlLnRyaW0oKSA9PT0gXCJcIiB8fCBmb3JtLnBhc3N3b3JkSW5wdXQudmFsdWUgPT09IFwiXCI7XG4gICAgICAgIGZvcm0ubG9naW5CdXR0b24uZGlzYWJsZWQgPSBidXR0b25EaXNhYmxlZDtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbkRpc2FibGVkO1xuICAgIH1cbiAgICBfd2lnZ2xlUGFzc3dvcmRJbnB1dChjbGVhcklucHV0ID0gdHJ1ZSkge1xuICAgICAgICBjb25zdCBwYXNzd29yZElucHV0ID0gdGhpcy5fZm9ybS5wYXNzd29yZElucHV0O1xuICAgICAgICBwYXNzd29yZElucHV0LmNsYXNzTGlzdC5hZGQoJ3dpZ2dsZScpO1xuICAgICAgICBwYXNzd29yZElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoKSA9PiB7XG4gICAgICAgICAgICBwYXNzd29yZElucHV0LmNsYXNzTGlzdC5yZW1vdmUoJ3dpZ2dsZScpO1xuICAgICAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIGlmIChjbGVhcklucHV0KSB7XG4gICAgICAgICAgICBwYXNzd29yZElucHV0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgIHBhc3N3b3JkSW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuX2VuYWJsZU9yRGlzYWJsZVN1Ym1pdEJ1dHRvbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9nZXRJbnB1dFRvRm9jdXNPbigpIHtcbiAgICAgICAgY29uc3QgZm9ybSA9IHRoaXMuX2Zvcm07XG4gICAgICAgIGlmIChmb3JtLmxvZ2luSW5wdXQudmFsdWUudHJpbSgpID09PSBcIlwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZm9ybS5sb2dpbklucHV0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3JtLnBhc3N3b3JkSW5wdXQ7XG4gICAgfVxufVxuZXhwb3J0cy5Mb2dpblNjcmVlblVJID0gTG9naW5TY3JlZW5VSTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLldhbGxwYXBlclVJID0gdm9pZCAwO1xuY2xhc3MgV2FsbHBhcGVyVUkge1xuICAgIGNvbnN0cnVjdG9yKGlzTG9ja1NjcmVlbiwgd2FsbHBhcGVyRWxlbWVudCA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IHdhbGxwYXBlckVsZW1lbnQgIT09IG51bGwgJiYgd2FsbHBhcGVyRWxlbWVudCAhPT0gdm9pZCAwID8gd2FsbHBhcGVyRWxlbWVudCA6IGRvY3VtZW50LmJvZHk7XG4gICAgICAgIHRoaXMuX2JsdXJGaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmx1ci1maWx0ZXInKTtcbiAgICAgICAgdGhpcy5faXNMb2NrU2NyZWVuID0gaXNMb2NrU2NyZWVuO1xuICAgICAgICB0aGlzLmRpc3BsYXlXYWxscGFwZXIoKTtcbiAgICB9XG4gICAgZGlzcGxheVdhbGxwYXBlcigpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGxldCB3YWxscGFwZXIgPSB3aW5kb3cuZGF0YS5sb2dpblNjcmVlbldhbGxwYXBlcjtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0xvY2tTY3JlZW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ibHVyRmlsdGVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIGlmICh5aWVsZCB3aW5kb3cuZGF0YS51c2VyTG9ja1NjcmVlbldhbGxwYXBlci5leGlzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgd2FsbHBhcGVyID0gd2luZG93LmRhdGEudXNlckxvY2tTY3JlZW5XYWxscGFwZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHlpZWxkIHdhbGxwYXBlci5leGlzdHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoXCInICsgd2FsbHBhcGVyLnBhdGggKyAnXCIpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5fZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZSgnLS1kZWZhdWx0LWJnLWltZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuV2FsbHBhcGVyVUkgPSBXYWxscGFwZXJVSTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9jbGllbnQvbWFpbi50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==