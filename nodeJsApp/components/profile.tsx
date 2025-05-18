import { React } from "../app"
import { Nav, NumberInput } from "./others"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { SetStars, UseDeleteProduct, HexToUUID } from "./others"
import { useAppContext } from "../contexts/context"
import { useNavigate } from "react-router-dom"

export function ProfilePage() {
    //Products for page
    const rows = 20;

    //Page of products
    const [page, sendPage] = useState(1);
    //Amount of products' pages
    const [maxPage, setMaxPage] = useState(null);
    //Searched title of product
    const [searchedTitle, setSearchedTitle] = useState("");
    const [products, setProducts] = useState([]);

    //Id of profile user
    const { userId } = useParams();
    //App context
    const { setMessages, setApprovalData, user } = useAppContext();
    const navigate = useNavigate();
    const deleteProduct = UseDeleteProduct();

    const [company, setCompany] = useState({
        Username: null, Avg: null, CreatedAt: null
    });

    const searchProducts = (nexPage = false) => {
        if (!nexPage)
            sendPage(1);

        const query = new URLSearchParams({
            Page: page.toString(),
            Rows: rows.toString()
        });

        query.append("Condition", "UserId");
        query.append("CondVal", userId);

        if (searchedTitle != "") {
            query.append("Condition", "Title");
            query.append("CondVal", searchedTitle);
        }

        ["Id", "Title", "Rating", "RatingCount",
            "Price", "ImgPaths", "Bought"].forEach(el => query.append("Columns", el))

        fetch(`/api/product/getmany?${query}`, {
            method: "GET"
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                data.response.Elements?.map(el => el.Id = HexToUUID(el.Id))

                setMaxPage(Math.ceil(data.response.Count / rows));
                setProducts(data.response.Elements)
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

    //Gets profile data
    useEffect(() => {
        //Gets data about company
        const query = new URLSearchParams({ Id: userId });

        fetch(`/api/profile?${query}`, { method: "GET" }).then(async res => {
            const data = await res.json();
            const r = data.response;

            if (res.ok) {
                r.CreatedAt = new Date(r.CreatedAt).getFullYear();

                setCompany(r);
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

        searchProducts();
    }, []);

    //Choose next page of products
    useEffect(() => {
        if (page <= maxPage)
            searchProducts(true);
    }, [page]);

    //Searches products after new wanted product
    useEffect(() => {
        const timeoutId = setTimeout(() => searchProducts(), 500);

        return () => clearTimeout(timeoutId);
    }, [searchedTitle]);

    return (
        <main id="mainProfile" style={{ display: company.Username == null && "none" }}>
            <Nav />
            <aside id="aside1"></aside>
            <article>
                {/* Company info */}
                <div id="profile">
                    <svg viewBox="0 0 128 128" id="Layer_1" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M30,49c0,18.7,15.3,34,34,34s34-15.3,34-34S82.7,15,64,15S30,30.3,30,49z M90,49c0,14.3-11.7,26-26,26S38,63.3,38,49 s11.7-26,26-26S90,34.7,90,49z"></path> <path d="M24.4,119.4C35,108.8,49,103,64,103s29,5.8,39.6,16.4l5.7-5.7C97.2,101.7,81.1,95,64,95s-33.2,6.7-45.3,18.7L24.4,119.4z"></path> </g> </g></svg>
                    <div>
                        <label><b>Company:</b> {company.Username}</label>
                        <label><b>On this site:</b> since {company.CreatedAt}</label>
                        {company.Avg != null ? <label><b>{company.Avg}%</b> of users recommend this company</label>
                         : <label>None of users rated this company yet</label>}
                    </div>
                </div>
                <h2 className="border">{user?.Id == userId ? "Your offers" : "Offers"}</h2>
                {/* Company's products searchbar */}
                <div id="top">
                    <div className="search">
                        <input type="text" value={searchedTitle} onChange={e => setSearchedTitle(e.target.value)} />
                        <div id="btn">
                            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title></title> <g id="search"> <path d="M29.71,28.29l-6.5-6.5-.07,0a12,12,0,1,0-1.39,1.39s0,.05,0,.07l6.5,6.5a1,1,0,0,0,1.42,0A1,1,0,0,0,29.71,28.29ZM14,24A10,10,0,1,1,24,14,10,10,0,0,1,14,24Z"></path> </g> </g></svg>
                        </div>
                    </div>
                    {maxPage != null && <div className="page">
                        <NumberInput sendValue={sendPage} initVal={page} max={maxPage} />
                        <p>Of {maxPage}</p>
                        <label onClick={() => sendPage(s => s < maxPage ? ++s : s)}>&gt;</label>
                    </div>}
                </div>
                {/* Company's products */}
                <div className="products">
                    {products?.map((el, i) => (
                        <a key={i} href={`/product/${el.Id}`} className="product">
                            <div className="details">
                                <img src={JSON.parse(el.ImgPaths)[0]} />
                                <div className="description">
                                    <p>{el.Title}</p>
                                    <div>
                                        <p>{Math.round(el.Rating * 100) / 100}</p>
                                        {SetStars(el.Rating)}
                                        <p>({el.RatingCount})</p>
                                    </div>
                                    <p className="amountOfCustomers"><span>{el.Bought} osoby</span> bought this offer</p>
                                </div>
                            </div>
                            <div className="buy">
                                <p className="price">{Math.floor(el.Price)},<span>{((el.Price % 1) * 100).toFixed().toString().padStart(2, "0")}</span> zł</p>
                                <p className="cond"><span>Condition:</span> Brand new</p>
                            </div>
                            {(user?.IsAdmin || user?.Id == userId) && <div id="delete" onClick={(e) => { e.preventDefault(); setApprovalData(() => () => deleteProduct(el.Id, false, setProducts)) }}><p>X</p></div>}
                        </a>
                    ))}
                </div>
            </article>
            <aside id="aside2"></aside>
            <footer></footer>
        </main>
    );
}
 