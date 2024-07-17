import { writable } from "svelte/store";

export let idList = writable<string[]>([]);

export const isLeftMenuMenuInUse = writable(false);
export const showLeftMenu = writable(false);
