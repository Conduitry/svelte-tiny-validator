import { Action } from 'svelte/action';
import { Writable } from 'svelte/store';

type Falsy = false | 0 | '' | null | undefined;

type Validator<T> = Action &
	Writable<T | Falsy> & {
		validate: (display?: boolean) => boolean;
	};

export function validator<T = string>(chill?: boolean): Validator<T>;

export function validate(...validators: (Validator<any> | Falsy)[]): boolean;

export function reset(...validators: (Validator<any> | Falsy)[]): boolean;
