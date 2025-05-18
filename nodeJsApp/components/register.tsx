import { React } from "../app"
import { useState, useEffect } from "react"
import { Nav, RadioInput, ImagesContainer, UseVerifyPhone, UseVerifyEmail, UseVerifyPostalCode, ScrollInto } from "./others"
import { useAppContext } from "../contexts/context"
import { useNavigate } from "react-router-dom"

export function RegisterPage() {
    //User info
    const [formData, setFormData] = useState({
        FirstName: null, LastName: null,
        PostalCode: null, Town: null,
        Phone: null, Street: null,
        Email: null, Username: null,
        Password1: null, Password2: null
    });

    //Type of account
    const [type, setType] = useState(null);
    //Company avatar
    const [image, setImage] = useState([]);

    //App context
    const { setMessages } = useAppContext();
    const navigate = useNavigate();
    //Whether form is completed
    const [isDisabled, setIsDisabled] = useState(true);

    //Checks whether form is completed
    useEffect(() => {
        const cond1 = Object.keys(formData).some(key => formData[key] == null) || type == null;
        const cond2 = type == "Company" && image.length == 0;
        const cond3 = formData.Password1 != formData.Password2;

        setIsDisabled(cond1 || cond2 || cond3);
    }, [formData, type, image]);

    //Scrolls into image form if account type was chosen 'Company'
    useEffect(() => {
        if (type == "Company")
            ScrollInto("h2");
    }, [type]);

    const VerifyPhone = UseVerifyPhone(setFormData);
    const VerifyEmail = UseVerifyEmail(setFormData);
    const VerifyPostalCode = UseVerifyPostalCode(setFormData);

    function VerifyPasswords() {
        if (formData.Password1 != null && formData.Password2 != null
            && formData.Password1 != formData.Password2)
        {
            setMessages(state => [...state, {
                message: "Passwords aren't the same.",
                isError: true
            }]);
        }
    }

    function Register() {
        let data = new FormData();

        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        if (image.length != 0)
            data.append("Avatar", image[0]);

        fetch("/api/register", {
            method: "POST",
            body: data
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                setTimeout(() => setMessages(state => [...state, {
                    message: data.message,
                    isError: false
                }]), 400);

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
                <h1>Registration</h1>
                <div className="inputBox">
                    <input type="text" id="username" onChange={e => setFormData(s => ({ ...s, Username: e.target.value }))} required />
                    <label htmlFor="username">Username</label>
                </div>
                <div className="inputGroup">
                    <div className="inputBox">
                        <input type="text" id="FirstName" onChange={e => setFormData(s => ({ ...s, FirstName: e.target.value }))} required />
                        <label htmlFor="FirstName">First name</label>
                    </div>
                    <div className="inputBox">
                        <input type="text" id="LastName" onChange={e => setFormData(s => ({ ...s, LastName: e.target.value }))} required />
                        <label htmlFor="LastName">Last name</label>
                    </div>
                </div>
                <div className="inputGroup">
                    <div className="inputBox">
                        <input type="text" id="Town" onChange={e => setFormData(s => ({ ...s, Town: e.target.value }))} required />
                        <label htmlFor="Town">Town</label>
                    </div>
                    <div className="inputBox">
                        <input type="text" id="Street" onChange={e => setFormData(s => ({ ...s, Street: e.target.value }))} required />
                        <label htmlFor="Street">Street</label>
                    </div>
                    <div className="inputBox">
                        <input type="text" id="PostalCode" onBlur={e => VerifyPostalCode(e)} required />
                        <label htmlFor="PostalCode">Postal code</label>
                    </div>
                </div>
                <div className="inputGroup">
                    <div className="inputBox">
                        <input type="text" id="Email" onBlur={e => VerifyEmail(e)} required /> 
                        <label htmlFor="Email">Email</label>
                    </div>
                    <div className="inputBox">
                        <input type="text" id="PhoneNumber" onBlur={e => VerifyPhone(e)} required />
                        <label htmlFor="PhoneNumber">Phone number</label>
                    </div>
                </div>
                <div className="inputGroup">
                    <div className="inputBox">
                        <input type="password" id="password1" onChange={e => setFormData(s => ({ ...s, Password1: e.target.value }))}
                            onBlur={VerifyPasswords} required />
                        <label htmlFor="password1">Password</label>
                    </div>
                    <div className="inputBox">
                        <input type="password" id="password2" onChange={e => setFormData(s => ({ ...s, Password2: e.target.value }))}
                            onBlur={VerifyPasswords} required />
                        <label htmlFor="password2">Confirm password</label>
                    </div>
                </div>
                <RadioInput list={["Customer", "Company"]} setChoice={setType} isBorder={true} name={"Account Type"} />

                {type == "Company" && <h2>Image</h2>}
                {type == "Company" && <ImagesContainer sendFiles={setImage} onlyOne={true} />}

                <input type="button" value="Register" onClick={Register} className="accept" disabled={isDisabled} />
            </article>
            <aside id="aside2"></aside>
            <footer></footer>
        </main>
    );
}