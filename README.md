# svelte-tiny-validator

A tiny unframework for form validation in Svelte.

## Overview

This is a tiny form validation library that assumes you are okay with writing your own code to check the validity of form values. It also makes a couple other (hopefully reasonable) assumptions about how you want your form to work:

- Fields should not display validation errors until you first leave the field, or until you try to submit the form.
- Validation errors should disappear the moment you fix them, not when you next leave the field.

What's less clear is when validation errors should reappear if they're reintroduced after having been addressed. There doesn't seem to be any consensus on what behavior is better, so this library supports two different options. You can even use both within the same form, if the fancy strikes you. Lacking better names, these are called here __default mode__ and __chill mode__.

### Default mode

In __default mode__, once a field begins to display its validation message, it will continue to do so if applicable (until it is manually reset).

For example, if you tab through a required field without filling it, its validation message will begin to show. If you return to it and fill it in, the validation message will disappear. If you then clear the field without leaving it, the validation will again immediately appear.

### Chill mode

In __chill mode__, a field never re-displays its validation message until focus leaves (or until it is manually validated).

Using the same example as above, imagine that you've returned to a required field and have filled it in, and the validation message has disappeared. If you now clear the field, the validation message will not reappear until you again leave the field.

## Usage

### `validator(chill)`

The most important export from this library is the `validator` function.

```js
import { validator } from '@conduitry/svelte-tiny-validator';

const foo_v = validator();
```

The optional argument to `validator` is a boolean indicating whether to use default or chill mode. `false` is default, and `true` is chill.

The object that this function returns can be interacted with in four different ways. These are:

#### 1. A store you can write validation messages to

Whenever appropriate, you should write the validation message to the store. If the value is valid, write a falsy value to the store. If the value is invalid, write an arbitrary truthy validation error. The library doesn't care what sort of value this is, and it will just be returned as-is to your code when the message should be displayed. It will commonly be a string, or perhaps an array of strings.

This update would usually happen through a reactive declaration (`$:`) whenever the value changes.

```js
let foo;
const foo_v = validator();
$: $foo_v = is_good(foo) ? null : 'This is bad.';
```

Using a writable store like this is helpful because it ensures that if you have another reactive block that reads from the store, the write will happen before the read, and you will have the most up-to-date validation information. However, the value that you write will not necessarily be the same as the value that you read (see below), and if this is too magical, you can use the `.set()` method on the validator object instead, which is what writing to the store compiles to.

```js
let foo;
const foo_v = validator();
$: foo_v.set(is_good(foo) ? null : 'This is bad.');
```

#### 2. A store you can read the validation message from

Each validator instance is also a readable store, whose value is the previously set validation message if the validator should now be showing the message. The store's value is `null` if the validator should not yet be displaying its validation message.

```svelte
{#if $foo_v}
	<div class='error'>{$foo_v}</div>
{/if}
```

#### 3. An action to use on elements whose loss of focus should trigger validation messages to show

Use this to connect validator objects with DOM elements that should trigger the respective validation messages to be shown.

```svelte
<input type='text' bind:value={foo} use:foo_v>
{#if $foo_v}
	<div class='error'>{$foo_v}</div>
{/if}
```

This does not need to be used directly on the `<input>` element that's bound to the value. It also does not need to be used only on a single element. Any time the focus goes from inside an element with `use:foo_v` to outside it, `foo_v` will have its validation messages enabled if they were currently disabled.

This can be used for conceptual regions on the form, which should not validate until the focus has first left that entire region.

```svelte
<script>
	let foo = false;
	let bar = false;
	const foo_bar_v = validator();
	$: $foo_bar_v = is_good(foo, bar) ? null : 'This is bad.';
</script>

<div use:foo_bar_v>
	<input type='checkbox' bind:checked={foo}>
	<input type='checkbox' bind:checked={bar}>
	{#if $foo_bar_v}
		<div class='error'>{$foo_bar_v}</div>
	{/if}
</div>
```

#### 4. An object with a `.validate()` method to manually trigger validation

If you need to manually trigger a validator, you can call its `.validate()` method. This will cause the current validation message (if any) to become active, even if the validator's associate DOM elements have never been touched. It also returns a boolean indicating whether the value passes validation.

```js
const foo_v = validator();

// ...

if (foo_v.validate()) {
	// ...
}
```

By passing `false` to `.validate()`, you can also indicate that a validator should no longer display its validation message.

```js
foo_v.validate(false);
```

Note that this will not change the value of `$foo_v.valid`.

You will often be validating or resetting multiple validators at once, in which case the `validate()` and `reset()` helper functions below will be useful.

## `validate(...validator)`

```js
import { validate } from '@conduitry/svelte-tiny-validator';

// ...

if (validate(foo_v, bar_v)) {
	// ...
}
```

This calls `.validate()` on each of the validators, and returns `true` if all of them returned `true`. Typically, this would be called when the user attempts to submit the form, checking whether the entire form is valid, and displaying any validation errors if not.

Note that this will call `.validate()` on all validators that are passed, and will not stop on the first one that fails validation. This is usually what you want when the user tries to submit a form.

Any validator arguments that are falsy will be skipped and will not affect the result. This lets you write code like:

```js
if (validate(foo_v, should_validate_bar_v && bar_v, baz_v)) {
	// ...
}
```

## `reset(...validators)`

```js
import { reset } from '@conduitry/svelte-tiny-validator';

// ...

reset(foo_v, bar_v);
```

This calls `.validate(false)` on each of the validators. This does not reset the values of any of the fields; it just marks them all as no longer showing their validation errors. Typically, this would be called at the same time as resetting all of the field values.

Here, too, any validator arguments that are falsy will be skipped.

## License

[MIT](LICENSE)
