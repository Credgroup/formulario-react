import { createContext, useContext, useState, type ReactNode } from "react";

interface SbsConfigContextType {
    config: {
        logs?: boolean;
        messages?: {
            onBlankLayout: string;
        },

    }
}

const SbsConfigContext = createContext<SbsConfigContextType | {}>({});

export const SbsConfigProvider = ({ children }: Readonly<{ children?: ReactNode }>) => {
    const [config] = useState<SbsConfigContextType>({config: {}});
    return (
        <SbsConfigContext.Provider value={config}>
            {children}
        </SbsConfigContext.Provider>
    )
}

export const useSbsConfigContext = () => {
    const context = useContext(SbsConfigContext);
    if (!context) {
        throw new Error('useSbsConfigContext must be used within a SbsConfigProvider');
    }
    return context;
}