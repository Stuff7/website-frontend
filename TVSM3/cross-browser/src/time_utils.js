export const Time = {
	second: 1e3,
	minute: 6e4,
	hour: 36e5,
	day: 864e5,
	week: 6048e5,
	month: 2628e6,
	year: 31536e6,
	months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
	days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	max: new Date(864e13),
	min: new Date(-864e13),
}
export function getDate(date, reverse = false) {
	if(invalidDate(date)) return '—'
	if((Math.abs(Date.now() - date.getTime()) <= Time.week) - reverse) return Time.days[date.getDay()]
	return `${(date.getDate()+'').padStart(2, 0)} ${Time.months[date.getMonth()]} ${(date.getFullYear()+'').slice(-2)}`
}

function addS(str, n) {
	return `${str}${n > 1 && 's' || ''}`
}
function pad0s(n, padding = 2) {
	return (n+'').padStart(padding, 0)
}
function invalidDate(date) {
	return date.getTime() == Time.max.getTime() || date.getTime() == Time.min.getTime()
}

export default {
	fromNow(then) {
		const elapsed = Math.abs(Date.now() - then)
		if(elapsed < Time.second) return `${elapsed}ms`

		let secs = elapsed/Time.second|0
		if(elapsed < Time.minute) return `${pad0s(secs)} ${addS("second",secs)}`

		let mins = secs/60|0
		if(elapsed < Time.hour) return `${pad0s(mins)}:${pad0s(secs%60)} ${addS("minute",mins)}`

		let hours = secs/3600|0
		mins = mins%60
		if(elapsed < Time.day) return `${pad0s(hours)}:${pad0s(mins)} ${addS("hour",hours)}`

		let days = secs/86400|0
		if(elapsed < Time.week) {
			hours %= 24
			if(hours) return `${pad0s(days)} ${addS("day",days)} ${pad0s(hours)} ${addS("hour",hours)}`
			return `${pad0s(days)} ${addS("day",days)}`
		}

		let weeks = secs/604800|0
		if(elapsed < Time.month) {
			days %= 7
			if(days) return `${pad0s(weeks)} ${addS("week",weeks)} ${pad0s(days)} ${addS("day",days)}`
			return `${pad0s(weeks)} ${addS("week",weeks)}`
		}

		let months = secs/2628000|0
		console.log(days)
		if(elapsed < Time.year) {
			days = days%30.42|0
			if(days) return `${pad0s(months)} ${addS("month",months)} ${pad0s(days)} ${addS("day",days)}`
			return `${pad0s(months)} ${addS("month",months)}`
		}

		let years = secs/31536e3|0
		months %= 12
		days = days % 365 % 31
		let result = `${pad0s(years)} ${addS("year",years)}`
		if(months) result += ` ${pad0s(months)} ${addS("month",months)}`
		if(days) result += ` ${pad0s(days)} ${addS("day",days)}`
		return result
	},
	closestToNow(a, b) {
		let now = Date.now()
		return Math.abs(b - now) - Math.abs(a - now)
	},
}