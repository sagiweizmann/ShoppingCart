// Contains:
// Loader
// APIHandler

/**
 * APIManager to manage API calls
 */
class APIManager {
    constructor(loader = app.loader, title = "Shopping List") {
        // Step 1: Store site title reference
        document.title = title;
        this.main_title = title;
        // Step 2: Set default loader
        APIManager.Loader.changeLoader("main", loader);
        // Step 3: Initialize
        APIManager.Loader.message("Loading System");
        this.initialize();
    }

    setSubtitle(sub_title) {
        document.title = this.main_title + " | " + sub_title;
    }

    removeSubtitle() {
        document.title = this.main_title;
    }

    initialize() {
        APIManager.Loader.show("main"); // Show main loader
        
        APIManager.Loader.load((resolve, reject) => {
            // Load components
            APIManager.API.getComponent("notifications", true);
            APIManager.API.getComponent("footer", true);
            APIManager.API.getComponent("navigator", true);
            APIManager.API.getComponent("loader", true);

            // Load default pages
            APIManager.routes.push({
                path: '/main',
                component: APIManager.API.getPage("main", true)
            });
            resolve(0);
        });
    };
};

/**
 * Loader manages loading stages in your page.
 * It is an algorithmic representation for managing loaders as objects that are binded to the view by a view-model (VueJS, ReactJS, Angualr...)
 * It can load all the operations requested in managed timing (using chain processes and more).
 * The algorithmics of the Loader focuses mostly on the variable "processes" present in the loader object, which is a counter
 * of the number of running processes, this counter is incremented when a loader is called, and decremented when a process is finished
 */
class Loader {
    constructor() {
        // Collection of the loaders in the screen
        this.loader_manager = {};
        // Currently selected loader key
        this.current_loader = "";
    }

    /**
     * Connect the loader object to a different loader
     * @param {String} name The name to identify the loader by
     * @param {Object} new_loader The loader variable to track, in the format of { visible: Boolean, message: String }
     */
    changeLoader(name, new_loader = {}) {
        // Create a loader if doesn't exists
        this.addLoader(name, new_loader);

        // Change loader used
        this.current_loader = name;
    }

    /**
     * Add loader object to collection
     * @param {String} name The name to identify the loader by
     * @param {Object} new_loader The loader variable to track, in the format of { visible: Boolean, message: String }
     */
    addLoader(name, new_loader = {}) {
        if(this.loader_manager[name] === undefined && new_loader == null) return;
        else if(this.loader_manager[name] === undefined) {
            let current = this.loaderExists(new_loader);
            if(current !== false)
            {
                Object.defineProperty(this.loader_manager, current, Object.getOwnPropertyDescriptor(this.loader_manager, name));
                delete this.loader_manager[current];
            } else {
                // Attach loader and create process counter
                this.loader_manager[name] = new_loader;
                this.loader_manager[name].processes = 0;
                this.loader_manager[name].promise = null;
                if(this.loader_manager[name].visible === undefined) this.loader_manager[name].visible = false;
                if(this.loader_manager[name].message === undefined) this.loader_manager[name].message = "";
            }
        }
        else if(this.loader_manager[name] !== new_loader && new_loader != null)
        {
            // Close previous loader
            this.loader_manager[name].visible = false;
            // Change loader
            this.loader_manager[name] = new_loader;
            // Pass loading state to new loader
            this.loader_manager[name].visible = this.loader_manager[name].processes == 0;
        }
    }

    /**
     * Check if loader already present
     * @returns {String/Boolean} False or the key of the existing loader
     */
    loaderExists(loader = {}) {
        for(let key in this.loader_manager) {
            if(this.loader_manager[key] === loader) return key;
        }
        return false;
    }

    /**
     * Toggle the view of the loader
     */
    toggle(loader_name = this.current_loader) {
        if (this.loader_manager[loader_name].visible) this.close(loader_name);
        else this.show(loader_name);
    }

    /**
     * Show the loader in view
     */
    show(loader_name = this.current_loader) {
        if(!this.loader_manager[loader_name].visible) this.loader_manager[loader_name].visible = true;
    }

