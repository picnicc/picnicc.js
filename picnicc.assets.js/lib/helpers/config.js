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