import { AlertCircle, Check, Loader2 } from "lucide-react";

// Wrapper para campos com indicador de API
export const ApiFieldWrapper = ({ 
    children, 
    apiStatus, 
    errorMessage
  }: Readonly<{ 
    children: React.ReactNode;
    apiStatus: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string;
  }>) => {
    return (
      <div className="relative w-full">
        <div className="relative">
          {children}
          {/* Indicador de status da API */}
          {(apiStatus === 'loading' || apiStatus === 'success' || apiStatus === 'error') && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
              <div className="flex items-center justify-center w-5 h-5">
                {apiStatus === 'loading' && (
                  <Loader2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300 animate-spin" />
                )}
                {apiStatus === 'success' && (
                  <Check className="w-4 h-4 text-[var(--cor-principal)]" />
                )}
                {apiStatus === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Mensagem de erro abaixo do campo */}
        {apiStatus === 'error' && errorMessage && (
          <div className="mt-1 text-xs text-red-500">
            {errorMessage}
          </div>
        )}
      </div>
    );
  };