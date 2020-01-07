import {$, $$, $onready, getCookie} from "Libs/dom_utils.js"
import {ColorPicker} from "Libs/color_picker.js"
import {Palette} from "Libs/color.js"
import {Dropdown} from "Libs/dropdown.js"

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
			option.checked||postChanges("language", this.dataset.name)
				.then(r=> location.reload()).catch(e=> console.log(e))
		}
	}
	const colorPicker = ColorPicker(nav.colorDropdown.$(".color-picker"))
	const palette = Palette(colorPicker.color.setOptions({min: 255, max: 500})).update().updateHTML()
	nav.colorDropdown.on("customFocus", ()=> colorPicker.updateUI())

	const randomColorInput = nav.colorDropdown.$(".random-color label input")
	randomColorInput.on("change", function() {
		postChanges("site_color", this.checked? "random" : colorPicker.getColorString())
	})
	colorPicker.on("colorchange", ()=> {
		palette.update().updateHTML()
		postChanges("site_color", randomColorInput.checked? "random" : colorPicker.getColorString())
	})

	for(const dropdown of $$(".dropdown"))
		Dropdown(dropdown)
	nav.user.$(".dropdown").on("customBlur", function() {
		this.$("ul").replaceWith(nav.userDropdown)
	})
})

function postChanges(k, v) {
	const data = {}
	data[k] = v
	return fetch("/api/user/settings/", {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"X-CSRFToken": getCookie("csrftoken")
		}
	})
}