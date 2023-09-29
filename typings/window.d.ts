import { BrowserWindow } from 'electron';
export declare let mainWindow: BrowserWindow;
export declare let inviteWindow: BrowserWindow;
export declare function createCustomWindow(): Promise<void>;
export declare function createNativeWindow(): Promise<void>;
export declare function createTransparentWindow(): Promise<void>;
export declare function createInviteWindow(code: string): Promise<void>;
//# sourceMappingURL=window.d.ts.map