import { writable } from 'svelte/store';

export const field = (validator, chill) => {
	let value;
	let message_enabled = false;
	const { set, subscribe } = writable();

	const update = () => {
		const message = validator(value);
		const valid = !message;
		if (chill && valid) {
			message_enabled = false;
		}
		set({ valid, message: message_enabled ? message : null });
		return valid;
	};

	const validate = () => {
		message_enabled = true;
		return update();
	};

	const action = (node) => {
		const on_blur = (event) => {
			if (!node.contains(event.relatedTarget)) {
				validate();
			}
		};
		node.addEventListener('blur', on_blur, true);
		return { destroy: () => node.removeEventListener('blur', on_blur) };
	};

	action.set = (new_value) => {
		value = new_value;
		update();
	};

	action.validate = validate;

	action.subscribe = subscribe;

	return action;
};

export const validate = (...fields) => fields.reduce((valid, field) => (!field || field.validate()) && valid, true);
