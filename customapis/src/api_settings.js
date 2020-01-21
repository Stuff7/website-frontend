import {ClipboardInput} from "Libs/clipboard.js"
import {formatStr} from "Libs/utils.js"
import {URLConstructor, setupDDownTag} from "./utils.js"

const BOT = {}

export function APISettings(elem, bot) {
	if(!(this instanceof APISettings)) return new APISettings(elem, bot)
	this.provider = "mixer"
	this.exampleCb = ClipboardInput(elem.$(".usage .clipboard"))
	this.bot = BOT[bot] || BOT["nightbot"]
	this.exampleURL = this.exampleCb.value
	this.clipboard = ClipboardInput(elem.$(".clipboard"))
	this.url = URLConstructor(this.clipboard.value, this.clipboard.dataset.params)
	this.setupParams(elem)
}
APISettings.prototype.updateClipboard = function() {
	this.clipboard.setHTML(this.url.getHTML())
}
APISettings.prototype.updateExample = function(provider) {
	if(provider) this.provider = provider
	this.exampleCb.setValue(formatStr(this.bot.cmd, {
		url: formatStr(this.exampleURL, {
			provider: this.provider,
			user: this.bot.user,
			args: this.bot.args
		})
	}))
}
APISettings.prototype.setBot = function(name) {
	if(!BOT[name]) throw TypeError(`Bot name "${name}" isn't defined.`)
	this.bot = BOT[name]
	this.updateExample()
}

APISettings.prototype.setupParams = function(elem) {
	this.params = {}
	const elems = elem.$$(".param")
	let i = 0
	for(const param in this.url.param)
		this.params[param] = elems[i++]
	this.setupParamHandlers()
}
APISettings.prototype.setupParamHandlers = function() {
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

BOT.chatbot = {
	cmd: "$readapi({url})",
	user: "$username",
	args: "$dummyormsg"
}
BOT.botisimo = {
	cmd: "$(fetch {url})",
	user: "$(urlencode $(usernameplain)",
	args: "$(urlencode $(query))"
}
BOT.nightbot = {
	cmd: "$(urlfetch {url})",
	user: "$(user)",
	args: "$(querystring)"
}
BOT.cloudbot = {
	cmd: "{readapi.{url}}",
	user: "{user.name}",
	args: "{start:end}"
}
BOT.streamElements = {
	cmd: "${customapi.{url}}",
	user: "${user.name}",
	args: "${1:}"
}
