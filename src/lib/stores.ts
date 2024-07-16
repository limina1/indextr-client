import { writable } from "svelte/store";

export let idList = writable<string[]>([]);

export const isLeftHamburgerMenuInUse = writable(false);

export const leftHamburgerMenuItems = writable<string[]>([]);
export const leftHamburgerMenuHrefs = writable<Map<string, string>>(new Map());
