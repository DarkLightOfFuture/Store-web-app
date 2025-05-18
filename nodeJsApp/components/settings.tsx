import { React } from "../app"
import { useState, useEffect } from "react"
import { Nav } from "./others"
import { useAppContext } from "../contexts/context"
 
export function SettingsPage() {
    //Whether password is changed
    const [isPassword, setIsPassword] = useState(false);
    //Whether email is changed
    const [isEmail, setIsEmail] = useState(false);

    //App context
    const { user, setUser, setMessages } = useAppContext();

    const [email, setEmail] = useState(user?.Email);
    const [password1, setPassword1] = useState(null);
    //Confirm password
    const [password2, setPassword2] = useState(null);

    //Whether if new email is correct
    const [emailDisabled, setEmailDisabled] = useState(true);
    //Whether if new password is correct and match with second
    const [passwordDisabled, setPasswordDisabled] = useState(true);

    //Verifies new email
    useEffect(() => {
        const cond = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

        setEmailDisabled(!cond || email == user?.Email);
    }, [email]);

    //Verifies passwords
    useEffect(() => {
        setPasswordDisabled(password1 != password2 ||  password1 == null);
    }, [password1, password2]);

    //Template of fetch function for changing fields
    function ChangeFunc(path, body) {
        fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                setMessages(s => [...s, {
                    message: data.message,
                    isError: false
                }])
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

    function ChangeEmail() {
        ChangeFunc("api/changeemail", { Email: email });
    }

    function ChangePassword() {
        ChangeFunc("api/changepassword", { Password1: password1, Password2: password2 });
    }

    return (
        <main id="mainSettings" style={{ display: user == null && "none" }}>
            <Nav />
            <aside id="aside1"></aside>
            <article>
                <h1>Settings</h1>
                {/* Change email */}
                {!isEmail ?
                    <div className="inputGroup">
                        <div className="inputBox">
                            <input value={user?.Email} type="text" disabled />
                            <label>Email</label>
                        </div>
                        <svg onClick={() => setIsEmail(true)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round"></path> </g></svg>
                    </div>
                    :
                    <div className="inputGroup">
                        <div className="inputBox">
                            <input value={email} onChange={e => setEmail(e.target.value)} type="text" required />
                            <label>New email</label>
                        </div>
                    </div>
                }
                {isEmail &&
                    <div className="inputGroup">
                        <input onClick={() => setIsEmail(false)} type="button" className="empty" value="Cancel" />
                        <input onClick={() => { setIsEmail(false); ChangeEmail() }} disabled={emailDisabled} type="button" className="accept" value="Change" />
                    </div>
                }
                {/* Change password */}
                {!isPassword ?
                    <div className="inputGroup">
                        <div className="inputBox">
                            <input type="password" disabled />
                            <label>Password</label>
                        </div>
                        <svg onClick={() => setIsPassword(true)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round"></path> </g></svg>
                    </div>
                    :
                    <div className="inputBox">
                        <input type="password" onChange={e => setPassword1(e.target.value)} required />
                        <label>New password</label>
                    </div>
                }
                {isPassword &&
                    <div className="inputBox">
                        <input type="password" onChange={e => setPassword2(e.target.value)} required />
                        <label>Confirm Password</label>
                    </div>
                }
                {isPassword &&
                    <div className="inputGroup">
                        <input onClick={() => setIsPassword(false)} type="button" className="empty" value="Cancel" />
                        <input onClick={() => { setIsPassword(false); ChangePassword(); }} disabled={passwordDisabled}  type="button" className="accept" value="Change" />
                    </div>
                }
            </article>
            <aside id="aside2"></aside>
            <footer></footer>
        </main>
    );
}