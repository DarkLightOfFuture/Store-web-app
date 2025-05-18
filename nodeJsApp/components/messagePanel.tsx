import { React } from "../app"
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/context"

//Displays messages from app
export function MessagePanel() {
    const { messages, setMessages } = useAppContext();

    //Messages management
    useEffect(() => {
        if (messages.length > 0) {
            //If new message is duplicated, deletes older one
            const ind = messages.length - 1;
            const last = messages[ind].message;

            const obj = messages.find((el, i) => el.message == last && i != ind);

            if (obj != null)
                RemoveEl(obj);

            //Deletes message after 4s
            const date = Date.now();

            setTimeout(() => {
                const id = setTimeout(() => {
                    setMessages(s => s.map(el => el.id != date ? el : { ...el, isErased: true }));
                    
                    setTimeout(() => {
                        setMessages(s => s.filter(el => el.id != date));
                    }, 400);
                }, 4000);
                
                setMessages(s => s.map((el, i) => i != ind ? el :
                    { ...el, id: date, isErased: false, timeoutId: id }));
                
            }, obj != null ? 400 : 0);
        }
    }, [messages.length]);

    //Remove message
    function RemoveEl(obj) {
        clearTimeout(obj.timeoutId);

        setMessages(s => s.map(el => el.id == obj.id ? { ...el, isErased: true } : el));

        setTimeout(() => {
            setMessages(s => s.filter(el => el.id != obj.id));
        }, 400);
    }

    return (
        <div id="messagePanel">
            {messages.map((el, i) => (
                <div key={i} className={`${el.isError? "error " : ""}${el.isErased != false ? "erased" : ""}`} onClick={() => RemoveEl(el)}>
                    {el.message}
                </div>
            ))}
        </div>
    )
}