import { React } from "../app"
import { useState, useRef, useEffect } from "react"
import { Nav, NumberInput, ImagesContainer, Preview, Description, RenderDesc, IfEmptySetNull } from "./others"
import { useAppContext } from "../contexts/context"
import { useNavigate } from "react-router-dom"

export function CreatorPage() {
    //Created product's fields
    const [description, sendDescription] = useState(null);
    const [rawDescription, sendRawDescription] = useState("");
    const [price, sendPrice] = useState(null);
    const [title, setTitle] = useState("");
    const [amount, sendAmount] = useState(1);
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [images, sendImages] = useState([]);

    //Whether is preview of rendered description displayed
    const [isPreview, setIsPreview] = useState(false);
    //Whether form is completed
    const [disabled, setDisabled] = useState(true);

    //App context
    const { setMessages, user } = useAppContext();
    const navigate = useNavigate();

    //Validates form
    useEffect(() => {
        setDisabled([IfEmptySetNull(rawDescription), price, IfEmptySetNull(title),
            IfEmptySetNull(images), IfEmptySetNull(condition), IfEmptySetNull(category)].includes(null));
    }, [price, title, rawDescription, images]);

    //Sends new product to database
    function Send() {
        const fd = new FormData();

        fd.append("Description", description.innerHTML);
        fd.append("RawDescription", rawDescription);
        fd.append("Price", price);
        fd.append("Title", title);
        fd.append("Amount", amount.toString());
        fd.append("Cond", condition);
        fd.append("Category", category);
        images.forEach(el => fd.append("Images", el) );

        fetch("/api/product/add", {
            method: "POST",
            body: fd
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
        <main id="mainCreator" style={{ display: user == null && "none" }}>
            <Nav />
            <aside id="aside1"></aside>
            <article>
                <div className="inputBox">
                    <input id="name" value={title} onChange={e => setTitle(e.currentTarget.value) } type="text" required />
                    <label htmlFor="name">Name of product</label>
                </div>
                <div className="numberContainer">
                    <p>Price (zł):</p>
                    <NumberInput sendValue={sendPrice} min="0" />
                </div>
                <div className="numberContainer">
                    <p>Amount of products:</p>
                    <NumberInput sendValue={sendAmount} min="1" />
                </div>
                {/* Condition of product */}
                <div className="selectBox">
                    <select value={condition} onChange={e => setCondition(e.target.value == null ? null : e.target.value)}>
                        <option value="">--- Select ---</option>
                        <option value="brand new">brand new</option>
                        <option value="damaged">damaged</option>
                        <option value="used">used</option>
                    </select>
                    <p>Condition</p>
                </div>
                {/* Category of product */}
                <div className="selectBox">
                    <select value={category} onChange={e => setCategory(e.target.value == null ? null : e.target.value)}>
                        <option value="">--- Select ---</option>
                        <option value="House">House</option>
                        <option value="Clothes">Clothes</option>
                        <option value="Games">Games</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Health">Health</option>
                    </select>
                    <p>Category</p>
                </div>

                <h2>Images</h2>
                <ImagesContainer sendFiles={sendImages} />

                {/* Description */}
                <div className="radio">
                    <div onClick={() => setIsPreview(false)} className={!isPreview ? "checked" : ""}>Description</div>
                    <div onClick={() => setIsPreview(true)} className={isPreview ? "checked" : ""}>Preview</div>
                </div>
                {!isPreview ? <Description copy={rawDescription} sendCopy={sendRawDescription} sendData={sendDescription} /> : <Preview description={description} />}
                <input onClick={Send} type="button" value="Create" disabled={disabled} /> 
            </article>
            <aside id="aside2"></aside>
        </main>
    );
}
