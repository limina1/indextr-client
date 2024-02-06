import { writable } from "svelte/store";

export let idList = writable<string[]>([]);
