function increase(element, toValue, duration) {

    $({numberValue: 0}).animate({numberValue: toValue}, {

        duration: duration, // Продолжительность анимации, где 500 = 0,5 одной секунды, то есть 500 миллисекунд
        easing: "easeOutCubic",

        step: function(val) {

            element.html(Math.ceil(val)); // Блок, где необходимо сделать анимацию

        }

    });
}

function caseWord(number, case1, case2, case3) {
    var base = number - Math.floor(number / 100) * 100,
        result;
    if (base > 9 && base < 20) {
        result = case3;
    } else {
        var remainder = number - Math.floor(number / 10) * 10;

        if (1 == remainder) result = case1;
        else if (0 < remainder && 5 > remainder) result = case2;
        else result = case3;
    }

    return result;
}