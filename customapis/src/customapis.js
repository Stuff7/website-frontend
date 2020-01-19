"use strict"

import "Base/base.js"
import {post} from "Base/utils.js"
import {$,$$,$onready} from "Libs/dom_utils.js"

$onready(function() {
	const tableDDowns = $$(".param .dropdown")
	
	for(const dDown of tableDDowns) {
		const title = dDown.$("span")
		const options = dDown.$$("ul label")
		
		for(const option of options) {
			const state = option.$("input")
			const name = option.$("li")
			state.on("change", function() {
				title.innerText = name.innerText
				console.log(name.dataset.name)
			})
		}
	}
})