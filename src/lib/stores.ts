import { readable, writable } from "svelte/store";

export let idList = writable<string[]>([]);

export let alexandriaKinds = readable<number[]>([30040, 30041]);

export const isLeftMenuMenuInUse = writable(false);
export const showLeftMenu = writable(false);
