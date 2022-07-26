import { writable } from 'svelte/store';

export const field = (chill) => {
	let current_message;
	let message_enabled = false;
	const { set, subscribe } = writable();

	const update = () => {
		const valid = !current_message;
		if (chill && valid) {
			message_enabled = false;
		}
		set({ valid, message: message_enabled ? current_message : null });
		return valid;
	};

	const validate = (display = true) => {
		message_enabled = display;
		return update();
	};

	const action = (node) => {
		const on_blur = async (event) => {
			if (!message_enabled && !node.contains(event.relatedTarget || (await new Promise((res) => setTimeout(() => res(document.activeElement), 100))))) {
				validate();
			}
		};
		node.addEventListener('blur', on_blur, true);
		return { destroy: () => node.removeEventListener('blur', on_blur) };
	};

	action.set = (message) => {
		current_message = message;
		update();
	};
	action.subscribe = subscribe;
	action.validate = validate;

	return action;
};

export const validate = (...fields) => fields.reduce((valid, field) => (!field || field.validate()) && valid, true);

export const reset = (...fields) => fields.forEach((field) => field && field.validate(false));
