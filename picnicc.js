/**
 * picnicc.js v1.0.0
 * @author Alex Duloz ~ @alexduloz ~ http://bitspushedaround.com/
 * MIT license
 */
(function(window) {

	var document = window.document;

	var self = blueprint = {

		_: function() {
			return this;
		},
	}

	blueprint._();
	window.picnicc = blueprint;
})(window);

(function(window) {
	var document = window.document;

	var self = blueprint = {

		_: function() {
			this._retrieveEndpoint = "https://picni.cc/api/v1/retrieve/";
			this._transmitEndpoint = "https://picni.cc/api/v1/build/";

			this._buildForm = "picnicc";
			this._buildIdField = "picnicc_build_id";
			this._buildIdSubmit = "picnicc_retrieve_build";

			return this;
		},

		setBuildForm: function(selector) {
			self._buildForm = selector;
			return this;
		},

		getBuildForm: function() {
			return self._buildForm;
		},

		setBuildIdField: function(selector) {
			self._buildIdField = selector;
			return this;
		},

		getBuildIdField: function() {
			return self._buildIdField;
		},

		setBuildIdSubmit: function(selector) {
			self._buildIdSubmit = selector;
			return this;
		},

		getBuildIdSubmit: function() {
			return self._buildIdSubmit;
		},

		topicalize: function(args) {
			if (args) {
				self._buildForm = args.setBuildForm || self._buildForm;
				self._buildIdField = args.setBuildIdField || self._buildIdField;
				self._buildIdSubmit = args.setBuildIdSubmit || self._buildIdSubmit;
			}
		},

		reset: function() {
			self._();
		}
	}
	blueprint._();
	picnicc.config = blueprint;
})(window);

(function(window) {
	var document = window.document;

	var self = blueprint = {

		_: function() {
			return this;
		},

		$: function(selector) {
			if (!selector) {
				return document.querySelector || window.jQuery;
			}

			if (document.querySelector) {
				return document.querySelector(selector);
			}

			if (window.jQuery) {
				var $element = window.jQuery(selector);
				if ($element.length > 0) {
					return $element.get(0);
				}
			}
			return false;
		},

		isArray: function(input) {
			return (Object.prototype.toString.call(input) === "[object Array]");
		},

		isObject: function(input) {
			return (Object.prototype.toString.call(input) === "[object Object]");
		},

		isFunction: function(input) {
			return (Object.prototype.toString.call(input) === "[object Function]");
		},

		serialize: function(form) {
			var result = "";

			var fields = form.elements;
			var fieldsLength = fields.length;

			for (var i = 0; i < fieldsLength; i++) {
				if (!fields[i] || fields[i].name === "") {
					continue;
				}
				if ((fields[i].type === "checkbox") && fields[i].checked !== true) {
					continue;
				}
				result += "&" + fields[i].name + "=" + fields[i].value;
			}

			result = result.substr(1);

			return result;

		}
	}
	blueprint._();
	picnicc.utility = blueprint;
})(window);

(function(window) {

	var document = window.document;

	var self = blueprint = {

		_: function() {
			this._response;
			this._responseParsed;
			this._code;
			return this;
		},

		createXhr: function() {
			try {
				return new XMLHttpRequest();
			} catch (error) {
				console.error(error);
			}

			try {
				return new ActiveXObject("Msxml2.XMLHTTP.6.0");
			} catch (error) {
				console.error(error);
			}

			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch (error) {
				console.error(error);
			}
		},

		request: function(verb, url, fields, callback, async) {

			self._code = false;
			self._response = false;
			self._responseParsed = false;

			var async = (typeof async !== "undefined") ? false : true

			if (picnicc.utility.isObject(fields) || picnicc.utility.isArray(fields)) {
				fields = picnicc.utility.serialize(fields);
			}

			var xhr = self.createXhr();

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					self._code = xhr.status;
					self._response = xhr.responseText;
					// console.log(self._response);
					try {
						self._responseParsed = JSON.parse(self._response);
					} catch (e) {
						console.error(e);
					}
					callback(xhr.status, xhr.responseText);
				}
			};

			if (verb === 'GET') {
				xhr.open("GET", url + "?" + fields, async);
				xhr.send(null);
			}

			if (verb === 'POST') {
				xhr.open("POST", url, async);
				xhr.send(fields);
			}

			if (verb === 'DELETE') {
				xhr.open("DELETE", url + "?" + fields, async);
				xhr.send(null);
			}

			return this;
		},

		response: function(parsed) {
			return (parsed === true) ? self._responseParsed : self._response;
		},

		code: function() {
			return self._code;
		},

	}
	blueprint._();
	picnicc.xhr = blueprint;
})(window);

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

						self._response = theResponse;

						if ((self._callbacks[buildForm]) && (self._callbacks[buildForm][mode]) && (self._callbacks[buildForm][mode].done) && picnicc.utility.isFunction(self._callbacks[buildForm][mode].done)) {
							self._callbacks[buildForm][mode].done(theResponse);
						} else {
							for (var i = 0; i < fieldsLength; i++) {
								if (fields[i]) {
									if (parsed.bits.indexOf(fields[i].value) !== -1) {
										fields[i].checked = true;
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

				picnicc.xhr.request('GET', picnicc.config._transmitEndpoint, picnicc.utility.serialize(buildForm), function(code, response) {

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

		checkboxify: function(arr, fields) {

			if (!fields) {
				fields = self._currentFields;
			}

			if (!fields) {
				return this;
			}

			var l = fields.length;

			for (var i = 0; i < l; i++) {
				if (arr.indexOf(fields[i].value) !== -1) {
					fields[i].checked = true;
				}
			}

			return this;
		}
	}
	blueprint._();
	picnicc.form = blueprint;
})(window);