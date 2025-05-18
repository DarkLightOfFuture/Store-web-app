import { React } from "../app"
import { useEffect, useState } from "react"
import { Nav, RadioInput, ImagesContainer } from "./others"
import { useAppContext } from "../contexts/context"
import { useNavigate } from "react-router-dom"

export function LogInPage() {
    const [formData, setFormData] = useState({
        Email: null, Password: null, RememberMe: false
    });

    const navigate = useNavigate();
    //App context
    const { setMessages, setUser } = useAppContext();
    //Whether form is completed
    const [isDisabled, setIsDisabled] = useState(true);

    //Checks whether form is completed
    useEffect(() => {
        const cond = Object.keys(formData).some(key => formData[key] == null);

        setIsDisabled(cond);
    }, [formData]);

    function Login() {
        fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                setUser(data.User);
                navigate("/");
            }
            else
                throw new Error(data.error);
        })
        .catch(err => {
            setMessages(state => [...state, {
                message: err.message,
                isError: true
            }]);
        });
    }

    return (
        <main id="mainSettings">
            <Nav />
            <aside id="aside1"></aside>
            <article>
                <h1>Log in</h1>
                <div className="center">
                    <div className="inputBox">
                        <input type="text" onChange={e => setFormData(s => ({ ...s, Email: e.target.value}))} id="Email" required />
                        <label htmlFor="Email">Email</label>
                    </div>
                    <div className="inputBox">
                        <input type="password" id="password" onChange={e => setFormData(s => ({ ...s, Password: e.target.value }))} required />
                        <label htmlFor="password">Password</label>
                    </div>
                    <label htmlFor="rememberMe"><input type="checkbox" id="rememberMe"
                        onChange={e => setFormData(s => ({ ...s, RememberMe: e.target.checked }))}/> Remember me</label>
                    <input type="button" value="Log in" disabled={isDisabled} onClick={Login} className="accept" />
                </div>
            </article>
            <aside id="aside2"></aside>
            <footer></footer>
        </main>
    );
}