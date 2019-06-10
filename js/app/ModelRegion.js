GeoPortal.Model.Region = GeoPortal.Model.extend({
    fields: [
        {name: "id", type: "inreger", dvalue: "", notNull: false, rusName: "Первичный ключ"},
        {name: "name", type: "string", dvalue: "", notNull:false, rusName: "Название"},
        {name: "bounds", type: "object", dvalue: "", notNull:false, rusName: "Bbox"},
        {name: "count_objects", type: "integer", dvalue: 0, notNull:true, rusName: "Количество памятных знаков"},
        {name: "count_photos", type: "integer", dvalue: 0, notNull:true, rusName: "Количество фотографий"},
        {name: "count_members", type: "integer", dvalue: 0, notNull:true, rusName: "Количество участников"}
    ]
});
