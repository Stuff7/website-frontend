import {getDate} from "./time_utils.js"
import { Time } from "./time_utils.js"

export const selected = {shows: 0}
const extraContent = "embed[]=nextepisode&embed[]=previousepisode&embed[]=seasons"

const Status = {
	"To Be Determined": "TBD",
	"In Development": "Dev",
}
const changeEvent = new Event("change")
let mouseDown = 0

export default {
	setup(body) {
		body.onmousedown = e=> {
			mouseDown=e.which
		}
		body.onmouseup = ()=> {
			mouseDown=0
		}
	},
	showPreview(show) {
		let li = createShow(show, true)
		let premiered = document.createElement("div")

		premiered.title = "Premiere date"
		premiered.innerText = getDate(show.premiered)

		li.insertBefore(premiered, li.children[1])
		return li.parentElement
	},
	showFull(show, selMenu, selShows) {
		let li = createShow(show)
		let index = document.createElement("p")
		let next = document.createElement("div")
		let nextDate = document.createElement("div")
		let nextEp = document.createElement("p")
		let prev = document.createElement("div")
		let prevDate = document.createElement("div")
		let prevEp = document.createElement("p")
		let seasons = document.createElement("div")

		nextDate.innerText = getDate(show.next.date)
		prevDate.innerText = getDate(show.prev.date)
		nextEp.innerText = show.next.ep
		prevEp.innerText = show.prev.ep
		seasons.innerText = show.seasons

		nextDate.onmouseenter = ()=> nextDate.innerText = getDate(show.next.date, true)
		nextDate.onmouseleave = ()=> nextDate.innerText = getDate(show.next.date)
		prevDate.onmouseenter = ()=> prevDate.innerText = getDate(show.prev.date, true)
		prevDate.onmouseleave = ()=> prevDate.innerText = getDate(show.prev.date)

		nextEp.onmouseenter = ()=> nextEp.innerText = show.next.left
		nextEp.onmouseleave = ()=> nextEp.innerText = show.next.ep
		prevEp.onmouseenter = ()=> prevEp.innerText = show.prev.left
		prevEp.onmouseleave = ()=> prevEp.innerText = show.prev.ep

		next.appendChild(nextDate)
		next.appendChild(nextEp)
		prev.appendChild(prevDate)
		prev.appendChild(prevEp)

		li.parentElement.querySelector("input").onchange = ev=> {
			if((selected.shows += ev.target.checked||-1)) {
				selMenu.style.display = "flex"
				selShows.text.innerText = `${selected.shows} Show${selected.shows>1&&"s"||""} selected`
			}
			else {
				selMenu.style.display = "none"
			}
		}

		li.firstChild.insertAdjacentElement("afterbegin", index)
		li.insertBefore(next, li.children[1])
		li.insertBefore(prev, li.children[2])
		li.insertBefore(seasons, li.children[5])

		return li.parentElement
	},

	showSearch(callback=()=>{}, show="") {
		return ()=>
		jsonRequest(`https://api.tvmaze.com/search/shows?q=${show}`, callback)
	},
	singleShowSearch(callback=()=>{}, show="") {
		return ()=> 
		jsonRequest(`https://api.tvmaze.com/singlesearch/shows?q=${show}&${extraContent}`, callback)
	},
	searchShowByID(callback=()=>{}, id=0) {
		return ()=>
		jsonRequest(`https://api.tvmaze.com/shows/${id}?${extraContent}`, callback)
	},


	getShowInfo(json) {
		return {
			id: json.id,
			name: json.name,
			network: json.network&&json.network.name||json.webChannel&&json.webChannel.name||'—',
			status: Status[json.status]||json.status||'—',
			rating: json.rating&&json.rating.average||0,
			premiered: json.premiered&&new Date(`${json.premiered}T00:00:00`)||Time.min,
			...getEmbeddedInfo(json),
		}
	},
}

function getEp(ss, ep) {
	return `S${(ss+'').padStart(2,0)}E${(ep+'').padStart(2,0)}`
}


function createShow(show, tooltips) {
	let label = document.createElement("label")
	let input = document.createElement("input")
	let li = document.createElement("li")
	let name = document.createElement("div")
	let network = document.createElement("div")
	let status = document.createElement("div")
	let rating = document.createElement("div")

	input.type = "checkbox"
	input.hidden = true

	if(tooltips) {
		name.title = "Name"
		network.title = "Network"
		status.title = "Status"
		rating.title = "Rating"
	}
	name.innerHTML = `<div>${show.name}</div>`
	network.innerText = show.network
	status.innerText = show.status
	rating.innerText = show.rating&&show.rating.toFixed(1)||'—'

	label.appendChild(input)
	label.appendChild(li)
	li.appendChild(name)
	li.appendChild(network)
	li.appendChild(status)
	li.appendChild(rating)

	label.id = show.id
	label.onmouseover = ()=> {
		if(mouseDown == 1) {
			input.checked ^= true
			input.dispatchEvent(changeEvent)
		}
	}
	label.onmousedown = e=> {
		if(e.which == 1) {
			input.checked ^= true
			input.dispatchEvent(changeEvent)
		}
	}
	label.onclick = ()=> false

	return li
}

function getEmbeddedInfo(json) {
	const info = {
		next: {ep: 'TBD', date: Time.min, left: "SECRET"},
		prev: {ep: 'TBD', date: Time.min, left: "SECRET"},
		seasons: '—',
	}
	if(!json._embedded) {return info}
	
	info.seasons = json._embedded.seasons.length;
	[{short: "next", long: "nextepisode"}, {short: "prev", long: "previousepisode"}]
	.forEach(prop=> {
		let season, ep, current
		if((current = json._embedded[prop.long])) {
			info[prop.short].ep = getEp((season = current.season), (ep = current.number))
			info[prop.short].date = new Date(current.airstamp)
		}
		else if((current = json._embedded.previousepisode) && info.seasons > current.season) {
			info[prop.short].ep = getEp((season = current.season+1), (ep = 1))
		}
		if(season && (current = json._embedded.seasons[season-1].episodeOrder)) {
			let remaining = current - ep
			info[prop.short].left = remaining&&remaining+" LEFT"||"LAST"
		}
	})
	
	info.seasons = (info.seasons+'').padStart(2,0)

	return info
}
function jsonRequest(url, callback) {
	fetch(url)
		.then(r=>r.status==200&&r.json()).then(json=>{
			callback(json)
		}
	)
	return true
}