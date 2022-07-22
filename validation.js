import { get, writable } from 'svelte/store';

export const field = (validator) => {
	let node = null;
	let value;
	let message_enabled = false;
	const validity = { valid: true, message: null };

	const { set, subscribe } = writable(validity);

	const update = () => {
		const message = node && validator(value);
		validity.valid = !message;
		validity.message = message_enabled ? message : null;
		set(validity);
	};

	const enable_message = () => {
		message_enabled = true;
		update();
	};

	const action = (new_node, new_value) => {
		node = new_node;
		value = new_value;
		update();

		node.addEventListener('blur', enable_message);

		return {
			update(new_value) {
				value = new_value;
				update();
			},
			destroy() {
				node.removeEventListener('blur', enable_message);
				node = null;
				message_enabled = false;
				update();
			},
		};

	};

	action.validate = () => node && enable_message();

	action.subscribe = subscribe;

	return action;
};

export const validate = (...fields) => {
	let valid = true;
	for (const field of fields) {
		field.validate();
		valid = valid && get(field).valid;
	}
	return valid;
};
