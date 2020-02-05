import {getCookie} from "Libs/dom_utils.js"

const API = {
	user_settings: "/api/user/settings",
	switch_view: "/api/account/view"
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
export function simplePost(endpoint, data) {
	return fetch(API[endpoint], {
		method: "POST",
		body: data,
		headers: {
			"Content-Type": "text/plain",
			"X-CSRFToken": getCookie("csrftoken")
		}
	})
}