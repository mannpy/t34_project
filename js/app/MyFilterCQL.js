GeoPortal.MyFilter = {};

GeoPortal.MyFilter.CQL = GeoPortal.Filter.CQL.extend({

    filterString: function(){
        var filterString = "",
            type,
            filter;
        for(var key in this._filterArray){
            filter = this._filterArray[key];
            if(filter.value == "" || filter.value == null)
                break;
            type = filter.type;

            if((type == "decimal" || type == "double" || type == "integer" || type == "short" ||
               type == "float" || type == "long" || type == "int")){
                if (filterString.length)
                    filterString += " OR ";

                switch (filter.compare) {
                    case "=":
                    case "<>":
                    case ">":
                    case ">=":
                    case "<":
                    case "<=":
                        filterString += "(\"" + filter.field + "\""+filter.compare+ filter.value + ")";
                        break;
                    default:
                        filterString += "(\"" + filter.field + "\" IN (" +
                            filter.value + "))";
                        break;
                }
            }
            else{
                switch (type) {
                    case "string":
                        if (filterString.length)
                            filterString += " OR ";

                        if(!filter.compare || filter.compare == "ilike")
                            filterString +=
                                "(strToLowerCase(" + filter.field  + ") like '%" +
                                    filter.value.toLowerCase() + "%')" ;
                        else
                            filterString += "(" + filter.field + " IN ('" +
                                filter.value + "'))";
                        break;

                    case "boolean":
                        if (filterString.length)
                            filterString += " OR ";

                        filterString += "(" + filter.name + "=" +
                            filter.value + ")";
                        break;

                    case "geometry":
                        if (filterString.length)
                            filterString += " OR ";
                        var name =  this._geomFieldName ?  this._geomFieldName :  filter.name;
                        filterString +=  "(BBOX(" + name + "," +
                            filter.value[0].lng + "," +
                            filter.value[0].lat + "," +
                            filter.value[1].lng + "," +
                            filter.value[1].lat + ",'EPSG:4326'))";
                        break;
                    default:
                        break;
                }
            }

        }
        return encodeURIComponent(filterString);

    }
});
