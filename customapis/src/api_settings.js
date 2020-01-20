import {ClipboardInput} from "Libs/clipboard.js"
import {URLConstructor, setupDDownTag} from "./utils.js"

export function APISettings(elem) {
	if(!(this instanceof APISettings)) return new APISettings(elem)
	this.clipboard = ClipboardInput(elem.$(".clipboard"))
	this.url = URLConstructor(this.clipboard.value, this.clipboard.dataset.params)
	this.setupParams(elem)
}
APISettings.prototype.updateClipboard = function() {
	this.clipboard.setHTML(this.url.getHTML())
}

APISettings.prototype.setupParams = function(elem) {
	delete APISettings.prototype.setupParams
	this.params = {}
	const elems = elem.$$(".param")
	let i = 0
	for(const param in this.url.param)
		this.params[param] = elems[i++]
	this.setupParamHandlers()
}
APISettings.prototype.setupParamHandlers = function() {
	delete APISettings.prototype.setupParamHandlers
	for(const param in this.params) {
		const elem = this.params[param]
		const toggle = elem.$(".toggle input")
		const paramVal = { textInput: elem.$(".input span"), dDown: {innerText: ""} }
		let currentVal = paramVal.textInput.classList.contains("dropdown")? "dDown" : "textInput"

		const toggleHandler = ()=> {
			toggle.checked? this.url.add(param, paramVal[currentVal].innerText) : this.url.remove(param)
			this.updateClipboard()
		}
		for(const option of setupDDownTag(paramVal.textInput)) {
			const handler = ()=> {
				paramVal.dDown.innerText = option.dataset.value
				toggleHandler()
			}
			option.on("input", handler)
			option.checked && handler()
		}
		toggle.on("change", toggleHandler)
		toggleHandler()
	}
}