$(function () {
    var culture = $('#CultureId option:selected').val();
    $("#FromDate").datepicker({
        minDate: 0,
        dateFormat: culture == "en-GB" ? "mm/dd/yy" : 'dd.mm.yy',
        onSelect: function() {
            var toDate = $("#ToDate").val();
            if (toDate.length ) {
                addtoSсhedule('#duration',2, culture);
            }
        }
    });
    $("#ToDate").datepicker({
        minDate: 0,
        dateFormat: culture == "en-GB" ? "mm/dd/yy" : 'dd.mm.yy',
        onSelect: function() {
            var fromDate = $("#FromDate").val();
            if (fromDate.length ) {
                addtoSсhedule('#duration',2, culture);
            }
        }
    });
    $('.startTime, .endTime').selectmenu({
        appendTo: '.editShedule'
        ,select: function() {
            addtoSсhedule('#duration',2, culture);
        }
    });
    $('#addToShedule').click(function () {
        addtoSсhedule('.schedule', 1, culture);
    });
    $(document).on('click', '.removeInterval', function () {
        $(this).parents('tr').remove();

        if ($('.intervalSet').length) {
            $('#addToShedule').removeAttr('disabled');
        }
    });
    $('form').submit(function() {
        if ($('.intervalSet').length == 0) {
            $(this).find('table').addClass('error');
            return false;
        }
    });
});
//block - куда вывести результат, container - переключатель мест, language - переключатель языков и логики парсинга
function addtoSсhedule(block, container, language) {

    // берем введенные данные
    var fromDate = $("#FromDate").val(),
        fromTime = $('.startTime option:selected').text(),
        toDate = $("#ToDate").val(),
        toTime = $('.endTime option:selected').text(),
        fromDate2,toDate2,
        fromTime2 = fromTime.split(':').join(),
        toTime2 = toTime.split(':').join(),
        monthsArr = $('#monthsArr').val().split(',');

    // обрабатываем, что бы потом вытягивать значения дат
    // из-за полного отличия форматов приходится полностью пересобирать массивы и назначать перееменные
    if (language == "ru-RU") {
        fromDate2 = fromDate.split('.').join();
        toDate2 = toDate.split('.').join();

        var s = (fromDate2 + ',' + fromTime2).split(','),
        // вытягиваем каждый параметр для формирования Date()
            day = s[0],
            month = s[1],
            year = s[2],
            hour = s[3],
            minute = s[4],
            s2 = (toDate2 + ',' + toTime2).split(','),
            day2 = s2[0],
            month2 = s2[1],
            year2 = s2[2],
            hour2 = s2[3],
            minute2 = s2[4];
    }

    if (language == "de-DE" || language == "en-GB") {
        fromDate2 = fromDate.split('/').join();
        toDate2 = toDate.split('/').join();

        var s = (fromDate2 + ',' + fromTime2).split(','),

        // вытягиваем каждый параметр для формирования Date()
            month = s[0],
            day = s[1],
            year = s[2],
            hour = s[3],
            minute = s[4],
            s2 = (toDate2 + ',' + toTime2).split(','),
            month2 = s2[0],
            day2 = s2[1],
            year2 = s2[2],
            hour2 = s2[3],
            minute2 = s2[4];
    }

    // формируем Date для сравнения дат
    var date_now = new Date(year, month, day, hour, minute),
        date_future = new Date(year2, month2, day2, hour2, minute2);

    // типа локализации
    if (language == "ru-RU") {
        year += "г.";
        year2 += "г.";
    }
    // если не заполнены даты в момент выполнения скрипта
    if (fromDate == "" || toDate == "") {
        var error = $("#inputsError").val();
        $('#addToShedule').attr('disabled', true);
        // определяем в какой из контейнеров вставлять результат
        if (container == 1) {
            $(block).append(
                '<tr><td class="errorSet">' + error + '</td><td></td><td></td><td><button type="button" class="removeInterval btn btn-small btn-danger">x</button></td></tr>'
            );
        }
        if (container == 2) {
            $(block).find('div').addClass('errorSet').html(
                error
            );
        }

    } else {
        var r = addTextToDates(date_now, date_future);

        // если с датами что-то не так
        if (r == 0) {
            //для локализации текста об ошибке
            var error = $("#inputsError").val();
            // отключаем обе кнопки, пока юзер не устранит ошибочный результат
            $('#addToShedule').attr('disabled', true);
            // определяем в какой из контейнеров вставлять результат
            if (container == 1) {
                $(block).append(
                    '<tr><td class="errorSet">' + error + '</td><td></td><td></td><td><button type="button" class="removeInterval btn btn-small btn-danger">x</button></td></tr>'
                );
            }
            if (container == 2) {
                $(block).find('div').addClass('errorSet').html(
                    error
                );
            }
        } else {
            // если с датами всё ок - вставляем форматированный результат вычислений
            $('#addToShedule, #addActivity').removeAttr('disabled');
            if (container == 1) {
                $(block).removeClass('error').append(
                    '<tr><td>' + day + ' ' + monthsArr[month - 1] + ' ' + year + ' ' + fromTime +
                        '<input type="hidden" class="intervalSet" name="DatesStart" value="' + fromDate + ' ' + fromTime + '" /></td><td>'
                        + day2 + ' ' + monthsArr[month2 - 1] + ' ' + year2 + ' ' + toTime + '<input name="DatesEnd" type="hidden" value="' + toDate + ' ' + toTime + '" /></td><td>'
                        + r + '</td><td><button type="button" class="removeInterval btn btn-small btn-danger">x</button></td></tr>'
                );
            }
            if (container == 2) {
                $(block).find('div').removeClass('errorSet').html(
                    r
                );
            }
        }
    }
}
function dateDiff(dateStart, dateEnd) {
    //расчет разности дат, с точностью до минут
    var seconds = Math.floor((dateEnd - (dateStart)) / 1000),
        minutes = Math.floor(seconds / 60),
        hours = Math.floor(minutes / 60),
        days = Math.floor(hours / 24),

    //приведение дат к удобному виду (форматирование)
        hours = hours - (days * 24),
        minutes = minutes - (days * 24 * 60) - (hours * 60),
        seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60),

        totalTime = [days,hours,minutes,seconds];

    return totalTime
}

