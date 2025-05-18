import { React } from "../app";
import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { useAppContext } from "../contexts/context"
import { useNavigate, Link } from "react-router-dom"

//Navbar
export function Nav() {
    //Menu div
    const div = useRef(null);
    //Searched title of product
    const searchInput = useRef(null);
    //Searched category of product
    const categoryInput = useRef(null);
    //Whether menu is opened
    const [isMenu, setIsMenu] = useState(false);

    //Count of product in cart
    const [countOfProducts, setCountOfProducts] = useState("0");
    //App context
    const { cart, setCart, user, setUser, setMessages } = useAppContext();

    const navigate = useNavigate();

    //Searches title of wanted product
    function Search(e = null) {
        if ((e != null && e.key == "Enter") || e == null) {
            const query = new URLSearchParams({
                q: searchInput.current.value,
                category: categoryInput.current.value
            })

            window.location.href = `/search?${query}`;
        }
    }

    function Logout() {
        setIsMenu(false);

        fetch("/api/logout", { method: "DELETE" }).then(res => {
            if (res.ok) {
                if (window.location.pathname == "/settings")
                    navigate("/");

                setUser(null);
            }
            else {
                setMessages(state => [...state, {
                    message: "The logout hasn't succeed.",
                    isError: true
                }]);
            }
        });
    }

    //Sets cart's info and user's menu
    useEffect(() => {
        //Cart
        const data = JSON.parse(localStorage.getItem("cart"));

        if (data != null)
            setCart(data);

        //Menu
        const func = (e) => {
            if (div.current != null && !div.current.contains(e.target))
                setIsMenu(false);
        };

        document.addEventListener("click", func);

        return () => document.removeEventListener("click", func);
    }, []);

    //Sets search input field after searching
    useEffect(() => {
        if (searchInput.current != null) {
            const searchQ = new URLSearchParams(location.search).get("q");
            
            if (searchQ != undefined)
                searchInput.current.value = searchQ;
        }
    }, [searchInput.current]);

    //Sets category field after searching
    useEffect(() => {
        if (categoryInput.current != null) {
            const searchC = new URLSearchParams(location.search).get("category");

            if (searchC != undefined)
                categoryInput.current.value = searchC;
        }
    }, [searchInput.current]);

    //Sets cart's notification
    useEffect(() => {
        if (cart.length < 10)
            setCountOfProducts(cart.length.toString());
        else
            setCountOfProducts("9+");
        
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    return (
        <nav>
            <Link to="/" className="logo">Shopify</Link>
            <div className="search">
                {/* Searched product title */}
                <input ref={searchInput} onKeyDown={e => Search(e)} type="text" />
                {/* Product category */}
                <select ref={categoryInput}>
                    <option value="">All</option>
                    <option value="House">House</option>
                    <option value="Clothes">Clothes</option>
                    <option value="Games">Games</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Health">Health</option>
                </select>
                {/* Search btn */}
                <div onClick={() => Search()} id="btn">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title></title> <g id="search"> <path d="M29.71,28.29l-6.5-6.5-.07,0a12,12,0,1,0-1.39,1.39s0,.05,0,.07l6.5,6.5a1,1,0,0,0,1.42,0A1,1,0,0,0,29.71,28.29ZM14,24A10,10,0,1,1,24,14,10,10,0,0,1,14,24Z"></path> </g> </g></svg>
                </div>
            </div>
            {/* Account panel */}
            <div id="account">
                <Link id="cart" to="/purchase">
                    <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" enableBackground="new 0 0 64 64"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M44,20v-8c0-6.629-5.371-12-12-12S20,5.371,20,12v8H8v40c0,2.211,1.789,4,4,4h40c2.211,0,4-1.789,4-4V20H44z M28,12c0-2.211,1.789-4,4-4s4,1.789,4,4v8h-8V12z"></path> </g></svg>
                    {countOfProducts != "0" && <div>{countOfProducts}</div>}
                </Link>
                {user != null ? <div ref={div}>
                    <svg onClick={() => setIsMenu(!isMenu)} viewBox="0 0 128 128" id="Layer_1" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M30,49c0,18.7,15.3,34,34,34s34-15.3,34-34S82.7,15,64,15S30,30.3,30,49z M90,49c0,14.3-11.7,26-26,26S38,63.3,38,49 s11.7-26,26-26S90,34.7,90,49z"></path> <path d="M24.4,119.4C35,108.8,49,103,64,103s29,5.8,39.6,16.4l5.7-5.7C97.2,101.7,81.1,95,64,95s-33.2,6.7-45.3,18.7L24.4,119.4z"></path> </g> </g></svg>
                    <label onClick={() => setIsMenu(!isMenu)}>Hello, {user.Username}</label>
                    {isMenu && <div id="menu">
                        {user.IsCompany && <Link to={`/profile/${user.Id}`}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fillRule="evenodd" clipRule="evenodd" d="M16.5 7.063C16.5 10.258 14.57 13 12 13c-2.572 0-4.5-2.742-4.5-5.938C7.5 3.868 9.16 2 12 2s4.5 1.867 4.5 5.063zM4.102 20.142C4.487 20.6 6.145 22 12 22c5.855 0 7.512-1.4 7.898-1.857a.416.416 0 0 0 .09-.317C19.9 18.944 19.106 15 12 15s-7.9 3.944-7.989 4.826a.416.416 0 0 0 .091.317z"></path></g></svg>
                            <label>Profile</label>
                        </Link>}
                        <Link to="/settings">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z"></path> </g></svg>
                            <label>Settings</label>
                        </Link>
                        <Link to="/create">
                            <svg></svg>
                            <label>Create</label>
                        </Link>
                        <Link onClick={Logout} to="">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 17L21 12M21 12L16 7M21 12H9M12 17C12 17.93 12 18.395 11.8978 18.7765C11.6204 19.8117 10.8117 20.6204 9.77646 20.8978C9.39496 21 8.92997 21 8 21H7.5C6.10218 21 5.40326 21 4.85195 20.7716C4.11687 20.4672 3.53284 19.8831 3.22836 19.1481C3 18.5967 3 17.8978 3 16.5V7.5C3 6.10217 3 5.40326 3.22836 4.85195C3.53284 4.11687 4.11687 3.53284 4.85195 3.22836C5.40326 3 6.10218 3 7.5 3H8C8.92997 3 9.39496 3 9.77646 3.10222C10.8117 3.37962 11.6204 4.18827 11.8978 5.22354C12 5.60504 12 6.07003 12 7" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"></path> </g></svg>
                            <label>Log out</label>
                        </Link>
                    </div>}
                </div>
                :
                <div>
                    <Link to="/login">Log in</Link>
                    <Link to="/register">Register</Link>
                </div>
                }
            </div>
        </nav>
    );
}

export function NumberInput({ max = null, min = null, sendValue, initVal = null }) {
    const [val, setVal] = useState(min != null ? min : 1);

    //Sets initial value of input if init val isn't NULL
    useEffect(() => {
        if (initVal != null)
            setVal(initVal);
    }, [initVal]);

    //Sets value of input and prevents letters inside of it
    function ChangeVal(e) {
        const { value } = e.target;

        if (max != null && (value.includes("-") || value > max))
            e.preventDefault();
        else
        {
            setVal(value);
            sendValue(value);
        }
    }

    return (
        <input type="number" min={min != null ? min : 1} max={max} value={val} onChange={e => ChangeVal(e)} />
    );
}
 
export function RadioInput({ list, isBorder = false, name = null, value = null, setChoice = null }) {
    const [val, setVal] = useState(value);

    let className = "radio";

    //Adds border if it is needed
    if (isBorder)
        className += " border";

    //Sets value of radio, and sets null if it's allowed (by not setting value)
    useEffect(() => {
        if (setChoice != null) {
            if (val != null)
                setChoice(list[val])
            else
                setChoice(null);
        }
    }, [val]);

    return (
        <div>
            <div className={className}>
                {name != null && <label>{name}</label>}
                {list.map((el, id) => (
                    <div key={id} onClick={() => val != id ? setVal(id) : value == null ? setVal(null) : null}
                        className={val == id ? "checked" : ""} style={{ cursor: value == null && val == id && "pointer" }}>{el}</div>
                ))}
            </div>
        </div>
    );
}

export function HexToUUID(hex) {
    hex = hex.toLowerCase();

    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

//Uploads images
export function ImagesContainer({ sendFiles, crrPaths = [], setCrrPaths = null, wasChanged = null, sendDelPaths = null, onlyOne = false }) {
    const [images, setImages] = useState([]);
    //Images' files
    const [files, setFiles] = useState([]);

    useEffect(() => sendFiles(files), [files]);
    //Sets initial images
    useEffect(() => setImages(crrPaths), [wasChanged]);

    function UploadImage(e) {
        const obj = e.target;

        setImages([...images, URL.createObjectURL(obj.files[0])]);
        setFiles([...files, obj.files[0]]);

        obj.files = new DataTransfer().files;
    }

    function RemoveImage(id) {
        if (sendDelPaths != null && images[id].includes("images/")) {
            sendDelPaths(s => [...s, images[id]]);
            setCrrPaths(s => s.filter(el => el != images[id]));
        }

        setImages(images.filter((el, i) => i != id));
        setFiles(files.filter((el, i) => i != id - crrPaths.length));
    }

    return (
        <div id="imagesContainer">
            {(!onlyOne || images.length != 1) && <div id="upload">
                <input onChange={(e) => UploadImage(e)} type="file" />
                <p>+</p>
            </div>}
            {images.map((el, id) =>
                <div key={id} onClick={() => RemoveImage(id)} className="image">
                    <img key={id} src={el} />
                    <div><p>-</p></div>
                </div>
            )}
        </div>
    );
}

//Product description creator
export function Description({ sendData, sendCopy, copy }) {
    const [val, setVal] = useState(copy);
    //Textarea with unformatted text
    const ref = useRef(null);

    //Sets copy
    useEffect(() => setVal(copy), [copy]);

    //Renders formatted description
    useEffect(() => {
        const delayedFn = setTimeout(() => {
            sendCopy(val);
            sendData(RenderDesc(val));
        }, 500);

        return () => clearTimeout(delayedFn);
    }, [val]);

    //Val setter
    function ChangeVal(e) { setVal(e.target.value); }

    //Sets text as (bold / italics / underline)
    function Style(type) {
        //Start position of tag
        let sPos = ref.current.selectionStart;
        //End position of tag
        let ePos = ref.current.selectionEnd;

        //Lines of text
        const arr = val.split("\n");

        //Whether some tag ended
        let isDone = false;
        //Helps isDone variable
        let count = 0;

        arr.forEach((el, i) => {
            el = el.trim();

            const correction = (i != 0 ? 1 : 0);
            const val = el.length + correction;

            if (count + val >= sPos && !isDone) {
                sPos -= count + correction;
                ePos -= count + correction;

                if (el.substring(sPos).indexOf(`[${type}]`) == 0) {
                    const end = sPos + el.substring(sPos).indexOf(`[/${type}]`);

                    arr[i] = `${el.substring(0, sPos)}${el.substring(sPos + 3, end)}${el.substring(end + 4)}`;
                }
                else
                    arr[i] = `${el.substring(0, sPos)}[${type}]${el.substring(sPos, ePos)}[/${type}]${el.substring(ePos)}`;

                isDone = true;
            }

            count += val;
        });

        //Turns text to previous form
        setVal(arr.join("\n"));
    }

    //Text align
    function Align(type) {
        //Position of cursor
        const pos = ref.current.selectionStart;
        //Text lines
        const arr = val.split("\n");

        //Whether some tag ended
        let isDone = false;
        //Helps isDone variable
        let count = 0;

        arr.forEach((el, i) => {
            count += el.length + (i != 0 ? 1 : 0);
            el = el.trim();

            if (count >= pos && !isDone) {
                isDone = true;

                if (el.indexOf(`[${type}]`) == 0)
                    arr[i] = el.substring(3, el.indexOf(`[/${type}]`));
                else {
                    ['l', 'c', 'r', 'j'].forEach(x => {
                        if (x != type && el.substring(0, 3) == `[${x}]`)
                            el = el.substring(3, el.indexOf(`[/${x}]`));
                    })

                    arr[i] = `[${type}]${el}[/${type}]`;
                }
            }
        });

        //Turns text to previous form
        setVal(arr.join("\n"));
    }

    //Sets links in text
    function Link() {
        //Position of cursor
        let pos = ref.current.selectionStart;
        //Text lines
        const arr = val.split("\n");
        
        //Whether some tag ended
        let isDone = false;
        //Helps isDone variable
        let count = 0;

        arr.forEach((el, i) => {
            el = el.trim();

            const correction = (i != 0 ? 1 : 0);
            const val = el.length + correction;

            if (count + 1 + val >= pos && !isDone) {
                const struct = "[a href='[link]' text='[text]' /]";
                pos -= count + correction;

                arr[i] = `${el.substring(0, pos)}${struct}${el.substring(pos)}`;
                isDone = true;
            }

            count += val;
        });

        //Turns text to previous form
        setVal(arr.join("\n"));
    }

    //Sets images in description
    function Img() {
        //Position of cursor
        let pos = ref.current.selectionStart;
        //Text lines
        const arr = val.split("\n");

        //Whether some tag ended
        let isDone = false;
        //Helps isDone variable
        let count = 0;

        arr.forEach((el, i) => {
            count += el.length + (i != 0 ? 1 : 0);
            el = el.trim();

            if (count >= pos && !isDone) {
                const struct = "[img src='[link]' /]";

                arr[i] = `${el.substring(0, pos)}${struct}${el.substring(pos)}`;
                isDone = true;
            }
        });

        //Turns text to previous form
        setVal(arr.join("\n"));
    }

    //Sets lists in text
    function List(type) {
        //Position of cursor
        let pos = ref.current.selectionStart;
        //Text lines
        const arr = val.split("\n");

        //Whether some tag ended
        let isDone = false;
        //Helps isDone variable
        let count = 0;

        arr.forEach((el, i) => {
            count += el.length + (i != 0 ? 1 : 0);
            el = el.trim();

            if (count >= pos && !isDone) {
                const struct = `[${type}]\n[First element]\n[/${type}]`;

                if (arr[i].length == 0)
                    arr[i] = struct
                else
                    arr.splice(i + 1, 0, struct);

                isDone = true;
            }
        });

        //Turns text to previous form
        setVal(arr.join("\n"));
    }

    //Sets sections in text
    function Sections() {
        //Position of cursor
        let pos = ref.current.selectionStart;
        //Text lines
        const arr = val.split("\n");

        //Whether some tag ended
        let isDone = false;
        //Helps isDone variable
        let count = 0;

        arr.forEach((el, i) => {
            count += el.length + (i != 0 ? 1 : 0);
            el = el.trim();

            if (count >= pos && !isDone) {
                const struct = `[sections]\n\t[left]\n\tleft element\n\t[/left]\n\t[right]\n\tright element\n\t[/right]\n[/sections]`;

                if (arr[i].length == 0)
                    arr[i] = struct
                else
                    arr.splice(i + 1, 0, struct);

                isDone = true;
            }
        });

        //Turns text to previous form
        setVal(arr.join("\n"));
    }

    return (
        <div className="textareaBox">
            {/* Action panel */}
            <div>
                <button onClick={() => Align("l")}>
                    <svg className="align" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 10H16M3 14H21M3 18H16M3 6H21" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"></path> </g></svg>
                </button>
                <button onClick={() => Align("c")}>
                    <svg className="align" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 6H21M3 14H21M17 10H7M17 18H7" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"></path> </g></svg>
                </button>
                <button onClick={() => Align("r")}>
                    <svg className="align" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 8H21M3 12H21M3 16H21M11 20H21M3 4H21" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"></path> </g></svg>
                </button>
                <button onClick={() => Align("j")}>
                    <svg className="align" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 10H21M3 14H21M3 18H21M3 6H21" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"></path> </g></svg>
                </button>
                <button onClick={() => Style("b")}>
                    <svg className="style" viewBox="0 0 24 24" id="text-bold" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="primary" d="M16.42,11.35A5.45,5.45,0,0,0,18,7.5,5.51,5.51,0,0,0,12.5,2H5A1,1,0,0,0,5,4H6V20H5a1,1,0,0,0,0,2h9.5a5.5,5.5,0,0,0,1.92-10.65ZM12.5,4a3.5,3.5,0,0,1,0,7H9V4Zm2,16H9V13h5.5a3.5,3.5,0,0,1,0,7Z" ></path></g></svg>
                </button>
                <button onClick={() => Style("i")}>
                    <svg className="style" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 306.001 306.001" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M249.142,0H120.713c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h54.958l-58.527,276H56.859c-4.142,0-7.5,3.358-7.5,7.5 s3.358,7.5,7.5,7.5h66.339c0.009,0,0.019,0.001,0.028,0.001c0.006,0,0.011-0.001,0.017-0.001h62.044c4.142,0,7.5-3.358,7.5-7.5 s-3.358-7.5-7.5-7.5h-52.811l58.527-276h58.138c4.142,0,7.5-3.358,7.5-7.5S253.284,0,249.142,0z"></path> </g></svg>
                </button>
                <button onClick={() => Style("u")}>
                    <svg className="align" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M8 44H40" strokeWidth="4" strokeLinecap="round" stroke-linejoin="round"></path> <path d="M37 6.09698C37 12.7636 37 15.3333 37 22C37 29.1797 31.1797 35 24 35C16.8203 35 11 29.1797 11 22C11 15.3333 11 12.7636 11 6.09698" strokeWidth="4" strokeLinecap="round"></path> </g></svg>
                </button>
                <button onClick={() => Img()}>
                    <svg viewBox="0 0 16 16" className="style" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clipRule="evenodd" d="M1 1H15V15H1V1ZM6 9L8 11L13 6V13H3V12L6 9ZM6.5 7C7.32843 7 8 6.32843 8 5.5C8 4.67157 7.32843 4 6.5 4C5.67157 4 5 4.67157 5 5.5C5 6.32843 5.67157 7 6.5 7Z"></path> </g></svg>
                </button>
                <button onClick={() => Link()}>
                    <svg viewBox="0 0 24 24" className="align" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.16488 17.6505C8.92513 17.8743 8.73958 18.0241 8.54996 18.1336C7.62175 18.6695 6.47816 18.6695 5.54996 18.1336C5.20791 17.9361 4.87912 17.6073 4.22153 16.9498C3.56394 16.2922 3.23514 15.9634 3.03767 15.6213C2.50177 14.6931 2.50177 13.5495 3.03767 12.6213C3.23514 12.2793 3.56394 11.9505 4.22153 11.2929L7.04996 8.46448C7.70755 7.80689 8.03634 7.47809 8.37838 7.28062C9.30659 6.74472 10.4502 6.74472 11.3784 7.28061C11.7204 7.47809 12.0492 7.80689 12.7068 8.46448C13.3644 9.12207 13.6932 9.45086 13.8907 9.7929C14.4266 10.7211 14.4266 11.8647 13.8907 12.7929C13.7812 12.9825 13.6314 13.1681 13.4075 13.4078M10.5919 10.5922C10.368 10.8319 10.2182 11.0175 10.1087 11.2071C9.57284 12.1353 9.57284 13.2789 10.1087 14.2071C10.3062 14.5492 10.635 14.878 11.2926 15.5355C11.9502 16.1931 12.279 16.5219 12.621 16.7194C13.5492 17.2553 14.6928 17.2553 15.621 16.7194C15.9631 16.5219 16.2919 16.1931 16.9495 15.5355L19.7779 12.7071C20.4355 12.0495 20.7643 11.7207 20.9617 11.3787C21.4976 10.4505 21.4976 9.30689 20.9617 8.37869C20.7643 8.03665 20.4355 7.70785 19.7779 7.05026C19.1203 6.39267 18.7915 6.06388 18.4495 5.8664C17.5212 5.3305 16.3777 5.3305 15.4495 5.8664C15.2598 5.97588 15.0743 6.12571 14.8345 6.34955" strokeWidth="2" strokeLinecap="round"></path> </g></svg>
                </button>
                <button onClick={() => List("ul")}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="style"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"></path> </g> </g></svg>
                </button>
                <button onClick={() => List("ol")}>
                    <svg className="style" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M3.59 3.03h12.2v1.26H3.59zm0 4.29h12.2v1.26H3.59zm0 4.35h12.2v1.26H3.59zM.99 4.79h.49V2.52H.6v.45h.39v1.82zm.87 3.88H.91l.14-.11.3-.24c.35-.28.49-.5.49-.79A.74.74 0 0 0 1 6.8a.77.77 0 0 0-.81.84h.52A.34.34 0 0 1 1 7.25a.31.31 0 0 1 .31.31.6.6 0 0 1-.22.44l-.87.75v.39h1.64zm-.36 3.56a.52.52 0 0 0 .28-.48.67.67 0 0 0-.78-.62.71.71 0 0 0-.77.75h.5a.3.3 0 0 1 .27-.32.26.26 0 1 1 0 .51H.91v.38H1c.23 0 .37.11.37.29a.29.29 0 0 1-.33.29.35.35 0 0 1-.36-.35H.21a.76.76 0 0 0 .83.8.74.74 0 0 0 .83-.72.53.53 0 0 0-.37-.53z"></path></g></svg>
                </button>
                <button onClick={() => Sections()}>
                    <svg className="style" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g id="move_x5F_horizontal"> <g> <polygon points="12,18 6,18 6,22 0,16 6,10 6,14 12,14 "></polygon> <polygon points="20,14 26,14 26,10 32,16 26,22 26,18 20,18 "></polygon> </g> </g> </g> </g></svg>
                </button>
            </div>
            {/* Unformatted text */}
            <textarea spellCheck={false} ref={ref} value={val} onChange={(e) => ChangeVal(e)}></textarea>
        </div>
    );
}

//Renders description
export function RenderDesc(text) {
    //Returned DOM element
    const div = document.createElement("div");

    let list = null;
    let sections = null;

    //Section left side
    let left = null;
    //Section right side
    let right = null;
    //Whether is image in text
    let isImg = false;

    text.split("\n").forEach(txt => {
        let isDone = false;

        if (list == null || sections == null) {
            if (txt.trim() == "[ul]") {
                list = document.createElement("ul");
                isDone = true;
            }
            else if (txt.trim() == "[ol]") {
                list = document.createElement("ol");
                isDone = true;
            }
            else if (txt.trim() == "[sections]") {
                sections = document.createElement("div");
                sections.style.display = "flex";
                sections.style.gap = ".4rem";

                isDone = true;
            }
        }

        if (!isDone && txt.trim().length > 0) {
            if (list == null && sections == null) {
                if (txt.includes("[img"))
                    div.appendChild(CreateImg(txt));
                else
                    div.appendChild(CreateEl("p", txt));
            }
            else if (list != null) {
                if (txt.trim() == "[/ol]" || txt.trim() == "[/ul]") {
                    if (sections == null)
                        div.appendChild(list);
                    else if (!isImg) {
                        if (left != null)
                            left.appendChild(list);
                        else
                            right.appendChild(list);
                    }

                    list = null
                }
                else
                    list.appendChild(CreateEl("li", txt));
            }
            else {
                if (right == null && left == null) {
                    const container = document.createElement("div");
                    container.style.width = "50%";

                    if (txt.trim() == "[left]")
                        left = container;
                    else
                        right = container;
                }
                else {
                    if (txt.includes("[img")) {
                        const img = CreateImg(txt);

                        if (left != null)
                            left.appendChild(img);
                        else
                            right.appendChild(img);

                        isImg = true;
                    }
                    else if (txt.trim() == "[/left]") {
                        sections.appendChild(left);
                        left = null;
                        isImg = false;
                    }
                    else if (txt.trim() == "[/right]") {
                        sections.appendChild(right);
                        //right = null; Because it will be done during [/sections] line
                        isImg = false;
                    }
                    else if (txt.trim() == "[/sections]") {
                        div.appendChild(sections);
                        sections = null;
                        right = null;
                    }
                    else if (!isImg) {
                        if (left != null)
                            left.appendChild(CreateEl("p", txt));
                        else
                            right.appendChild(CreateEl("p", txt));
                    }

                }
            }
        }
    });

    return div;

    //Creates image
    function CreateImg(txt) {
        const img = document.createElement("img");

        const fInd = txt.indexOf("src='") + 5;
        const lInd = fInd + txt.substring(fInd + 1).indexOf("'") + 1;

        img.src = txt.substring(fInd, lInd);
        img.style.objectFit = "contain";
        img.style.width = "100%";

        return img;
    }

    //Creates <name> DOM element
    function CreateEl(name, txt, el = null) {
        let arr = [];
        txt = txt.trim();

        if (el == null)
            el = document.createElement(name);

        ['l', 'c', 'r', 'j'].forEach(align => {
            if (txt.indexOf(`[${align}]`) == 0) {
                const ind = txt.indexOf(`[/${align}]`);
                txt = txt.substring(3, ind);

                switch (align) {
                    case "l":
                        el.style.textAlign = "left";
                        break;
                    case "c":
                        el.style.textAlign = "center";
                        break;
                    case "r":
                        el.style.textAlign = "right";
                        break;
                    case "j":
                        el.style.textAlign = "justify";
                        break;
                }
            }
        });

        for (let i = 0; i < txt.length; i++) {
            [txt, i] = func("b", i, txt, arr);
            [txt, i] = func("i", i, txt, arr);
            [txt, i] = func("u", i, txt, arr);

            [txt, i] = func("a", i, txt, arr);
        }

        arr.push(txt);

        arr.forEach(x => {
            if (typeof x == "string")
                el.innerHTML += x;
            else
                el.appendChild(x);
        });

        return el;

        //Formats text with (bold / italics / underline) or link
        function func(type, i, txt, arr) {
            if (type != "a" && txt.substring(i, i + 3) == `[${type}]`) {
                arr.push(txt.substring(0, i));
                txt = txt.substring(i + 3);
                i = 0;

                const ind = txt.indexOf(`[/${type}]`);
                let span = document.createElement("span");

                switch (type) {
                    case "b":
                        span.style.fontWeight = "bold";
                        break;
                    case "i":
                        span.style.fontStyle = "italic";
                        break;
                    case "u":
                        span.style.textDecoration = "underline";
                        break;
                }

                const subTxt = ind != -1 ? txt.substring(0, ind) : txt.substring(0);
                span = CreateEl("span", subTxt, span);

                arr.push(span);
                txt = ind != -1 ? txt.substring(ind + 4) : "";
            }
            else if (type == "a" && txt.substring(i, i + 2) == "[a") {
                let a = document.createElement("a");
                arr.push(txt.substring(0, i));

                let ind = txt.indexOf("href='") + 6;
                a.href = txt.substring(ind, ind + txt.substring(ind).indexOf("'"));

                ind = txt.indexOf("text='") + 6;
                const subTxt = txt.substring(ind, ind + txt.substring(ind).indexOf("'"));
                txt = txt.substring(txt.indexOf("/]") + 2);
                i = 0;

                a = CreateEl("a", subTxt, a);
                arr.push(a);
            }

            return [txt, i];
        }
    }
}

//Displays preview of rendered description
export function Preview({ description }) {
    const div = useRef(null);

    useEffect(() => {
        if (div.current)
            div.current.appendChild(description);
    }, [description]);

    return (
        <div id="descriptionPreview">
            <h2>Description</h2>
            <div ref={div}></div>
        </div>
    );
}

//Renders stars in reviews
export function SetStars(rating, setAmount = (val) => { }, cpSetAmount = null, amountCp = null) {
    rating += .1;
    
    let elements = [];
    const fullStarsCount = rating - (rating % 1);

    for (let i = 0; i < fullStarsCount; i++)
        elements.push(<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.729 126.73"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M121.215,44.212l-34.899-3.3c-2.2-0.2-4.101-1.6-5-3.7l-12.5-30.3c-2-5-9.101-5-11.101,0l-12.4,30.3 c-0.8,2.1-2.8,3.5-5,3.7l-34.9,3.3c-5.2,0.5-7.3,7-3.4,10.5l26.3,23.1c1.7,1.5,2.4,3.7,1.9,5.9l-7.9,32.399 c-1.2,5.101,4.3,9.3,8.9,6.601l29.1-17.101c1.9-1.1,4.2-1.1,6.1,0l29.101,17.101c4.6,2.699,10.1-1.4,8.899-6.601l-7.8-32.399 c-0.5-2.2,0.2-4.4,1.9-5.9l26.3-23.1C128.615,51.212,126.415,44.712,121.215,44.212z"></path> </g> </g></svg>);

    if (rating % 1 > .5) {
        elements.push(<svg viewBox="0 0 36 36" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>half-star-solid</title> <path className="clr-i-solid clr-i-solid-path-1" d="M34,16.78a2.22,2.22,0,0,0-1.29-4l-9-.34a.23.23,0,0,1-.2-.15L20.4,3.89a2.22,2.22,0,0,0-4.17,0l-3.1,8.43a.23.23,0,0,1-.2.15l-9,.34a2.22,2.22,0,0,0-1.29,4l7.06,5.55a.23.23,0,0,1,.08.24L7.35,31.21a2.22,2.22,0,0,0,3.38,2.45l7.46-5a.22.22,0,0,1,.25,0l7.46,5a2.2,2.2,0,0,0,2.55,0,2.2,2.2,0,0,0,.83-2.4l-2.45-8.64a.22.22,0,0,1,.08-.24ZM24.9,23.11l2.45,8.64A.22.22,0,0,1,27,32l-7.46-5a2.21,2.21,0,0,0-1.24-.38h0V4.44h0a.2.2,0,0,1,.21.15L21.62,13a2.22,2.22,0,0,0,2,1.46l9,.34a.22.22,0,0,1,.13.4l-7.06,5.55A2.21,2.21,0,0,0,24.9,23.11Z"></path> <rect x="0" y="0" width="36" height="36" fillOpacity="0"></rect> </g></svg>);
        
        for (let i = 0; i < 5 - fullStarsCount - 1; i++)
            elements.push(<svg viewBox="0 0 24 24" style={{ fill: "transparent", stroke: "#efe406" }} xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"></path> </g></svg>);
    }
    else
        for (let i = 0; i < 5 - fullStarsCount; i++)
            elements.push(<svg viewBox="0 0 24 24" style={{ fill: "transparent", stroke: "#efe406" }} xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"></path> </g></svg>);
    
    return (
        <div className="reviewRating">
            {elements.map((el, i) => (
                <div key={i}>
                    {el}
                    <div className="left" onClick={() => { setAmount(i != 0 ? i + .5 : 1); cpSetAmount(i != 0 ? i + .5 : 1) }}
                        onMouseEnter={() => setAmount(i != 0 ? i + .5 : 1)} onMouseLeave={() => setAmount(amountCp)}></div>
                    <div className="right" onClick={() => { setAmount(i + 1); cpSetAmount(i + 1) }}
                        onMouseEnter={() => setAmount(i + 1)} onMouseLeave={() => setAmount(amountCp)}></div>
                </div>
            ))}            
        </div>
    )
}

//If string is empty, sets NULL
export function IfEmptySetNull(val) {
    if (val == undefined)
        return null;

    return val.length == 0 ? null : val;
}

export function UseDeleteProduct() {
    const { setMessages } = useAppContext();
    const navigate = useNavigate();

    return (id, redirect = true, setState = null) => {
        const query = new URLSearchParams({ Id: id });

        fetch(`/api/product/remove?${query}`, {
            method: "DELETE"
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                setTimeout(() => setMessages(state => [...state, {
                    message: data.message,
                    isError: false
                }]), 400);

                if (redirect)
                    navigate("/");
                else
                    setState(s => s.filter(el => el.Id != id));
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
}

export function UseVerifyEmail(setFormData) {
    const { setMessages } = useAppContext();
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    return (e) => {
        if (emailRegex.test(e.target.value))
            setFormData(s => ({ ...s, Email: e.target.value }));
        else {
            setMessages(s => [...s, {
                message: "Invalid email.",
                isError: true
            }])
        }
    }
}

export function UseVerifyPostalCode(setFormData) {
    const { setMessages } = useAppContext();
    const postalCodeRegex = /^\d+\-\d+$/;

    return (e) => {
        if (postalCodeRegex.test(e.target.value))
            setFormData(s => ({ ...s, PostalCode: e.target.value }));
        else {
            setMessages(s => [...s, {
                message: "Invalid postal code.",
                isError: true
            }])
        }
    }
}

export function UseVerifyPhone(setFormData) {
    const { setMessages } = useAppContext();
    const phoneRegex = /^\+\d{11}$/;

    return (e) => {
        if (phoneRegex.test(e.target.value))
            setFormData(s => ({ ...s, Phone: e.target.value }));
        else {
            setMessages(s => [...s, {
                message: "Invalid phone number.",
                isError: true
            }])
        }
    }
}

//Scrolls into DOM element
export function ScrollInto(el) {
    setTimeout(() => {
        document.querySelector(el)
            .scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
}

export function UseAddToCart() {
    const { setCart, setMessages } = useAppContext();
    const navigate = useNavigate();

    return (product, amount = 1, buyNow = false) => {
        const func = () => {
            let cart;

            try {
                cart = JSON.parse(localStorage.getItem("cart"));

                if (cart == null) throw Error();
            }
            catch (err) { cart = []; }

            delete product.Description;

            const obj = ({ ...product, Amount: amount });

            if (!cart.some(el => el.Id == product.Id)) {
                cart.push(obj);

                localStorage.setItem("cart", JSON.stringify(cart));
                setCart(s => [...s, obj]);

                return true;
            }
            else
                return false;
        }

        if (!func()) {
            setMessages(s => [...s, {
                message: "Product has already been added to cart.",
                isError: true
            }])
        }
        else if (buyNow)
            navigate("/purchase");
    }
}

export function RemoveFromCart(id, setCart) {
    let cart;

    try {
        cart = JSON.parse(localStorage.getItem("cart"));
        cart = cart.filter(el => el.Id != id);

        localStorage.setItem("cart", JSON.stringify(cart));
        setCart(cart);
    }
    catch (err) { console.error("The cart is empty."); }
}