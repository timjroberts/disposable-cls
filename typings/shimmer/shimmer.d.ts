declare module Shimmer {
	export function wrap(nodule: Object, name: string, wrapper: Function): Function;
	
	export function massWrap(nodules: Object[], names: string[], wrapper: Function);
	
	export function unwrap(nodule: Object, name: string): void;
}

declare module "shimmer" {
	export = Shimmer;
}