# svelte-tiny-validation

A tiny unframework for form validation in Svelte.

## Overview

This is a tiny form validation library that assumes you are okay with writing your own code to check the validity of field values. It also makes a couple other (hopefully reasonable) assumptions about how you want your form to work:

- Fields should not display validation errors until you first leave the field, or until you try to submit the form.
- Validation errors should disappear the moment you fix them, not when you next leave the field.

What's less clear is when validation errors should reappear if they're reintroduced after having been addressed. There doesn't seem to be any consensus on what behavior is better, so this library supports two different options. You can even use both within the same form, if the fancy strikes you. Lacking better names, these are called here __default mode__ and __chill mode__.

### Default mode

In __default mode__, once a field begins to display its validation message, it will continue to do so if applicable (until the field is reset).

For example, if you tab through a required field without filling it, its validation message will begin to show. If you return to it and fill it in, the validation message will disappear. If you then clear the field without leaving it, the validation will again immediately appear.

### Chill mode

In __chill mode__, a field never re-displays its validation message until focus leaves (or until the field is manually validated).

Using the same example as above, imagine that you've returned to a required field and have filled it in, and the validation message has disappeared. If you now clear the field, the validation message will not reappear until you again leave the field.

## Usage

### `field(chill)`

The most important export from this library is the `field` function.

```js
import { field } from '@conduitry/svelte-tiny-validation';

const foo_field = field(false);
```

The argument to `field` is a boolean indicating whether to use default or chill mode. `false` is default, and `true` is chill.

The object that this function returns can be interacted with in four different ways. These are:

#### 1. A store you can write field validation messages to

Whenever appropriate, you should write the validation message to the store. If the field contains a valid value, write a falsy value to the store. If the field contains an invalid value, write an arbitrary truthy validation error. The library doesn't care what sort of value this is, and it will just be returned as-is to your code when the message should be displayed. It will commonly be a string, or perhaps an array of strings.

This update would usually happen through a reactive declaration (`$:`) whenever the value of the field changes.


```js
let foo_value;
const foo_field = field(false);
$: $foo_field = is_good(foo_value) ? null : 'This is bad.';
```

#### 2. A store you can read the validation information from

Each field instance is also a readable store, whose value is a `{ valid, message }` object.

`valid` is a boolean indicating whether the current field value is valid, regardless of whether its validation message should now be showing. (That is, it will be true if you set the store to a falsy value, and it will be false if you set it to a truthy value.)

`message` is the specific message you previously set if the field should now be showing its validation messages, and is `null` otherwise.

```js
if ($foo_field.valid) {
	// ...
}
```

```svelte
{#if $foo_field.message}
	<div class='error'>{$foo_field.message}</div>
{/if}
```

#### 3. An action to use on elements whose loss of focus should trigger validation messages to show

Use this to connect field objects with DOM elements that should trigger the respective validation messages to be shown.

```svelte
<input type='text' bind:value={foo_value} use:foo_field>
{#if $foo_field.message}
	<div class='error'>{$foo_field.message}</div>
{/if}
```

This does not need to be used directly on an `<input>` element that's bound to the field value. It also does not need to be used only on a single element. Any time the focus goes from inside an element with `use:foo_field` to outside it, `foo_field` will have its validation messages enabled if they were currently disabled.

This can be used for conceptual regions on the form, which should not validate until the focus has first left that entire region.

```svelte
<script>
	let foo_value = false;
	let bar_value = false;
	const foo_bar_field = field(false);
	$: $foo_bar_field = is_good(foo_value, bar_value) ? null : 'This is bad.';
</script>

<div use:foo_bar_field>
	<input type='checkbox' bind:checked={foo_value}>
	<input type='checkbox' bind:checked={bar_value}>
	{#if $foo_bar_field.message}
		<div class='error'>{$foo_bar_field.message}</div>
	{/if}
</div>
```

#### 4. An object with a `.validate()` method to manually trigger validation

If you need to manually trigger validation on a field, you can call its `.validate()` method. This will cause the current validation message (if any) to become active, even if the field has never been touched. It also returns a boolean indicating whether the field passes validation.

```js
const foo_field = field(false);

// ...

if (foo_field.validate()) {
	// ...
}
```

By passing `false` to `.validate()`, you can also indicate that a field should no longer display its validation message.

```js
foo_field.validate(false);
```

Note that this will not change the value of `$foo_field.valid`.

You will often be validating or resetting multiple fields at once, in which case the `validate()` and `reset()` helper functions below will be useful.

## `validate(...fields)`

```js
import { validate } from '@conduitry/svelte-tiny-validation';

// ...

if (validate(foo_field, bar_field)) {
	// ...
}
```

This calls `.validate()` on each of the fields, and returns `true` if all of them returned `true`. Typically, this would be called when the user attempts to submit the form, checking whether the entire form is valid, and displaying any validation errors if not.

Note that this will call `.validate()` on all fields that are passed, and will not stop on the first one that fails validation. This is usually what you want when the user tries to submit a form.

## `reset(...fields)`

```js
import { reset } from '@conduitry/svelte-tiny-validation';

// ...

reset(foo_field, bar_field);
```

This calls `.validate(false)` on each of the fields. This does not reset the _values_ of any of fields; it just marks them all as no longer showing their validation errors. Typically, this would be called at the same time as resetting all of the fields values.

## License

[MIT](LICENSE)
