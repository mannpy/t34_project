GeoPortal.HashMap = M.Class.extend({
    includes: M.Mixin.Events,

    initialize: function() {
        this.clear(true);
    },

    getCount: function() {
        return this.length;
    },

    getData: function(key, value) {
        // if we have no value, it means we need to get the key from the object
        if (value === undefined) {
            value = key;
            key = this.getKey(value);
        }

        return [key, value];
    },

    getKey: function(o) {
        return o.id;
    },

    add: function(key, value) {
        var me = this,
            data;

        if (me.containsKey(key)) {
            throw new Error('This key already exists in the HashMap');
        }

        data = this.getData(key, value);
        key = data[0];
        value = data[1];
        me.map[key] = value;
        ++me.length;
        me.fire('add',{me: me,key: key,value: value});
        return value;
    },

    replace: function(key, value) {
        var me = this,
            map = me.map,
            old;

        if (!me.containsKey(key)) {
            me.add(key, value);
        }
        old = map[key];
        map[key] = value;
        me.fire('replace',{me: me,key: key,value: value, old: old});
        return value;
    },

    remove: function(o) {
        var key = this.findKey(o);
        if (key !== undefined) {
            return this.removeByKey(key);
        }
        return false;
    },

    removeByKey: function(key) {
        var me = this,
            value;

        if (me.containsKey(key)) {
            value = me.map[key];
            delete me.map[key];
            --me.length;
            me.fire('remove', {me: me,key: key,value: value});
            return true;
        }
        return false;
    },

    get: function(key) {
        return this.map[key];
    },

    clear: function(/* private */ initial) {
        var me = this;
        me.map = {};
        me.length = 0;
        if (initial !== true) {
            me.fire('clear', {me: me});
        }
        return me;
    },

    containsKey: function(key) {
        return this.map[key] !== undefined;
    },

    contains: function(value) {
        return this.containsKey(this.findKey(value));
    },

    getKeys: function() {
        return this.getArray(true);
    },

    getValues: function() {
        return this.getArray(false);
    },

    getArray: function(isKey) {
        var arr = [],
            key,
            map = this.map;
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                arr.push(isKey ? key : map[key]);
            }
        }
        return arr;
    },

    each: function(fn, scope) {
        // copy items so they may be removed during iteration.
        var items = M.Util.extend({}, this.map),
            key,
            length = this.length;

        scope = scope || this;
        for (key in items) {
            if (items.hasOwnProperty(key)) {
                if (fn.call(scope, key, items[key], length) === false) {
                    break;
                }
            }
        }
        return this;
    },

    findKey: function(value) {
        var key,
            map = this.map;

        for (key in map) {
            if (map.hasOwnProperty(key) && map[key] === value) {
                return key;
            }
        }
        return undefined;
    }
});
