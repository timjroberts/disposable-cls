/**
 * Represents a context stack item that holds contextual data and associated items
 * in scope for the duration of an asynchronous invocation.
 */
export class ContextStackItem {
	private _data: Object;
	private _parent: ContextStackItem;
	private _refCount: number;

	/**
	 * Initializes a new context stack item.
	 * 
	 * @param data An object that will be held in scope.
	 * @param parent The parent context stack item.
	 */
	constructor(data: Object, parent: ContextStackItem) {
		this._data = data;
		this._parent = parent;
		this._refCount = 1;
	}

	/**
	 * Gets the context data for the current context stack item.
	 * 
	 * @returns An object that contains the context data for the current context stack item.
	 */
	public get data(): Object {
		return this._data;
	}

	/**
	 * Gets the parent context stack item.
	 * 
	 * @returns A context stack item that is the parent of the current.
	 */
	public get parent(): ContextStackItem {
		return this._parent;
	}

	/**
	 * Gets the reference count of the current context stack item.
	 * 
	 * @returns The current reference count.
	 */
	public get refCount(): number {
		return this._refCount;
	}

	/**
	 * Adds a reference to the current context stack item.
	 * 
	 * @returns The current reference count.
	 */
	public addRef(): number {
		return this._refCount++;
	}

	/**
	 * Releases a reference from the current context stack item.
	 * 
	 * @returns The current reference count.
	 */
	public release(): number {
		return this._refCount--;
	}
}
