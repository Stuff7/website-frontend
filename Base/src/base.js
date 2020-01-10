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
		langList: $$("#nav-user-lang-inner .scroll input")
	}
	setupColorChanges()
	for(const option of nav.langList) {
		option.nextSibling.onclick = function() {
			option.checked||post("user_settings", {language: this.dataset.name})
				.then(r=> location.reload()).catch(e=> console.log(e))
		}
	}
	for(const dropdown of $$(".dropdown"))
		Dropdown(dropdown)
	nav.user.$(".dropdown").on("customBlur", function() {
		const ul = this.$("ul")
		ul.classList.contains("inner-dropdown")&&ul.replaceWith(nav.userDropdown)
	})
})

function setupColorChanges() {
	const dropdown = $("#nav-user-color-inner")
	const colorPicker = ColorPicker(dropdown.$(".color-picker"))
	const palette = Palette(colorPicker.color.setOptions({min: 255, max: 500})).update().updateHTML()

	const alwaysRandom = dropdown.$(".random-color label input")
	colorPicker.on("colorinput", ()=> palette.update().updateHTML())
	colorPicker.on("colorchange", ()=> post("user_settings",
		{site_color: alwaysRandom.checked? "random" : colorPicker.getColorString()}))
}