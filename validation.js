import { writable } from 'svelte/store';

export const field = (validator, chill) => {
	let node = null;
	let value;
	let message_enabled = false;
	const { set, subscribe } = writable();

	const update = () => {
		const message = node && validator(value);
		const valid = !message;
		if (chill && valid) {
			message_enabled = false;
		}
		set({ valid, message: message_enabled ? message : null });
		return valid;
	};

	update();

	const validate = () => {
		message_enabled = true;
		return update();
	};

	const action = (new_node, new_value) => {
		node = new_node;
		value = new_value;
		update();

		const on_blur = (event) => {
			if (!node.contains(event.relatedTarget)) {
				validate();
			}
		};
		node.addEventListener('blur', on_blur, true);

		return {
			update(new_value) {
				value = new_value;
				update();
			},
			destroy() {
				node.removeEventListener('blur', on_blur);
				node = null;
				update();
			},
		};
	};

	action.validate = validate;

	action.subscribe = subscribe;

	return action;
};

export const validate = (...fields) => fields.reduce((valid, field) => field.validate() && valid, true);
