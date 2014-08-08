var mirakel = mirakel || {};

//KO EXTENSIONS
//add support for dirtyFlag serialization
ko.mapping.defaultOptions().include = ["_destroy", "isDirty"];
/**
 * Dirty flag suppor for KO
 * @param root - element to be watched for changes
 * @param isInitiallyDirty - should element be marked dirty from the beginning?
 * @returns {result} - dirtyFlag object
 */
ko.dirtyFlag = function (root, isInitiallyDirty) {
    var result = function () {},
        _initialState = ko.observable(ko.toJSON(root)),
        _isInitiallyDirty = ko.observable(isInitiallyDirty);

    result.isDirty = ko.computed(function () {
        return _isInitiallyDirty() || _initialState() !== ko.toJSON(root);
    });

    result.reset = function () {
        _initialState(ko.toJSON(root));
        _isInitiallyDirty(false);
    };

    return result;
};

//BIND HANDLERS
/**
 * Bind handler for date picker
 */
ko.bindingHandlers.datePicker = {
    // Register change callbacks to update the model if the control changes.
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var picker = $(element);
        picker.datetimepicker();
        picker.on("dp.change",function (e) {
            var value = valueAccessor();
            value(picker.data("DateTimePicker").getDate().toDate());
        });
        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            picker.data("DateTimePicker").destroy();
        });
    },
    // Update the control whenever the view model changes
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value =  valueAccessor();
        var picker = $(element);
        picker.data("DateTimePicker").setDate(value());
    }
};

//custom mappings
(function() {
    /**
     * Helper function for mapping objects. It adds dirtyFlag support.
     * @param mapping - additional mapping object
     * @param dirty - should the root object be dirty from the start
     * @returns {Function} - function for create property of mapping object
     */
    var getCreateFunction = function(mapping, dirty) {
        return function(options) {
            var data = ko.mapping.fromJS(options.data, mapping || {});
            data.dirtyFlag = ko.dirtyFlag(data, dirty || false); //add dirty support
            data.isDirty = data.dirtyFlag.isDirty; //flatten this function so toJS can easily use it
            return data;
        };
    }

    /**
     * Child mapping object. Currently it supports:
     * - date conversion from JSON string
     */
    var childMapping = {
        'date': {
            create: function (options) {
                return ko.mapping.fromJS(new Date(options.data));
            }
        }
    };

    /**
     * Mapping object which adds dirtyFlag support for root element
     * Child elements are mapped according to childMapping object
     * @type {{create}}
     */
    mirakel.mappingClean = {
        create: getCreateFunction(childMapping)
    };

    /**
     * Mapping object which adds dirtyFlag support for root element.
     * The root object is marked as dirty, good for creation of new objects
     * Child elements are mapped according to childMapping object
     * @type {{create}}
     */
    mirakel.mappingDirty = {
        create: getCreateFunction(childMapping, true)
    };

})();

//utilities
(function() {
    /**
     * Resets dirty flag for each element of array
     * @param arr - array to be processed
     */
    mirakel.arrayResetDirty = function(arr) {
        ko.utils.arrayForEach(arr, function(item) {
            item.dirtyFlag.reset();
        });
    };

    /**
     * Filter only change elements from array
     * @param arr - array to be processed
     * @returns {*} - new array of changed elements
     */
    mirakel.arrayFilterChangedItems = function(arr) {
        return ko.utils.arrayFilter(arr, function (item) {
            return (item._destroy && item._id) ||
                (item._destroy === undefined && item.isDirty);
        });
    };

    /**
     * Removes or destroys element from array.
     * The choice made based on existence of _id property
     * @param arr - observable array to be processed
     * @param item - item to be removed
     */
    mirakel.koArrayRemoveItem = function(arr, item) {
        if (item._id()) {
            arr.destroy(item);
        } else {
            arr.remove(item);
        }
    };

    /**
     * Creates curly function for removal of items from specified array
     * @param arr - observable array to be processed
     * @returns {Function} - curly function which accepts item as parameter
     */
    mirakel.koArrayRemoveItemFunction = function(arr) {
        return function (item) {
            mirakel.koArrayRemoveItem(arr, item);
        };
    };
})();

