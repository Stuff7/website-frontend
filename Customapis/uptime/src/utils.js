import {DatePicker} from "Libs/date_picker.js"
import {$,getCookie} from "Libs/dom_utils.js"

const varOpen = VAR("nb-var", "$(")+VAR("fn", "urlfetch")+"&nbsp"
const varClose = VAR("nb-var", ")")
const param = {online: PARAM("online"), offline: PARAM("offline"), test: PARAM("test")}

export function URLConstructor(url) {
	if(!(this instanceof URLConstructor)) return new URLConstructor(url)
	this.baseURL = url
	this.varOpen = varOpen+VAR("str", url)
	this.params = {}
}
URLConstructor.prototype.getHTML = function() {
	return this.varOpen + this.reduceParams() + varClose
}
URLConstructor.prototype.getURL = function() {
	return this.baseURL + this.reduceParams((k,v)=> `${k}=${v}&`, "?").slice(0,-1)
}
URLConstructor.prototype.reduceParams = function(fn = (k,v)=> param[k]+encodeURIComponent(v), params = "") {
	for(const name in this.params)
		params+=fn.call(this, name, this.params[name])
	return params
}
URLConstructor.prototype.add = function(name, value) {
	if(!param[name]) throw Error(`Parameter ${name} doesn't exist`)
	this.params[name] = value
}
URLConstructor.prototype.remove = function(name) {
	delete this.params[name]
}

export function getDatePicker() {
	const datepicker = DatePicker($(".date-picker"))
	const dropdownTag = $("#datepicker").$("span")
	dropdownTag.innerText = datepicker.toString()
	return datepicker
}
export function postChanges(k,v) {
	const data = {}
	data[k] = v
	fetch("/api/uptime/settings/", {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"X-CSRFToken": getCookie("csrftoken")
		}
	})
}

function VAR(className, innerText) {
	return `<span class="${className}">${innerText}</span>`
}
function PARAM(name, s="&") {
	return `<span class="op">${s}</span><span class="var">${name}</span><span class="op">=</span>`
}