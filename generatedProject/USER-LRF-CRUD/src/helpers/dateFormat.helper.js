const moment = require('moment');

const setCurrentTimestamp = () => moment().format('x');

const addTimeToCurrentTimestamp = (number, unit) => moment().add(number, unit).format('x');

const getDateAndTimeFromTimestamp = (timestamp, format) => moment(timestamp, 'x').format(format);

const getTimestamp = (time, format) => moment(time, format).format('x');

const startOfToday = (format, unit) => moment().startOf(unit).format(format);
const endOfToday = (format, unit) => moment().endOf(unit).format(format);

const getStartOfDate = (time, format) => moment(time, format).startOf('d').format(format);
const getEndOfDate = (time, format) => moment(time, format).endOf('d').format(format);

const getStartOf = (unit, format) => moment().startOf(unit).format(format);
const getEndOf = (unit, format) => moment().endOf(unit).format(format);

const addTimeToTimestamp = (timestamp, unit, number) => moment(timestamp, "x").add(number, unit).format('x');

const getDuration = (startTime, endTime, format, unit) => {
    let start = moment(startTime, format);
    let end = moment(endTime, format);
    let duration = moment.duration(end.diff(start)).as(unit);
    return duration;
}

module.exports = {
    setCurrentTimestamp,
    addTimeToCurrentTimestamp,
    startOfToday,
    endOfToday,
    getStartOfDate,
    getEndOfDate,
    getDateAndTimeFromTimestamp,
    getTimestamp,
    getStartOf,
    getEndOf,
    getDuration,
    addTimeToTimestamp
};