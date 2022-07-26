import { writable } from 'svelte/store';

// create a field object
export const field = (chill) => {
	// the current validation message for the field, regardless of whether it should be presented to the user
	let current_message;
	// a boolean: whether we should currently display any validation messages on this field
	let message_enabled = false;
	// the { valid, message } store we expose
	const { set, subscribe } = writable();

	// update the exposed store value, as appropriate
	const update = () => {
		// the field is valid when the message is falsy
		const valid = !current_message;
		if (chill && valid) {
			// in chill mode, the field becoming valid means we should hide messages until something causes them to be shown again
			message_enabled = false;
		}
		// set the validity (always) and the message (if enabled)
		set({ valid, message: message_enabled ? current_message : null });
		// return the validity, so that .validate() can return it
		return valid;
	};

	// force enable (or disable) validation messages on this field and returns its current validity
	const validate = (display = true) => {
		message_enabled = display;
		// update the value of the store, returning the validity
		return update();
	};

	// we want to be able to use the field object as an action, which is a function
	// so we first create the function, then assign methods onto it
	const action = (node) => {
		// trigger validation whenever focus goes from inside our node to outside our node
		const on_blur = async (event) => {
			// if validation messages aren't already enabled, check whether the new focused element is outside of our node
			// if event.relatedTarget is not available, wait 100ms and then use document.activeElement
			if (!message_enabled && !node.contains(event.relatedTarget || (await new Promise((res) => setTimeout(() => res(document.activeElement), 100))))) {
				// enable displaying validation messages for this field, and update the store
				validate();
			}
		};
		// attach blur event handler at capture phase, because blur doesn't bubble
		node.addEventListener('blur', on_blur, true);
		// remove event handler when action is destroyed
		return { destroy: () => node.removeEventListener('blur', on_blur) };
	};

	// set the validation message and update the store value
	action.set = (message) => {
		current_message = message;
		// update the value of the store, as appropriate
		update();
	};
	// copy over subscribe method from the underlying store
	action.subscribe = subscribe;
	// create the .validate() method on the field object
	action.validate = validate;

	return action;
};

// call .validate() on all of the given fields, and return true if they all returned true
export const validate = (...fields) => fields.reduce((valid, field) => (!field || field.validate()) && valid, true);

// call .validate(false) on all of the given fields
export const reset = (...fields) => fields.forEach((field) => field && field.validate(false));
