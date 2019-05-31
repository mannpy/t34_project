GeoPortal.Model.Region = GeoPortal.Model.extend({
    fields: [
        {name: "id", type: "inreger", dvalue: "", notNull: false, rusName: "Первичный ключ"},
        {name: "name", type: "string", dvalue: "", notNull:false, rusName: "Название"},
        {name: "bounds", type: "object", dvalue: "", notNull:false, rusName: "Bbox"}
    ]
});
