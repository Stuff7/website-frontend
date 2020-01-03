export const showList = []

showList.addListener = (event, handler)=> showList[`on${event}`] = handler;
["push", "splice", "sort"].forEach(method=> {
	showList[method] = overrideFunction(method, method == "splice")
})
showList.at = (i, value)=> {
	if(i >= showList.length) return
	showList[i] = value
	showList.onedit(value, i)
	saveChanges()
	return value
}

export default {
	getDivs(label) {
		return label.querySelectorAll("div").reduce((divs, div, i)=> {
			if(i!=0 && i!=2 && i!=4) divs.push(div)
			return divs
		}, [])
	},
	updateButton() {
		let div = document.createElement("div")
		let button = document.createElement("button")

		button.innerText = "Update all"
		button.type = "button"
		div.appendChild(button)

		return div
	},
	clearNode(parent) {
		while(parent.firstChild && !parent.firstChild.remove());
	},
	timeout(callback, delay=1) {
		return setTimeout(callback, delay*333)
	},
}


function overrideFunction(name, delay = 0) {
	return (...args)=> {
		let result = Array.prototype[name].call(showList, ...args)
		showList[`on${name}`](...args, result)
		showList.onchange(delay)
		saveChanges()
		return result
	}
}
function saveChanges() {
	localStorage.setItem("showList", JSON.stringify(showList))
}
