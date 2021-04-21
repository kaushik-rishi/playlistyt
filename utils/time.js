function isoToSeconds(time) {
    return (
        time.seconds +
        (time.minutes * 60) +
        (time.hours * 60 * 60)
    );
}

function secondsToIso(seconds) {
    seconds = Math.floor(seconds);
    let minutes = 0, hours = 0;
    minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    
    hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    
    return {
        hours,
        minutes,
        seconds
    };
}

function getISODurations(videoDurations) {
    let isoDurations = [];
    for (let duration of videoDurations) {
        duration = duration.slice(2);
        let hrsIndex = duration.indexOf('H'),
            minsIndex = duration.indexOf('M'),
            secsIndex = duration.indexOf('S');
        
        let parsed = {
            hours: 0,
            minutes: 0,
            seconds: 0
        };
        
        parsed.hours = timeSlotValue(duration, hrsIndex);
        parsed.minutes = timeSlotValue(duration, minsIndex);
        parsed.seconds = timeSlotValue(duration, secsIndex);
        isoDurations.push(parsed);
    }
    return isoDurations;
}

function timeSlotValue(duration, index) {
    let number = '';
    index--;
    while (index >= 0 && (!isNaN(+duration[index]))) {
        number = duration[index--] + number;
    }
    return +number;
}

function rawSumISO(isoDurations) {
    return isoDurations.reduce((accumulator, currentValue) => {
        return {
            hours: accumulator.hours + currentValue.hours,
            minutes: accumulator.minutes + currentValue.minutes,
            seconds: accumulator.seconds + currentValue.seconds
        }; 
    }, {
        hours: 0,
        minutes: 0,
        seconds: 0
    });
}

module.exports = {
    isoToSeconds,
    secondsToIso,
    getISODurations,
    rawSumISO
};