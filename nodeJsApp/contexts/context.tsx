import { React } from "../app"
import { useState, useContext, createContext } from "react";

interface IType {
    messages: any;
    setMessages: any;

    approvalData: any;
    setApprovalData: any;

    cart: any;
    setCart: any;

    user: any;
    setUser: any
}

const appContext = createContext<IType>({
    messages: [],
    setMessages: () => { },

    approvalData: () => { },
    setApprovalData: () => { },

    cart: [],
    setCart: () => { },

    user: null,
    setUser: () => { }
});

export const AppContextProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [approvalData, setApprovalData] = useState(null);
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);

    return (
        <appContext.Provider value={{
            messages, setMessages,
            approvalData, setApprovalData,
            cart, setCart,
            user, setUser
        }}>
            {children}
        </appContext.Provider>
    )
}

export const useAppContext = () => { return useContext(appContext) };