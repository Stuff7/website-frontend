import {getCookie} from "Libs/dom_utils.js"

const API = {
	user_settings: "/api/user/settings",
	uptime_settings: "/api/uptime/settings"
}

export function post(endpoint, data) {
	return fetch(API[endpoint], {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": getCookie("csrftoken")
		}
	})
}