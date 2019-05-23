GeoPortal.Model.Eis = GeoPortal.Model.extend({
    fields: [
        {name: "id", type: "string", dvalue: "", notNull: true, rusName: "Первичный ключ"},
        {name: "objectId", type: "string", dvalue: "", notNull:true, rusName: "id файла"},
        {name: "url", type: "string", dvalue: "", notNull:true, rusName: "Url"},
        {name: "fileName", type: "string", dvalue: "", notNull:true, rusName: "Имя файла"} ,
        {name: "type", type: "object", dvalue: "", notNull:true, rusName: "тип"}
    ]
});