    /**
     * Remove loader from view
     */
    close(loader_name = this.current_loader) {
        if(this.loader_manager[loader_name].processes > 0) this.loader_manager[loader_name].processes--;
        if(this.loader_manager[loader_name].processes == 0 && this.loader_manager[loader_name].visible) this.loader_manager[loader_name].visible = false;
    }

    /**
     * Load a function and show the loader if defined
     * @param {Function} handlerMethod The method to run when loading
     * @param {String} loader_name The loader name to use at this loading
     * @param {Boolean} chain True to run sequencially by order of calls or false to run independently
     */
    load(handlerMethod = function(resolve, reject) { return resolve(0); }, loader_name = this.current_loader, chain = true) {
        // Promise is indepenent of any other promise so no need to keep
        let promiseHolder;

        // Integrate with promise chain in loader if not as chain
        if(chain)
        {
            promiseHolder = this.loader_manager[loader_name].promise;
            // Create a new promise if all processes finished
            if(promiseHolder == null || this.loader_manager[loader_name].processes == 0)
            {
                promiseHolder = new Promise(function (resolutionFunc) {
                    APIManager.Loader.show(loader_name);
                    resolutionFunc(0);
                });
            }
            else {
                promiseHolder.then((value) => {
                    APIManager.Loader.show(loader_name);
                    return value;
                });
            }
            this.loader_manager[loader_name].processes++;
        }
        else {
            promiseHolder = new Promise(function (resolutionFunc) { resolutionFunc(0); });
        }

        // Run user requested function
        let endResult = promiseHolder.then((value) => {
            // Skip processses
            if(value != 0 && value !== undefined && value != null) {
                APIManager.Loader.loader_manager[loader_name].processes--;
                return --value;
            }
            return new Promise(handlerMethod);
        }).then(function (value) {
            // When done close loader
            if (chain) APIManager.Loader.close(loader_name);
            return value;
        });

        if(chain) this.loader_manager[loader_name].promise = endResult;
        return endResult;
    }

    /**
     * Show loader for a defined amount of time
     * @param {number} ms Time to show the loader for
     * @param {fucntion} after Function to run after timer ends
     * @param {fucntion} before Function to run with timer
     * @param {boolean} loader_name Loader to use for operation
     */
    timer(ms, after = function() {}, before = function() {}, loader_name = this.current_loader) {
        APIManager.Loader.show(loader_name);
        setTimeout(function() {
            before();
            APIManager.Loader.close(loader_name);
            after();
        }, ms);
    }

    /**
     * Assign message to loader screen
     * @param {String} message The message to show
     */
    message(message, loader_name = this.current_loader) {
        this.loader_manager[loader_name].message = message;
    }
};

/**
 * APIHandler holds helper functions for communicating with the server
 * Holds API specific data & handling functions
 */
class APIHandler {
    constructor() {
        // Collection of the status codes available
        this.status_codes = {
            ERROR: 0,
            SUCCESS: 1,
            NO_AUTH: 2,
            NOT_INSTALLED: 3,
            DB_CONNECTION_FAILED: 4,
            INVALID_CONFIG_FILE: 5,
            WARNING: 6
        };
    }

    /**
     * Add a new function to the update loop
     * 
     * @param {string} name 
     * @param {function} func 
     */
    addUpdateFunction(name, func) {
        this.update_function[name] = func;
    }

    /**
     * Remove a function from the update loop given its name
     * 
     * @param {string} name 
     */
    removeUpdateFunction(name) {
        delete this.update_function[name];
    }

    /**
     * Clear set of update functions
     */
    clearUpdateFunctions() {
        delete this.update_function; // Make sure reference is deleted
        this.update_function = {};
    }

    /**
     * Returns the name of the status code given
     * @param {int} status_code 
     */
    getStatusName(status_code) {
        for(let StatusName in this.status_codes)
            if(this.status_codes[StatusName] == status_code) return StatusName;
        return "STATUS_CODE_NOT_FOUND";
    }

