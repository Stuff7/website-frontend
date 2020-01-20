import {DatePicker} from "Libs/date_picker.js"
import {$} from "Libs/dom_utils.js"

const varOpen = VAR("bot-var", "$(urlfetch")+"&nbsp"
const varClose = VAR("bot-var", ")")

export function URLConstructor(url, params=[]) {
	if(!(this instanceof URLConstructor)) return new URLConstructor(url, params)
	this.baseURL = url
	this.varOpen = varOpen+VAR("str", url)
	this.params = {}
	this.param = {}
	if(typeof params == "string") params = params.split(" ")
	if(!(params instanceof Array))
		throw TypeError("URLConstructor params argument must be either a String or an Array of Strings")
	for(const param of params)
		this.param[param] = PARAM(param)
}
URLConstructor.prototype.getHTML = function() {
	return this.varOpen + this.reduceParams((k,v,params)=> {
		return (!params? PARAM(k,"?") : this.param[k]) + v
	}) + varClose
}
URLConstructor.prototype.getURL = function() {
	return this.baseURL + this.reduceParams((k,v)=> `${k}=${v}&`, "?").slice(0,-1)
}
URLConstructor.prototype.setURL = function(url) {
	this.baseURL = url
	this.varOpen = varOpen+VAR("str", url)
}
URLConstructor.prototype.reduceParams = function(fn, params = "") {
	for(const name in this.params)
		params+=fn.call(this, name, encodeURIComponent(this.params[name]), params)
	return params
}
URLConstructor.prototype.add = function(name, value) {
	if(!this.param[name]) throw Error(`Parameter ${name} doesn't exist`)
	this.params[name] = value
}
URLConstructor.prototype.remove = function(name) {
	delete this.params[name]
}

function VAR(className, innerText) {
	return `<span class="${className}">${innerText}</span>`
}
function PARAM(name, s="&") {
	return `<span class="op">${s}</span><span class="var">${name}</span><span class="op">=</span>`
}

export function getDatePicker() {
	const datepicker = DatePicker($(".date-picker"))
	const dropdownTag = $("#datepicker").$("span")
	dropdownTag.innerText = datepicker.toString()
	return datepicker
}

export function setupDDownTag(dDown) {
	if(!dDown.classList.contains("dropdown")) return [dDown]
	const title = dDown.$("span")
	const options = dDown.$$("ul label")

	const states = []
	for(const option of options) {
		const state = option.$("input")
		const displayName = option.$("li")

		states.push(state)
		const handler = ()=> title.innerText = displayName.innerText
		state.on("input", handler)
		state.checked && handler()
	}
	return states
}