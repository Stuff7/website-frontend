"use strict"

import "Base/base.js"
import {post} from "Base/utils.js"
import {$,$$,$onready} from "Libs/dom_utils.js"
import {lastElem,formatStr} from "Libs/utils.js"
import {APISettings} from "./api_settings.js"

$onready(function() {
	const APIs = []
	for(const api of $$(".api")) {
		const API = APISettings(api)
		API.url.ogURL = API.url.baseURL
		APIs.push(API)
	}
	for(const provider of $$("#customapi-cmd-col input[name=customapi-cmd-platform]")) {
		function handler() {
			for(const API of APIs) {
				API.url.setURL(formatStr(API.url.ogURL, {provider: this.dataset.value}))
				API.updateClipboard()
			}
		}
		provider.on("input", handler)
		provider.checked && handler.call(provider)
	}
})