export interface ICloseable {
    onClose?: () => void;
    close(): Promise<unknown>;
}
export default class CloseableCollection<T extends ICloseable> {
    private items;
    add(item: T): void;
    delete(item: T): void;
    closeAll(): Promise<void>;
}
