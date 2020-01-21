"use strict"

import "Base/base.js"
import {post} from "Base/utils.js"
import {$,$$,$onready} from "Libs/dom_utils.js"
import {lastElem,formatStr} from "Libs/utils.js"
import {APISettings} from "./api_settings.js"
import {setupDDownTag} from "./utils.js"

$onready(function() {
	const APIs = []
	for(const api of $$(".api")) {
		const API = APISettings(api)
		API.url.ogURL = API.url.baseURL
		APIs.push(API)
	}
	for(const provider of $$("#customapis-nav [name=customapi-platform]")) {
		function handler() {
			for(const API of APIs) {
				API.url.setURL(formatStr(API.url.ogURL, {provider: this.dataset.value}))
				API.updateClipboard()
				API.updateExample(this.dataset.value)
			}
		}
		provider.on("input", handler)
		provider.checked && handler.call(provider)
	}
	for(const bot of setupDDownTag($(".bots.dropdown"))) {
		function handler() {
			for(const API of APIs) API.setBot(this.dataset.value)
		}
		bot.on("input", handler)
		bot.checked && handler.call(bot)
	}
})