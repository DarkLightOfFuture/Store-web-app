import { React } from "../app"
import { useState, useRef, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Nav, NumberInput, ImagesContainer, Description, RenderDesc, Preview, IfEmptySetNull, HexToUUID } from "./others"
import { useAppContext } from "../contexts/context"

export function UpdatePage() {
    //Product
    const [description, sendDescription] = useState(null);
    const [rawDescription, sendRawDescription] = useState("");
    const [price, sendPrice] = useState(null);
    const [title, setTitle] = useState("");
    const [images, sendImages] = useState([]);
    const [crrPaths, setCrrPaths] = useState([]);
    const [delPaths, setDelPaths] = useState([]);

    //Copy of product
    const [cpRawDescription, cpSendRawDescription] = useState("");
    const [cpPrice, cpSendPrice] = useState(null);
    const [cpTitle, cpSetTitle] = useState("");
    const [cpCrrPaths, cpSetCrrPaths] = useState([]);

    //App context
    const { setMessages, user } = useAppContext();

    //Preview of description
    const [isPreview, setIsPreview] = useState(false);
    //Whether form wasn't completed
    const [disabled, setDisabled] = useState(true);
    //Whether form was changed and can be reset to the beginning state
    const [canReset, setCanReset] = useState(false);
    //Whether images container was changed
    const [wasChanged, setWasChanged] = useState(false);
    //Reset btn animation
    const [hasAppeared, setHasAppeared] = useState(true);

    const navigate = useNavigate();
    //Product id
    let { id } = useParams<{ id: string }>();

    //Checks whether form was updated
    useEffect(() => {
        const cond1 = [IfEmptySetNull(rawDescription), price, IfEmptySetNull(title)].includes(null);
        const cond2 = price == cpPrice && title == cpTitle && rawDescription == cpRawDescription
            && delPaths.length == 0 && images.length == 0;

        setDisabled(cond1 || cond2);
        setCanReset(!cond2);

        if (!cond2) 
            setTimeout(() => setHasAppeared(false), 100);
    }, [price, title, description, images, delPaths]);

    //Gets beginning state of product
    useEffect(() => {
        const req = {
            columns: ["Id", "Description", "Title", "RawDescription",
                "Price", "ImgPaths", "Rating", "RatingCount", "UserId"],
            id: id
        }

        setTimeout(() => {
            fetch("/api/product/get", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(req)
            })
            .then(async res => {
                const data = await res.json();
                const r = data.response;

                if (res.ok) {
                    if (HexToUUID(r.UserId) != user?.Id)
                        throw new Error("You haven't permission for this action.");

                    setTitle(r.Title);
                    sendPrice(r.Price);
                    setCrrPaths(JSON.parse(r.ImgPaths));
                    sendRawDescription(r.RawDescription);

                    cpSetTitle(r.Title);
                    cpSendPrice(r.Price);
                    cpSetCrrPaths(JSON.parse(r.ImgPaths));
                    cpSendRawDescription(r.RawDescription);

                    setWasChanged(s => !s);
                }
                else
                    throw new Error(data.error);
            })
            .catch(err => {
                setTimeout(() => setMessages(s => [...s, {
                    message: err.message, isError: true
                }]), 400);

                navigate("/");
            });
        }, 1);
    }, []);

    //Resets form
    function Reset() {
        setTimeout(() => {
            sendRawDescription(cpRawDescription);
            sendPrice(cpPrice);
            setTitle(cpTitle);
            sendImages([]);
            setCrrPaths([...cpCrrPaths]);
            setDelPaths([]);

            setWasChanged(s => !s);
        }, 400);

        setHasAppeared(true);
    }

    //Updates product at database
    function Send() {
        const fd = new FormData();

        fd.append("Id", id);
        fd.append("Description", description.innerHTML);
        fd.append("RawDescription", rawDescription);
        fd.append("Price", price);
        fd.append("Title", title);
        images.forEach(el => fd.append("Images", el));
        crrPaths.forEach(el => fd.append("CrrPaths", el));
        delPaths.forEach(el => fd.append("DelPaths", el));

        fetch("/api/product/update", {
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

                navigate(`/product/${id}`);
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
        <main id="mainCreator" style={{ display: rawDescription == "" && "none" }}>
            <Nav />
            <aside id="aside1"></aside>
            <article>
                {/* Reset btn */}
                {canReset && <div id="action"><div className={`btn ${ hasAppeared? "hasAppeared": "" }`} onClick={Reset}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M22.719 12A10.719 10.719 0 0 1 1.28 12h.838a9.916 9.916 0 1 0 1.373-5H8v1H2V2h1v4.2A10.71 10.71 0 0 1 22.719 12z"></path><path fill="none" d="M0 0h24v24H0z"></path></g></svg>
                </div></div>}

                <div className="inputBox">
                    <input value={title} onChange={e => setTitle(e.currentTarget.value)} type="text" required />
                    <label>Name of product</label>
                </div>

                <div id="numberContainer">
                    <NumberInput sendValue={sendPrice} min="0" initVal={price} />
                    <p>zł</p>
                </div>

                <h2>Images</h2>
                <ImagesContainer sendFiles={sendImages} crrPaths={crrPaths} setCrrPaths={setCrrPaths} wasChanged={wasChanged} sendDelPaths={setDelPaths} />

                {/* Description */}
                <div className="radio">
                    <div onClick={() => setIsPreview(false)} className={!isPreview ? "checked" : ""}>Description</div>
                    <div onClick={() => setIsPreview(true)} className={isPreview ? "checked" : ""}>Preview</div>
                </div>
                {!isPreview ? <Description copy={rawDescription} sendCopy={sendRawDescription} sendData={sendDescription} /> : <Preview description={description} />}
                <input onClick={Send} type="button" value="Update" disabled={disabled} />
            </article>
            <aside id="aside2"></aside>
        </main>
    );
}