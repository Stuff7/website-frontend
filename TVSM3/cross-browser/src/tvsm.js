"use strict"
import tvmaze from "./tvmaze.js"
import { selected } from "./tvmaze.js"
import { showList } from "./utils.js"
import utils from "./utils.js"
import time from "./time_utils.js"

let lastUpdated = (date=> {
	if(date) {
		return new Date(date)
	}
	localStorage.setItem("lastUpdated", new Date(Date.now()))
	return new Date(Date.now())
})(localStorage.getItem("lastUpdated"))
document.title = `TVSM Updated ${time.fromNow(lastUpdated)} ago`

document.onreadystatechange = ()=> 
document.readyState=="interactive"&&(()=>{
	let content = document.querySelector(".content")
	let p = document.querySelector("p")
	let form = document.querySelector("form")
	let input = document.querySelector("input")
	let lists = document.querySelectorAll("ul")
	let [,foundUl,showCols,showUl] = lists
	let selMenu = document.querySelector("#sel-menu")
	let selShows = {
		remove: selMenu.querySelector("button"),
		update: selMenu.querySelector("button:last-child"),
		text: selMenu.querySelector("div"),
	}
	let lastTimeout

	NodeList.prototype.reduce = Array.prototype.reduce

	showList.addListener("change", delay=> {
		utils.timeout(()=> showUl.childNodes.forEach((show, i)=>
			show.querySelector("p").innerText = (i+1+'').padStart(2, 0)),delay)
	})
	showList.addListener("push", (show, i)=> {
		let label = tvmaze.showFull(show, selMenu, selShows)
		showUl.appendChild(label)
		label.classList.add("added")
		utils.timeout(()=> label.classList.remove("added"))
	})
	showList.addListener("edit", (show, i)=> {
		let label = tvmaze.showFull(show, selMenu, selShows)
		let old = showUl.children[i]
		label.querySelector("p").replaceWith(old.querySelector("p"))
		label.querySelector("input").checked = old.querySelector("input").checked
		
		let oldContent = utils.getDivs(old)
		utils.getDivs(label).forEach((div, i)=> {
			if(oldContent[i].innerText != div.innerText)
				div.classList.add("changed")
		})
		
		old.replaceWith(label)
		label.classList.add("updated")
		utils.timeout(()=> label.classList.remove("updated"))
	})
	showList.addListener("sort", (call, sorted)=> {
		let shows = Object.values(showUl.childNodes)
		shows.forEach(show=>show.remove())
		sorted.forEach(show=> showUl.appendChild(shows.find(match=> match.id == show.id)))
	})
	showList.addListener("splice", (index, count)=> {
		let shows = showUl.childNodes
		for(let show = shows[index]; count; show = shows[++index]) {
			show.className = "removed"
			utils.timeout(()=> show.remove())
			count--
		}
	})

	p.onclick = setupList
	selShows.remove.onclick = removeShows
	selShows.update.onclick = ()=> {
		showUl.childNodes.reduce((ids, show, i)=> {
			if(show.querySelector("input").checked) {
				ids.push([show.id, i])
			} return ids
		}, []).forEach((id, i)=> 
			utils.timeout(tvmaze.searchShowByID(
				updated=> { showList.at(id[1], tvmaze.getShowInfo(updated)) }, id[0]), i))
	}

	const sortBy = {};
	["name", "network", "status"].forEach(property=> {
		sortBy[property] = reverse=> showList.sort((a, b)=>
			(reverse||-1) * -a[property].localeCompare(b[property]))
	});
	["seasons", "rating"].forEach(property=> {
		sortBy[property] = reverse=> showList.sort((a, b)=>
			(reverse||-1) * (a[property]+"").localeCompare((b[property]+"")))
	});
	["next", "prev"].forEach(property=> {
		sortBy[property] = reverse=> showList.sort((a, b)=> 
			reverse ? time.closestToNow(a[property].date.getTime(), b[property].date.getTime()) : 
				time.closestToNow(b[property].date.getTime(), a[property].date.getTime()))
	});
	
	const cols = ["name", "next", "prev", "network", "status", "seasons", "rating"]
	showCols.querySelectorAll("div").forEach((col, i)=> {
		let property = cols[i]
		col.onclick = ()=> {
			let sorted = showCols.getAttribute("sortBy") == property
			sortBy[property](sorted)
			showCols.setAttribute("sortBy", sorted && "none" || property)
		}
	})

	input.oninput = ()=> {
		utils.clearNode(foundUl)
		clearTimeout(lastTimeout)
		let msg = input.value.trim()
		if(!msg||msg[0]=='#') return
		lastTimeout = utils.timeout(tvmaze.showSearch(shows=>{
			if(!shows.length) return
			shows.forEach(match=> foundUl.appendChild(tvmaze.showPreview(tvmaze.getShowInfo(match.show))))
			foundUl.firstChild.firstChild.checked = true
		},msg))
	}

	(function setView(savedShows) {
		if(!savedShows) {
			form.onsubmit = ()=> {
				addShows()
				utils.timeout(()=> showList.length&&setupList()&&(form.onsubmit = addShows),3)
				return false
			}
		}
		else {
			JSON.parse(savedShows).forEach(show=> {
				show.next.date = new Date(show.next.date)
				show.prev.date = new Date(show.prev.date)
				show.premiered = new Date(show.premiered)
				showList.push(show)
			})
			setupList()
			form.onsubmit = addShows
		}	
	})(localStorage.getItem("showList"))

	tvmaze.setup(document.body)

	function setupList() {
		let update = utils.updateButton()
		content.style.justifyContent = "normal"
		p.remove()
		lists.forEach(ul=>ul.hidden = false)
		form.classList.add("navbar")
		form.querySelector(".input-wrapper").insertAdjacentElement("afterbegin", update)
		update.querySelector("button").onclick = ()=> {
			showList.forEach((element,i)=> {
				utils.timeout(tvmaze.searchShowByID(show=> { showList.at(i, tvmaze.getShowInfo(show)) }, element.id), i)
			})
			utils.timeout(()=> {
				lastUpdated = new Date(Date.now())
				localStorage.setItem("lastUpdated", lastUpdated)
				document.title = `TVSM Updated ${time.fromNow(lastUpdated)} ago`
			}, showList.length)
		}
		return true
	}

	function addShows() {
		function addToList(show) {
			let i = showList.findIndex(current=> current.id==show.id)
			show = tvmaze.getShowInfo(show)
			i == -1&&showList.push(show)||(showList.at(i, show))
		}
		if(input.value.trim()[0] == '#') {
			let names = input.value.slice(1).split(",")
			names.forEach((name,i)=> utils.timeout(tvmaze.singleShowSearch(addToList, name), i))
			input.value = ""
		}
		else {
			foundUl.childNodes.forEach((match,i)=>
				match.firstChild.checked && utils.timeout(tvmaze.searchShowByID(addToList, match.id), i)
			)
			foundUl.firstChild&&!(input.value = "")&&utils.clearNode(foundUl)
		}
		return false
	}
	function removeShows() {
		let shows = showUl.childNodes.reduce((index, show, i)=> {
			show.firstChild.checked&&index.push(i)
			return index
		}, [])

		shows.reverse().reduce((total, index, i, src)=> {
			if(i == src.length - 1) {
				showList.splice(index, total)
			}
			else if(index == src[i+1] + 1) {
				return ++total
			}
			else {
				showList.splice(index, total)
			}
			return 1
		}, 1)
		selMenu.style.display = "none"
		selected.shows = 0
	}
})()