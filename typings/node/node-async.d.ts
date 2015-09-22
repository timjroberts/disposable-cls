declare module NodeJS {
	export interface AsyncListenerCallbacks {
		create?(storage?: any): any;
		
		before?(context: any, storage: any): void;
		
		after?(context: any, storage: any): void;
		
		error?(storage: any, error: Error): void;
	}

	export interface Process extends EventEmitter {
		addAsyncListener(callbacks: AsyncListenerCallbacks, initialStorage?: any);
	}	
}
