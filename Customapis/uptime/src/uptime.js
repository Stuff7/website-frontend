"use strict"

import "Base/base.js"
import {Palette} from "Libs/color.js"
import {$, $$, $onready, createLogger, getCookie} from "Libs/dom_utils.js"
import {createURL,getDatePicker} from "./utils.js"

$onready(function() {
	const copyButton = $(".cpy .button")
	const copyInput = $(".cpy .input")
	const logger = createLogger()
	const html = $("html")
	const params = $$(".param")
	const url = createURL(copyInput.dataset.url, copyInput.dataset.id)
	const preview = $(".prompt > a:first-child")
	const datepicker = getDatePicker()

	params.map = Array.prototype.map

	preview.update = function() {
		fetch(url.getUrl()).then(r=> r.text()).then(uptime=> {
			this.innerText = uptime
		})
	}

	copyInput.select = function() {
		const range = document.createRange();
		range.selectNode(this);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
	}

	copyInput.innerHTML = url.setAll(...params.map((p, i)=> {
		const input = p.$("[contenteditable]"),
					toggle = p.$("[type=checkbox]")
		let lastTimeout = 0

		toggle.on("change", function() {
			copyInput.innerHTML = url.turn(i, this.checked)
			fetch("/api/uptime", {
				method: "POST",
				body: url.getAsField(i, this.checked, true),
				headers: {
					"X-CSRFToken": getCookie("csrftoken")
				}
			})
			preview.update()
		})
		const response = {enabled: toggle.checked}
		if(input) {
			response.msg = encodeURI(input.innerText)
			input.on("input", function() {
				clearTimeout(lastTimeout)
				copyInput.innerHTML = url.set(i, encodeURI(this.innerText))
				lastTimeout = setTimeout(()=> {
					fetch("/api/uptime", {
						method: "POST",
						body: url.getAsField(i, this.innerText),
						headers: {
							"X-CSRFToken": getCookie("csrftoken")
						}
					})
					preview.update()
				}, 1e3)
			})
		}
		else {
			const dropdownTag = p.$("#datepicker span")
			response.msg = encodeURI(datepicker.date.toISOString())
			datepicker.on("datechange", function(date) {
				const ISOString = date.toISOString()
				dropdownTag.innerText = this.toString()
				copyInput.innerHTML = url.set(i, encodeURI(ISOString))
				fetch("/api/uptime", {
					method: "POST",
					body: url.getAsField(i, ISOString),
					headers: {
						"X-CSRFToken": getCookie("csrftoken")
					}
				})
				preview.update()
			})
		}
		return response
	}))
	preview.update()

	copyInput.onclick = function() {this.select()}
	copyButton.onclick = function() {
		copyInput.select()
		document.execCommand("copy")
		window.getSelection().removeAllRanges();
		logger.show()
	}
})