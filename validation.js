import { get, writable } from 'svelte/store';

export const field = (validator, chill) => {
	let node = null;
	let value;
	let message_enabled = false;
	const { set, subscribe } = writable();

	const update = () => {
		const message = node && validator(value);
		if (chill && !message) {
			message_enabled = false;
		}
		set({ valid: !message, message: message_enabled ? message : null });
	};

	update();

	const validate = () => {
		message_enabled = true;
		update();
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

export const validate = (...fields) => {
	let valid = true;
	for (const field of fields) {
		field.validate();
		valid = valid && get(field).valid;
	}
	return valid;
};
