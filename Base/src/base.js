import {$, $$, $onready} from "Libs/dom_utils.js"
import {ColorPicker} from "Libs/color_picker.js"
import {Palette} from "Libs/color.js"
import {Dropdown} from "Libs/dropdown.js"

import {post} from "./utils.js"

$onready(function() {
	const nav = {
		home: $("#nav-home"),
		user: $("#nav-user"),
		userDropdown: $("#nav-user ul"),
		colorDropdown: $("#nav-user-color-inner"),
		langList: $$("#nav-user-lang-inner .scroll input")
	}
	for(const option of nav.langList) {
		option.nextSibling.onclick = function() {
			option.checked||post("user_settings", {language: this.dataset.name})
				.then(r=> location.reload()).catch(e=> console.log(e))
		}
	}
	const colorPicker = ColorPicker(nav.colorDropdown.$(".color-picker"))
	const palette = Palette(colorPicker.color.setOptions({min: 255, max: 500})).update().updateHTML()
	nav.colorDropdown.on("customFocus", ()=> colorPicker.updateUI())

	const randomColorInput = nav.colorDropdown.$(".random-color label input")
	randomColorInput.on("change", function() {
		post("user_settings", {site_color: this.checked? "random" : colorPicker.getColorString()})
	})
	colorPicker.on("colorchange", ()=> {
		palette.update().updateHTML()
		post("user_settings", {site_color: randomColorInput.checked? "random" : colorPicker.getColorString()})
	})

	for(const dropdown of $$(".dropdown"))
		Dropdown(dropdown)
	nav.user.$(".dropdown").on("customBlur", function() {
		this.$("ul").replaceWith(nav.userDropdown)
	})
})