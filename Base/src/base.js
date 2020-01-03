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
			option.checked||
			fetch("/api/language", {
				method: "POST",
				body: this.dataset.name,
				headers: {
					"X-CSRFToken": getCookie("csrftoken")
				}
			}).then(r=> location.reload()).catch(e=> console.log(e))
		}
	}
	const palette = Palette.random({min:255, max:500}).updateHTML()
	palette.baseColor.updateHSV()
	const colorPicker = ColorPicker(nav.colorDropdown.$(".color-picker"), palette.baseColor)
	nav.home.onclick = ()=> palette.random().updateHTML().baseColor.updateHSV()
	nav.colorDropdown.on("customFocus", ()=> colorPicker.updateUI())
	colorPicker.on("colorchange", ()=> palette.update().updateHTML())

	for(const dropdown of $$(".dropdown"))
		Dropdown(dropdown)
	nav.user.$(".dropdown").on("customBlur", function() {
		this.$("ul").replaceWith(nav.userDropdown)
	})
})