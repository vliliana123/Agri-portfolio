import React, {createContext,useState} from 'react';

export const BreadcrumbContext= createContext<{

    breadcrumbLabel:string;
    setBreadcrumbLabel: (label:string) =>void;

}>({breadcrumbLabel:'',setBreadcrumbLabel: () => {}});

export const BreadcrumbProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const [breadcrumbLabel,setBreadcrumbLabel]= useState<string>('');
    return (
        <BreadcrumbContext.Provider value={{breadcrumbLabel,setBreadcrumbLabel}}>
            {children}
        </BreadcrumbContext.Provider>
    );
}
