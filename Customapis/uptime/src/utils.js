import {DatePicker} from "Libs/date_picker.js"
import {$} from "Libs/dom_utils.js"

const InputFields = [
	"online_msg",
	"offline_msg",
	"test_date"
]
const BoolFields = [
	"online_on",
	"offline_on",
	"test_on"
]

const varOpen = Var("nb-var", "$(")+Var("fn", "urlfetch")+"&nbsp"
const varClose = Var("nb-var", ")")

export function createURL(url, id) {
	const link = `${url}?id=${id}`
	const start = varOpen+Var("str", url)+Param("id", "?")+Var("digit", id)
	const params = [
		{name:Param("online"), msg:"", enabled:false, plainName:"&online="},
		{name:Param("offline"), msg:"", enabled:false, plainName:"&offline="},
		{name:Param("test"), msg:"", enabled:false, plainName:"&test="}
	]
	function getUrl() {
		return start+params.reduce((html, param)=> param.enabled&&(html+=param.name+param.msg)||html, "")+varClose
	}
	return {
		set(i, msg) {
			params[i].msg = msg
			return getUrl()
		},
		turn(i, enabled = true) {
			params[i].enabled = enabled
			return getUrl()
		},
		setAll(...values) {
			params.forEach((p, i)=> {
				p.msg = values[i].msg
				p.enabled = values[i].enabled
			})
			return getUrl()
		},
		getAsField(i, value, bool) {
			const field = {}
			field[bool?BoolFields[i]:InputFields[i]] = value
			return JSON.stringify(field)
		},
		getUrl() {
			return link+params.reduce((q, param)=> param.enabled&&(q+=param.plainName+param.msg)||q, "")
		}
	}
}

export function getDatePicker() {
	const datepicker = DatePicker($(".date-picker"))
	const dropdownTag = $("#datepicker").$("span")
	dropdownTag.innerText = datepicker.toString()
	return datepicker
}

function Var(className, innerText) {
	return `<span class="${className}">${innerText}</span>`
}
function Param(name, s="&") {
	return `<span class="op">${s}</span><span class="var">${name}</span><span class="op">=</span>`
}