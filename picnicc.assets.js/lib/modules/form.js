(function(window) {
    var document = window.document;

    var self = blueprint = {

        _: function() {
            self._callbacks = {};
            this._mode;
            this._response;
            this._error;

            /**
             * @type HTMLElement
             */
            this._currentForm;

            /**
             * @type HTMLElement
             */
            this._currentBuildIdField;

            /**
             * @type HTMLElement
             */
            this._currentBuildIdSubmit;

            /**
             * @type HTMLElement
             */
            this._currentFields;

            this._enabled;

            return this;
        },

        init: function() {

            var buildForm = self.setBuildForm(picnicc.config.getBuildForm()).getBuildForm();

            if (!buildForm) {
                return this;
            }

            self.transmitEventListener(buildForm);
            self.enable(buildForm);

            var buildIdField = self.setBuildIdField(picnicc.config.getBuildIdField()).getBuildIdField();
            var buildIdSubmit = self.setBuildIdSubmit(picnicc.config.getBuildIdSubmit()).getBuildIdSubmit();

            if (buildIdField && buildIdSubmit) {
                self.retrieveEventListener(buildForm, buildIdField, buildIdSubmit);
            }

            return this;
        },

        setBuildForm: function(buildForm) {
            var form;

            if (!form) {
                form = picnicc.utility.$(buildForm);
            }

            if (!form) {
                form = document.forms[buildForm];
            }

            if (!form) {
                form = document.getElementById(buildForm);
            }

            if (!form) {
                form = document.getElementsByClassName(buildForm)[0];
            }

            if (!form) {
                form = picnicc.utility.$(buildForm);
            }

            self._currentForm = form;

            return this;
        },

        getBuildForm: function() {
            return self._currentForm;
        },

        setBuildIdField: function(buildIdField) {

            if (!self.getBuildForm()) {
                return this;
            }

            var field;

            if (!field) {
                field = picnicc.utility.$(buildIdField);
            }

            if (!field) {
                field = document.getElementById(buildIdField);
            }

            if (!field) {
                field = self.findName(buildIdField, self.getBuildForm().elements);
            }

            if (!field) {
                field = document.getElementsByClassName(buildIdField)[0];
            }

            self._currentBuildIdField = field;

            return this;
        },

        getBuildIdField: function() {
            return self._currentBuildIdField;
        },

        setBuildIdSubmit: function(buildIdSubmit) {

            if (!self.getBuildForm()) {
                return this;
            }

            var field;

            if (!field) {
                field = picnicc.utility.$(buildIdSubmit);
            }

            if (!field) {
                field = document.getElementById(buildIdSubmit);
            }

            if (!field) {
                field = self.findName(buildIdSubmit, self.getBuildForm().elements);
            }

            if (!field) {
                field = document.getElementsByClassName(buildIdSubmit)[0];
            }

            self._currentBuildIdSubmit = field;

            return this;
        },

        getBuildIdSubmit: function() {
            return self._currentBuildIdSubmit;
        },

        /**
         * Tries to find [name="$NAME"] in a series of fields
         */ 
        findName: function(name, fields) {
            var l = fields.length;
            for (var i = 0; i < l; i++) {
                if (fields[i].name === name) {
                    return fields[i];
                }
            };
            return false;
        },

        /**
         * Do we operate in a friendly environment?
         */
        enabled: function() {
            return self._enabled;
        },

        /**
         * Tells picnicc.form to quiet down
         */
        disable: function() {
            self._enabled = false;
        },

        /**
         * A few DOM manipulations if picnicc.form operates
         * in a friendly environment
         */
        enable: function(buildForm) {

            self._enabled = true;

            var if_success,
            if_error;

            if_success = self.findName("if_success", buildForm.elements);
            if_error = self.findName("if_error", buildForm.elements);

            if (if_success) {
                if_success.value = "200";
            }

            if (if_error) {
                if_error.parentNode.removeChild(if_error);
            }
        },

        retrieveEventListener: function(buildForm, buildIdField, buildIdSubmit, mode) {

            var fields = buildForm.elements;
            self._currentFields = fields;
            var fieldsLength = fields.length;

            var handler = function(e) {
                e.preventDefault();

                if ((self._callbacks[buildForm]) && (self._callbacks[buildForm][mode]) && (self._callbacks[buildForm][mode].begins) && picnicc.utility.isFunction(self._callbacks[buildForm][mode].begins)) {
                    self._callbacks[buildForm][mode].begins();
                }

                var params = picnicc.utility.serialize(buildForm).replace(picnicc.config.getBuildIdField(), "id");

                picnicc.xhr.request('GET', picnicc.config._retrieveEndpoint, params, function(code, response) {

                    var parsed = picnicc.xhr.response(true);

                    if (code === 422) {
                        var theError = {};
                        theError.raw = response;
                        theError.parsed = parsed;
                        theError.code = code;
                        theError.message = parsed.message;
                        theError.label = parsed.label;

                        self._error = theError;

                        if ((self._callbacks[buildForm]) && (self._callbacks[buildForm][mode]) && (self._callbacks[buildForm][mode].fail) && picnicc.utility.isFunction(self._callbacks[buildForm][mode].fail)) {
                            self._callbacks[buildForm][mode].fail(theError);
                        } else {
                            alert(theError.message);
                            return;
                        }
                    }

                    if (code === 200) {
                        var theResponse = {};
                        theResponse.raw = response;
                        theResponse.parsed = parsed;
                        theResponse.code = code;
                        theResponse.version = parsed.version;
                        theResponse.assets = parsed.assets;
                        theResponse.bits = parsed.bits;
                        theResponse.behavior = parsed.behavior;
                        theResponse.parse = parsed.parse;
                        theResponse.minify = parsed.minify;
                        theResponse.sass = parsed.sass;
                        theResponse.less = parsed.less;

                        self._response = theResponse;

                        if ((self._callbacks[buildForm]) && (self._callbacks[buildForm][mode]) && (self._callbacks[buildForm][mode].done) && picnicc.utility.isFunction(self._callbacks[buildForm][mode].done)) {
                            self._callbacks[buildForm][mode].done(theResponse);
                        } else {
                            for (var i = 0; i < fieldsLength; i++) {
                                if (fields[i]) {
                                    if (parsed.bits.indexOf(fields[i].value) !== -1) {
                                        fields[i].checked = true;
                                    } else {
                                        fields[i].checked = false;
                                    }
                                    if (parsed.assets.indexOf(fields[i].value) !== -1) {
                                        fields[i].checked = true;
                                    } else {
                                        fields[i].checked = false;
                                    }

                                }
                            }
                        }

                    }

                    if ((self._callbacks[buildForm]) && (self._callbacks[buildForm][mode]) && (self._callbacks[buildForm][mode].ends) && picnicc.utility.isFunction(self._callbacks[buildForm][mode].ends)) {
                        self._callbacks[buildForm][mode].ends();
                    }
                });
                return false;
            };

            buildIdSubmit.addEventListener("click", handler);

            return this;
        },

        whenRetrieve: function(args) {

            self._mode = "retrieve";

            // transitional arguments
            picnicc.config.topicalize(args);

            var buildForm = self.setBuildForm(picnicc.config.getBuildForm()).getBuildForm();

            if (!buildForm) {
                self.disable();
                return this;
            }

            var buildIdField = self.setBuildIdField(picnicc.config.getBuildIdField()).getBuildIdField();

            if (!buildIdField) {
                self.disable();
                return this;
            }

            var buildIdSubmit = self.setBuildIdSubmit(picnicc.config.getBuildIdSubmit()).getBuildIdSubmit();

            if (!buildIdSubmit) {
                self.disable();
                return this;
            }

            self.retrieveEventListener(buildForm, buildIdField, buildIdSubmit, self._mode);
            self.enable(buildForm);

            if (!self._callbacks[buildForm]) {
                self._callbacks[buildForm] = {};
            }
            self._callbacks[buildForm][self._mode] = {};

            // reset arguments
            picnicc.config.reset();

            return this;
        },

        transmitEventListener: function(buildForm, mode) {

            var handler = function(e) {
                e.preventDefault();

                if ((self._callbacks[buildForm]) && (self._callbacks[buildForm][mode]) && (self._callbacks[buildForm][mode].begins) && picnicc.utility.isFunction(self._callbacks[buildForm][mode].begins)) {
                    self._callbacks[buildForm][mode].begins();
                }

                picnicc.xhr.request('POST', picnicc.config._transmitEndpoint, picnicc.utility.serialize(buildForm), function(code, response) {

                    var parsed = picnicc.xhr.response(true);

                    if (code === 422) {
                        var theError = {};
                        theError.raw = response;
                        theError.parsed = parsed;
                        theError.code = code;
                        theError.message = parsed.message;
                        theError.label = parsed.label;

                        self._error = theError;

                        if ((self._callbacks[buildForm]) && (self._callbacks[buildForm][mode]) && (self._callbacks[buildForm][mode].fail) && picnicc.utility.isFunction(self._callbacks[buildForm][mode].fail)) {
                            self._callbacks[buildForm][mode].fail(theError);
                        } else {
                            alert(theError.message);
                            return;
                        }
                    }

                    if (code === 200) {
                        var theResponse = {};
                        theResponse.raw = response;
                        theResponse.parsed = parsed;
                        theResponse.code = code;
                        theResponse.location = parsed.location;
                        theResponse.status = parsed.status;

                        self._response = theResponse;

                        if ((self._callbacks[buildForm]) && (self._callbacks[buildForm][mode]) && (self._callbacks[buildForm][mode].done) && picnicc.utility.isFunction(self._callbacks[buildForm][mode].done)) {
                            self._callbacks[buildForm][mode].done(theResponse);
                        } else {
                            window.location.href = theResponse.location;
                            return;
                        }
                    }

                    if ((self._callbacks[buildForm]) && (self._callbacks[buildForm][mode]) && (self._callbacks[buildForm][mode].ends) && picnicc.utility.isFunction(self._callbacks[buildForm][mode].ends)) {
                        self._callbacks[buildForm][mode].ends();
                    }

                });

                return false;
            };

            buildForm.addEventListener("submit", handler);

            return this;
        },

        whenTransmit: function(args) {

            self._mode = "transmit";

            // transitional arguments
            picnicc.config.topicalize(args);

            var buildForm = self.setBuildForm(picnicc.config.getBuildForm()).getBuildForm();

            if (!buildForm) {
                self.disable();
                return this;
            }

            self.transmitEventListener(buildForm, self._mode);
            self.enable(buildForm);

            if (!self._callbacks[buildForm]) {
                self._callbacks[buildForm] = {};
            }
            self._callbacks[buildForm][self._mode] = {};

            // reset arguments
            picnicc.config.reset();

            return this;
        },

        begins: function(callbackBegins) {
            if (!self.enabled()) {
                return this;
            }
            self._callbacks[self.getBuildForm()][self._mode].begins = callbackBegins;
            return this;
        },

        done: function(callbackDone) {
            if (!self.enabled()) {
                return this;
            }
            self._callbacks[self.getBuildForm()][self._mode].done = callbackDone;
            return this;
        },

        fail: function(callbackFail) {
            if (!self.enabled()) {
                return this;
            }
            self._callbacks[self.getBuildForm()][self._mode].fail = callbackFail;
            return this;
        },

        ends: function(callbackEnds) {
            if (!self.enabled()) {
                return this;
            }
            self._callbacks[self.getBuildForm()][self._mode].ends = callbackEnds;
            return this;
        },
        
        response: function() {
            return self._response;
        },

        error: function() {
            return self._error;
        },

        checkboxify: function(type, arr, fields) {

            if (!fields) {
                fields = self._currentFields;
            }

            if (!fields) {
                return this;
            }

            var l = fields.length;

            for (var i = 0; i < l; i++) {
                if (type === "assets" && fields[i].name.substr(0, 6) === "assets") {
                    if (arr.indexOf(fields[i].value) !== -1) {
                        fields[i].checked = true;
                    } else {
                        fields[i].checked = false;
                    }
                }
                if (type === "bits" && fields[i].name.substr(0, 4) === "bits") {
                    if (arr.indexOf(fields[i].value) !== -1) {
                        fields[i].checked = true;
                    } else {
                        fields[i].checked = false;
                    }
                }
            }

            return this;
        },

        checkif: function(name,responseValue) {
            
            fields = self._currentFields;
            response = self._response;
            
            if (!fields) {
                return this;
            }

            if (!response) {
                return this;
            }

            var l = fields.length;

            for (var i = 0; i < l; i++) {
                if (fields[i].name === name) {
                    if (response[name] === responseValue) {
                      fields[i].checked = true;
                    } else {
                        fields[i].checked = false;
                    }
                }
            }

            return this;
        },

        valueify: function(type) {

            fields = self._currentFields;
            response = self._response;
            
            if (!fields) {
                return this;
            }

            if (!response) {
                return this;
            }

            var l = fields.length;

            var sass;
            var less;

            if (response.sass !== "none") {
                sass = JSON.parse(response.sass);
            }

            if (response.less !== "none") {
                less = JSON.parse(response.less);
            }

            for (var i = 0; i < l; i++) {

                if (type === "sass" && sass && fields[i].name.substr(0, 4) === "sass") {
                    // extract sass variable
                    var sassVar = fields[i].name.match(/^sass\[(.*)\]$/);
                    fields[i].value = sass[sassVar[1]];
                }

                if (type === "less" && less && fields[i].name.substr(0, 4) === "less") {
                    // extract sass variable
                    var lessVar = fields[i].name.match(/^less\[(.*)\]$/);
                    fields[i].value = less[lessVar[1]];
                }
            }

            return this;
        }
    }
    blueprint._();
    picnicc.form = blueprint;
})(window);