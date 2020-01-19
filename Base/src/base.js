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
	const cssVarSupport = window.CSS && CSS.supports('color', 'var(--fake-var)')
	const dropdown = $("#nav-user-color-inner")
	const colorPicker = ColorPicker(dropdown.$(".color-picker"))
	let updateColor

	if(cssVarSupport) {
		const palette = Palette(colorPicker.color.setOptions({min: 255, max: 500}))
		updateColor = color=> { palette.update().updateHTML() }
	}
	else {
		const navHide = $("#nav-hide + label")
		const icons = $$("#nav-user svg, footer svg")
		const homeIcon = $("#nav-home svg")
		const homeText = $("#nav-home span")
		const homeBorder = $("#nav-home")
		const dropdownLabels = $$(".dropdown ul > label:first-child li")
		const dropdowns = $$(".dropdown ul, nav, footer")

		const darker = "rgba(12,12,12,.6)"
		const normal = "rgba(153,153,153,.5)"
		let light = "rgba(255,255,255,.8)"

		for(const menu of dropdowns)
			menu.style.backgroundColor = darker

		for(const svg of icons) {
			svg.style.fill = normal
			svg.on("mouseleave", function() {this.style.fill = normal})
			svg.on("mouseenter", function() {this.style.fill = light})
		}
		navHide.style.stroke = normal
		navHide.on("mouseleave", function() {this.style.stroke = normal})
		navHide.on("mouseenter", function() {this.style.stroke = light})

		updateColor = color=> {
			light = color.strength(1.5).toString()
			document.documentElement.style.backgroundColor = color.toString()
			document.body.style.backgroundColor = "rgba(21,21,21,.5)"
			for(const label of dropdownLabels)
				label.style.backgroundColor = color.toRGBString().slice(0,-1)+",.5)"
			homeBorder.style.borderColor = homeIcon.style.fill = homeText.style.color = light
		}
	}

	const alwaysRandom = dropdown.$(".random-color label input")
	updateColor(colorPicker.color)
	dropdown.on("customFocus", ()=> colorPicker.updateUI())
	colorPicker.on("colorinput", updateColor)
	/*colorPicker.on("colorchange", ()=> post("user_settings",
		{site_color: alwaysRandom.checked? "random" : colorPicker.getColorString()}))*/
}