function addTextToDates(date_now, date_future, totalTime) { //totalTime принимает массив [дни, часы, минуты]
    var totalTime = totalTime || dateDiff(date_now, date_future),
        days = totalTime[0],
        hours = totalTime[1],
        minutes = totalTime[2],
        seconds = totalTime[3];

    //блок для слов, с учетом склонений и ед/множественного числа
    var sDaysLeft = String(days);
    // берем слова из инпутов
    var sDaysTextArr = $('#daysNamesArr').val().split(',');
    var hoursTextArr = $('#hoursArr').val().split(',');
    var minutesArrTextArr = $('#minutesArr').val().split(',');

    //определяем слова по-умолчанию
    var sDaysText = " " + sDaysTextArr[0];
    var hoursText = " " + hoursTextArr[2];
    var minutesArrText = " " + minutesArrTextArr[0];

    //расчет склонения слова "день" для русс. языка
    var nDaysLeftLength = sDaysLeft.length;
    if ($('#CultureId option:selected').val() == "ru-RU") {
        console.log('Rus');
        if (sDaysLeft.charAt(nDaysLeftLength - 2) != "1") {
            if (sDaysLeft.charAt(nDaysLeftLength - 1) == "2" || sDaysLeft.charAt(nDaysLeftLength - 1) == "3" || sDaysLeft.charAt(nDaysLeftLength - 1) == "4") {
                sDaysText = " " + sDaysTextArr[1];
            } else if (sDaysLeft.charAt(nDaysLeftLength - 1) == "1") {
                sDaysText = " " + sDaysTextArr[2];
            }
        }
        //расчет склонения слова "час" для русс. языка
        if (hours == 1 || hours == 21) {
            hoursText = " " + hoursTextArr[0];
        } else if (hours >= 2 && hours <= 4) {
            hoursText = " " + hoursTextArr[1]
        } else if (hours >= 22 && hours <= 24) {
            hoursText = " " + hoursTextArr[1]
        }
    }
    //немецкий пока не трогаем, не известно как там слова склоняются
    if ($('#CultureId option:selected').val() == "de-DE") {
        console.log('German');
        if (days == 1) {
            sDaysText = " " + sDaysTextArr[1];
        }
    }
    //расчте окончания слов "day" и "hour" для англ для ед/множественного выбора
    if ($('#CultureId option:selected').val() == "en-GB") {
        console.log('English');
        if (days == 1) {
            sDaysText = " " + sDaysTextArr[1];
        }
        if (hours == 1) {
            hoursText = " " + hoursTextArr[0];
        }
    }
// проверки для понимания что выводить в результате
    if (days < 0 || hours < 0 || minutes < 0) {
        return 0;
    } else if (days == 0 && hours == 0 && minutes == 0) {
        return 0;
    } else if (days == 0 && hours == 0) {
        return minutes + minutesArrText;//только минуты
    } else if (days == 0 && minutes == 0) {
        console.log('1');
        return hours + hoursText; //только часы
    } else if (hours == 0 && minutes == 0) {
        return days + sDaysText; //только дни
    } else if (days == 0) { //дни = 0, есть часы и минуты
        return hours + hoursText + ' ' + minutes + minutesArrText;
    } else if (hours == 0) { //часы = 0, есть дни и минуты
        return days + sDaysText + ' ' + minutes + minutesArrText;
    } else if (minutes == 0) { //минуты = 0, есть дни и минуты
        return days + sDaysText + ' ' + hours + hoursText
    } else {
        return days + sDaysText + ' ' + hours + hoursText + ' ' + minutes + minutesArrText;
    }
}