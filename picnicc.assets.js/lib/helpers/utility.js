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