    /**
     * Retreive data from the API
     * 
     * @param {string} controller The controller to use
     * @param {string} method The method to call
     * @param {object} attached_data Data to send to the method
     * @param {function} HandlerMethod Function to handle the response or error
     * @param {boolean} chain Open loader until request finishes
     */
    request(method, attached_data, handlerMethod = function (response) {}, chain = true) {
        // Define request function without running it
        return APIManager.Loader.load((resolve, reject) => {
            handlerMethod(APIManager.server[method](attached_data));
            resolve(0);
        }, APIManager.Loader.current_loader, chain);
    }

    /**
     * Show live notification on screen
     * @param {string} message Message body of notification
     * @param {string} type Notification class
     * @param {int} timeout Time to wait till closing the notification
     */
    notify(message, type, timeout = 5000) {
        // If an alert exists then exit
        for (let alert in app.alerts) {
            if (app.alerts[alert].content == message && app.alerts[alert].color == type && app.alerts[alert].show)
                return;
        }

        // Used for the v-for loop as indicator for order
        let MyID = new Date().getTime();

        // Push alert
        app.alerts.push({
            color: type,
            content: message,
            show: true,
            id: MyID
        });

        // Close alert after timeout
        setTimeout(function (message) {
            for (let alert in app.alerts) {
                if (app.alerts[alert].content == message) {
                    app.alerts[alert].show = false;
                    app.alerts.splice(alert, 1);
                    return;
                }
            }
        }, timeout, message);
    }

    getUIFolder() {
        return "js";
    }

    /**
     * Get page vue element
     * @param {string} page_name Page name to get path to
     * @param {boolean} init Set true to retrieve element if not exists
     */
    getPage(page_name, init = false) {
        if(init && APIManager.pages[page_name] === undefined) APIManager.pages[page_name] = httpVueLoader(this.getUIFolder() + "/pages/" + page_name + ".vue");
        return APIManager.pages[page_name];
    }

    /**
     * Get component page element
     * @param {string} component_name Page name to get path to
     * @param {boolean} init Set true to retrieve element if not exists
     */
    getComponent(component_name, init = false) {
        if(init && APIManager.components[component_name] === undefined) APIManager.components[component_name] = httpVueLoader(this.getUIFolder() + "/components/" + component_name + ".vue");
        return APIManager.components[component_name];
    }

    hasOwnProperty(obj, prop) {
        var proto = Object.getPrototypeOf(obj) || obj.constructor.prototype;
        return (prop in obj) && (!(prop in proto) || proto[prop] !== obj[prop]);
    }
};

// Dummy Server
class Server {
    constructor() {
        Server.DbManager.createCollection("ShoppingList");
    }

    getShoppingList(data) {
        return Server.DbManager.getCollection("ShoppingList");
    }

    updateShoppingList(new_list) {
        return Server.DbManager.updateCollection("ShoppingList", new_list);
    }
}

/**
 * A very simple in memory database
 */
class InMemoryDB {
    constructor() {

    }

    createCollection(collection_name) {
        if(InMemoryDB.database.hasOwnProperty(collection_name)) {
            return {
                status: 0,
                data: "Collection exists"
            };
        }

        InMemoryDB.database[collection_name] = [];

        return {
            status: 1,
            data: ""
        };
        
    }

    getCollection(collection_name) {
        if(!InMemoryDB.database.hasOwnProperty(collection_name)) {
            return {
                status: 0,
                data: "Collection undefined"
            };
        }

        return {
            status: 1,
            data: "OK"
        };
    }

    updateCollection(collection_name, instance) {
        if(!InMemoryDB.database.hasOwnProperty(collection_name)) {
            return {
                status: 0,
                data: "Collection undefined"
            };
        }

        InMemoryDB.database[collection_name] = instance;
        return {
            status: 1,
            data: "OK"
        };
    }
}

Server.DbManager = new InMemoryDB();
InMemoryDB.database = {};

/**
 * Pages are loaded using the loader from the API
 */
APIManager.pages = {};
APIManager.routes = [];
APIManager.components = {};
/**
 * Helpers
 */
APIManager.server = new Server();
APIManager.Loader = new Loader();
APIManager.API = new APIHandler();