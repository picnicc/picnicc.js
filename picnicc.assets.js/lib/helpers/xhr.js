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
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.setRequestHeader("Content-length", fields.length);
                xhr.setRequestHeader("Connection", "close");
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