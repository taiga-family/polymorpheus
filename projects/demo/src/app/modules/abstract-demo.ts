export abstract class AbstractDemo {
    public abstract readonly example: Record<string, any>;
    protected readonly tabs = ['HTML', 'Style', 'TypeScript'];
    protected activeTab = 'HTML';

    protected get code(): string {
        const code = this.example[this.activeTab];

        return typeof code === 'string' ? code : code.default;
    }
}
