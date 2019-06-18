$(document).ready(function(){
    var basePath = "http://t34.dedal.ru";
    $.ajax({
        url: basePath + "/modules/dedalT34/statistic",
        type: "GET",
        contentType: "application/json",
        success: function(data) {
            if(data && data.length > 0) {
                var i = 0, len = data.length,
                    countObjects = 0,
                    countPhotos = 0,
                    countMembers = 0;

                for(i=0;i<len;i++) {
                    var subject = data[i];

                    countObjects = countObjects + subject.count_objects;
                    countPhotos = countPhotos + subject.count_photos;
                    countMembers = countMembers + subject.count_members;
                }

                increase($(".numbers__signs").children(".numbers__count"), countObjects, 1000);
                increase($(".numbers__photos").children(".numbers__count"), countPhotos, 1000);
                increase($(".numbers__members").children(".numbers__count"), countMembers, 1000);

                $(".numbers__signs").children(".numbers__text").text(caseWord(countObjects, "памятный знак", "памятных знака", "памятных знаков"));
                $(".numbers__photos").children(".numbers__text").text(caseWord(countPhotos, "фотография", "фотографии", "фотографий"));
                $(".numbers__members").children(".numbers__text").text(caseWord(countMembers, "участник", "участника", "участников"));
            }
        },

        error: function(jqXHR, textStatus, errorThrown){
            console.log("Status: "+ jqXHR.status + " Error: "+jqXHR.responseText);
        }
    });
    
});