"use strict"

import "Base/base.js"
import {Palette} from "Libs/color.js"
import {$, $$, $onready, createLogger} from "Libs/dom_utils.js"
import {URLConstructor,getDatePicker,postChanges} from "./utils.js"

$onready(function() {
	const copyInput = $(".cpy .input")
	const logger = createLogger()
	const url = URLConstructor(copyInput.dataset.url)
	const preview = $(".prompt > a:first-child")
	const datepicker = getDatePicker()

	function updatePreview() {
		fetch(url.getURL()).then(r=> r.text()).then(uptime=> {
			preview.innerText = uptime
		})
	}

	for(const param of $$(".param")) {
		const input = param.$("[contenteditable]")
		const toggle = param.$("[type=checkbox]")
		const name = param.$(".label span").innerText

		const toggleName = name+"_on"
		const value = input? ()=> input.innerText : ()=> datepicker.date.toISOString()

		function updateUI(val = value()) {
			toggle.checked? url.add(name, val) : url.remove(name)
			copyInput.innerHTML = url.getHTML()
			updatePreview()
		}
		toggle.checked? url.add(name, value()) : url.remove(name)

		toggle.on("change", function() {
			updateUI()
			postChanges(toggleName, this.checked)
		})

		if(input) {
			const inputName = name+"_msg"
			let lastTimeout = 0
			input.on("input", function() {
				updateUI(this.innerText)
				clearTimeout(lastTimeout)
				lastTimeout = setTimeout(()=> postChanges(inputName, this.innerText), 1e3)
			})
		}
		else {
			const inputName = name+"_date"
			const dropdownTag = param.$("#datepicker span")
			datepicker.on("datechange", function(date) {
				const ISOString = date.toISOString()
				updateUI(ISOString)
				dropdownTag.innerText = this.toString()
				postChanges(inputName, ISOString)
			})
		}
	}
	copyInput.innerHTML = url.getHTML()
	updatePreview()

	$(".cpy .button").on("click", function() {
		const range = document.createRange();
		range.selectNode(copyInput);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
		document.execCommand("copy")
		window.getSelection().removeAllRanges();
		logger.show()
	})
})