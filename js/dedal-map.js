$(document).ready(function(){
    // Dedal map
    var GPApplication;

    GeoPortal.regionsStore = new GeoPortal.HashMap();
	var i=0, len = GeoPortal.config.regions.length;
	for(i=0;i<len;i++){
		var region = GeoPortal.config.regions[i],
			bboxArr = region.bbox.split(","),
			southWest = bboxArr[0].split(" "),
			northEast = bboxArr[1].split(" ");

		region.bounds = {
			southWest: {
				lng: southWest[0],
				lat: southWest[1]
			},
			northEast: {
				lng: northEast[0],
				lat: northEast[1]
			}
		};
		var model = new GeoPortal.Model.Region(region);
		GeoPortal.regionsStore.add(region.id, model);
	}
    GeoPortal.countObjects = 0;
    GeoPortal.countPhotos = 0;
    GeoPortal.countMembers = 0;

    GeoPortal.russiaCountObjects = 0;
    GeoPortal.russiaCountPhotos = 0;
    GeoPortal.russiaCountMembers = 0;

    apiJsonGET(GeoPortal.basePath + "/modules/dedalT34/statistic",{},
		function(data){

            if(data && data.length > 0) {
                var i = 0, len = data.length;
                for(i=0;i<len;i++) {
					var subject = data[i];

					if(subject.sub_id != null) {
					    var region = GeoPortal.regionsStore.get(subject.sub_id);
                        if (region) {
                            region.set("count_objects", subject.count_objects);
                            region.set("count_photos", subject.count_photos);
                            region.set("count_members", subject.count_members);
                        }
                        GeoPortal.russiaCountObjects = GeoPortal.russiaCountObjects + subject.count_objects;
                        GeoPortal.russiaCountPhotos = GeoPortal.russiaCountPhotos + subject.count_photos;
                        GeoPortal.russiaCountMembers = GeoPortal.russiaCountMembers + subject.count_members;

                    }
                    GeoPortal.countObjects = GeoPortal.countObjects + subject.count_objects;
                    GeoPortal.countPhotos = GeoPortal.countPhotos + subject.count_photos;
                    GeoPortal.countMembers = GeoPortal.countMembers + subject.count_members;
                }

                setMainStatistic(GeoPortal.countObjects, GeoPortal.countPhotos, GeoPortal.countMembers);
                updateStatistic("Россия", GeoPortal.russiaCountObjects, GeoPortal.russiaCountPhotos, GeoPortal.russiaCountMembers);

			}
        },
        function(status,error) {
            console.log("Error to request statistic for dedalT34 module. Status = " + status + ". Error text: " + error);
        }
    );

    function setMainStatistic(countObjects, countPhotos, countMembers) {
        $(".header-info").find(".numbers__signs").children(".numbers__count").text(countObjects);
        $(".header-info").find(".numbers__signs").children(".numbers__text").text(caseWord(countObjects, "памятный знак", "памятных знака", "памятных знаков"));

        $(".header-info").find(".numbers__photos").children(".numbers__count").text(countPhotos);
        $(".header-info").find(".numbers__photos").children(".numbers__text").text(caseWord(countPhotos, "фотография", "фотографии", "фотографий"));

        $(".header-info").find(".numbers__members").children(".numbers__count").text(countMembers);
        $(".header-info").find(".numbers__members").children(".numbers__text").text(caseWord(countMembers, "участник", "участника", "участников"));

        increase($("#number-signs"), countObjects, 500);
        increase($("#number-photos"), countPhotos, 500);
        increase($("#number-members"), countMembers, 500);

        $(".main-page__numbers").children(".numbers__signs").children(".numbers__text").text(caseWord(countObjects, "памятный знак", "памятных знака", "памятных знаков"));
        $(".main-page__numbers").children(".numbers__photos").children(".numbers__text").text(caseWord(countPhotos, "фотография", "фотографии", "фотографий"));
        $(".main-page__numbers").children(".numbers__members").children(".numbers__text").text(caseWord(countMembers, "участник", "участника", "участников"));


        $(".menu-page-about__numbers").find(".numbers__signs").children(".numbers__count").text(countObjects);
        $(".menu-page-about__numbers").find(".numbers__signs").children(".numbers__text").text(caseWord(countObjects, "памятный знак", "памятных знака", "памятных знаков"));

        $(".menu-page-about__numbers").find(".numbers__photos").children(".numbers__count").text(countPhotos);
        $(".menu-page-about__numbers").find(".numbers__photos").children(".numbers__text").text(caseWord(countPhotos, "фотография", "фотографии", "фотографий"));

        $(".menu-page-about__numbers").find(".numbers__members").children(".numbers__count").text(countMembers);
        $(".menu-page-about__numbers").find(".numbers__members").children(".numbers__text").text(caseWord(countMembers, "участник", "участника", "участников"));

    }

    function updateStatistic(regionName, countObjects, countPhotos, countMembers) {
        $(".map-page-region").children(".map-page-region__title").text(regionName);

        $(".map-page-region__numbers").find(".numbers__signs").children(".numbers__count").text(countObjects);
        $(".map-page-region__numbers").find(".numbers__signs").children(".numbers__text").text(caseWord(countObjects, "памятный знак", "памятных знака", "памятных знаков"));

        $(".map-page-region__numbers").find(".numbers__photos").children(".numbers__count").text(countPhotos);
        $(".map-page-region__numbers").find(".numbers__photos").children(".numbers__text").text(caseWord(countPhotos, "фотография", "фотографии", "фотографий"));

        $(".map-page-region__numbers").find(".numbers__members").children(".numbers__count").text(countMembers);
        $(".map-page-region__numbers").find(".numbers__members").children(".numbers__text").text(caseWord(countMembers, "участник", "участника", "участников"));
    }
	GeoPortal.on("ready",geoportalReady,this);

	function geoportalReady() {
		GPApplication = new GeoPortal.Application({
            mainLayerId: 207,
            regionLayerId: 245,
            baseLayerId: "-932516122",
            defaultRegion: GeoPortal.regionsStore.get(0)
		});

        GPApplication.onApplicationLoaded(function () {
            var $g = $("#map-page").find(".map-page__russia").children("#mapSvg").children("g");
            $g.hover(function() {
                var region = null;
                if($(this).attr("id") != undefined) {
                    region = GeoPortal.regionsStore.get($(this).attr("id"));
                }
                if(region != null) {
                    updateStatistic(region.get("name"), region.get("count_objects"), region.get("count_photos"), region.get("count_members"));
                } else {
                    updateStatistic("Россия", GeoPortal.russiaCountObjects, GeoPortal.russiaCountPhotos, GeoPortal.russiaCountMembers);
                }
            }, function() {
                updateStatistic("Россия", GeoPortal.russiaCountObjects, GeoPortal.russiaCountPhotos, GeoPortal.russiaCountMembers);
            });

            $g.click(function () {
                GPApplication.filterFeaturesByRegion($(this).attr("id"));
            });

            $(".header-info").find(".numbers__signs").click(function () {
                GPApplication.filterFeaturesByRegion(0);
            });
            $(".map-page-region").find(".numbers__signs").click(function () {
                GPApplication.filterFeaturesByRegion(0);
            });
            $(".map-page-region").find(".map-page-region__title").click(function () {
                GPApplication.filterFeaturesByRegion(0);
            });
        }, this);
	}

    $("#fullpage").find(".region-page-wrap").find(".more-info__btn").bind("click", function () {
        $.fn.fullpage.setAllowScrolling(true);
        $.fn.fullpage.setKeyboardScrolling(true);
        window.location.href = "index.html#map-page";
        $("#fullpage").find(".region-page-wrap").hide();
    });

});