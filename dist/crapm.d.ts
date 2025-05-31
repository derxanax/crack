#!/usr/bin/env node
declare class CrapmManager {
    private baseUrl;
    showLogo(): void;
    install(moduleName: string): Promise<void>;
    listAvailable(): Promise<void>;
    uninstall(moduleName: string): void;
    list(): void;
    private downloadFile;
}
export { CrapmManager };
//# sourceMappingURL=crapm.d.ts.map