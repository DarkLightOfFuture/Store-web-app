import { React, rem } from "../app";
import { Nav, NumberInput } from "./others";
import { useRef, useState, useEffect } from "react";
import { stringify } from "uuid";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SetStars } from "./others"
import { useAppContext } from "../contexts/context"
import { UseDeleteProduct, RadioInput, HexToUUID, UseAddToCart } from "./others"

export function ProductPage() {
    //Amount of product wanted to buy by user
    const [amount, sendAmount] = useState(1);

    //Product id
    let { id } = useParams<{ id: string }>();

    const [product, setProduct] = useState({
        Id: id, Title: "% Loading %", Price: 9999,
        Amount: 0, Bought: 0, ImgPaths: [],
        UserId: null, Username: null
    });
    const description = useRef(null);

    //Review
    //Stars amount given in review form
    const [starAmount, setStarAmount] = useState(0);
    const [cpStarAmount, cpSetStarAmount] = useState(0);

    //Content of review
    const [content, setContent] = useState(null);
    //Turns on review form
    const [isCreateReview, setIsCreateReview] = useState(false);
    //Prevents many reviews of same customer for one product
    const [wasPublishedReview, setWasPublishedReview] = useState(false);
    //Checks whether review form is completed
    const [cond, setCond] = useState(false);

    //Order of reviews (by highest / lowest rate)
    const [orderBy, setOrderBy] = useState("Highest");

    //Searches reviews after changing order by
    useEffect(() => {
        if (reviews.length != 0)
            SearchReviews(true);
    }, [orderBy]);

    //Amount of reviews for 1 'page'
    const rows = 10;
    const [reviews, setReviews] = useState([]);
    //'Page' of reviews
    const [page, setPage] = useState(0);
    //Whether is more reviews
    const [isShowMore, setIsShowMore] = useState(false);

    const addToCart = UseAddToCart();
    //Turns off 'buy now' and 'add to cart' btn if true
    const [isAdded, setIsAdded] = useState(false);

    function SearchReviews(isNewOrder = false) {
        const query = new URLSearchParams({
            Page: !isNewOrder?(page + 1).toString() : "1",
            Rows: rows.toString(),
            Condition: "ProductId",
            CondVal: id,
            join: JSON.stringify({
                table: "Users",
                on: "UserId",
                columns: ["Username"]
            })
        });

        //Columns
        ["CreatedAt", "Value", "Comment", "UserId", "Id"].forEach(el => query.append("Columns", el))

        query.append("OrderBy", "Value");

        if (orderBy == "Lowest")
            query.append("Order", (true).toString());

        fetch(`/api/review/getmany?${query}`, {
            method: "GET"
        })
        .then(async res => {
            const data = await res.json();
            
            if (res.ok) {
                
                if (data.response.Elements.length > 0) {
                    //Because after changing order by, starts from beginning
                    if (isNewOrder)
                        setPage(1);
                    else
                        setPage(s => s + 1);

                    data.response.Elements = data.response.Elements
                        .map(el => ({ ...el, CreatedAt: new Date(el.CreatedAt), UserId: HexToUUID(el.UserId) }));

                    //Because after changing order by, starts from beginning
                    if (isNewOrder) 
                        setReviews(data.response.Elements);
                    else 
                        setReviews(s => [...s, ...data.response.Elements]);
                    
                    setIsShowMore(s => data.response.Elements.length == rows);
                }
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
    };

    //Determines if review was completed
    useEffect(() => setCond((content?.length == 0 || content == null) ||
        starAmount == 0 || cpStarAmount == 0), [content, starAmount])

    //App context
    const { setApprovalData, setMessages, user } = useAppContext();
    const navigate = useNavigate();
    const deleteProduct = UseDeleteProduct();

    //Gets product and its reviews
    useEffect(() => {
        //Gets product
        const req = {
            columns: ["Description", "Title", "Amount",
                "Price", "ImgPaths", "Rating", "RatingCount", "UserId", "Bought"],
            id: id,
            join: {
                table: "Users",
                on: "UserId",
                columns: ["Username"]
            }
        }

        fetch("/api/product/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req)
        })
        .then(async res => {
            const data = await res.json();
            const r = data.response;

            if (res.ok) {
                r.ImgPaths = JSON.parse(r.ImgPaths);
                r.UserId = HexToUUID(r.UserId);

                setProduct(s => ({ ...s, ...r }));
                description.current.innerHTML = r.Description;
            }
            else
                throw new Error(data.error);
        })
        .catch(err => {
            setTimeout(() => setMessages(s => [...s, ({
                message: err.message,
                isError: true
            })]), 400);
            navigate("/");
        });

        //Gets reviews
        SearchReviews();
    }, []);

    //Formats date
    const fDate = (dt) => {
        const fun = (numb) => { return numb.toString().padStart("2", "0") };

        return `${fun(dt.getHours())}:${fun(dt.getMinutes())}
            ${fun(dt.getDate())}.${fun(dt.getMonth() + 1)}.${fun(dt.getFullYear())}`;
    };

    function PublishReview() {
        setWasPublishedReview(true);
        setIsCreateReview(false);

        let req = {
            Comment: content,
            Value: starAmount,
            ProductId: id
        };

        setReviews(s => [{ ...req, Username: user.Username, IsUploaded: true, CreatedAt: new Date() }, ...s]);

        fetch("/api/review/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req)
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                setTimeout(() => setMessages(state => [...state, {
                    message: data.message,
                    isError: false
                }]), 400);

                setReviews(s => s.map(el => el.Comment == content && el.Value == starAmount ?
                    ({ ...el, IsUploaded: false }) : el));
            }
            else
                throw new Error(data.error);
        })
        .catch(err => {
            setMessages(state => [...state, {
                message: err.message,
                isError: true
            }]);

            setReviews(s => s.map(el => el.Comment == content && el.Value == starAmount ?
                ({ ...el, Error: true }) : el));
        });
    }

    function DeleteReview(id) {
        const query = new URLSearchParams({ Id: id });

        fetch(`/api/review/remove?${query}`, {
            method: "DELETE"   
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                setTimeout(() => setMessages(state => [...state, {
                    message: data.message,
                    isError: false
                }]), 400);

                setReviews(s => s.filter(el => el.Id != id));
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

    function AddToCartFunc(buyNow = false) {
        addToCart({ ...product, ImgPaths: JSON.stringify(product.ImgPaths) }, amount, buyNow);
        setIsAdded(true);
    } 

    return (
        <main id="mainProduct" style={{ display: product.Title == "% Loading %" && "none" }}>
            <Nav /> 
            <aside id="aside1"></aside>
            <article>
                <div id="action">
                    {/* Update product btn */}
                    {product.UserId == user?.Id && <Link to={`/product/update/${id}`}>
                        <div className="btn">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" id="update" className="icon glyph"><title>update</title><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5,12A7,7,0,0,1,16.89,7H14a1,1,0,0,0,0,2h5.08A1,1,0,0,0,20,8V3a1,1,0,0,0-2,0V5.32A9,9,0,0,0,3,12a1,1,0,0,0,2,0Z"></path><path d="M20,11a1,1,0,0,0-1,1A7,7,0,0,1,7.11,17H10a1,1,0,0,0,0-2H4.92A1,1,0,0,0,4,16v5a1,1,0,0,0,2,0V18.68A9,9,0,0,0,21,12,1,1,0,0,0,20,11Z"></path></g></svg>
                        </div>
                    </Link>}
                    {/* Delete product btn */}
                    {(product.UserId == user?.Id || user?.IsAdmin) && <div onClick={() => setApprovalData(() => () => deleteProduct(id))} className="btn delete">
                        <svg viewBox="0 -5 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>delete</title><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill-rule="evenodd"> <g id="Icon-Set" transform="translate(-516.000000, -1144.000000)"> <path d="M538.708,1151.28 C538.314,1150.89 537.676,1150.89 537.281,1151.28 L534.981,1153.58 L532.742,1151.34 C532.352,1150.95 531.718,1150.95 531.327,1151.34 C530.936,1151.73 530.936,1152.37 531.327,1152.76 L533.566,1154.99 L531.298,1157.26 C530.904,1157.65 530.904,1158.29 531.298,1158.69 C531.692,1159.08 532.331,1159.08 532.725,1158.69 L534.993,1156.42 L537.232,1158.66 C537.623,1159.05 538.257,1159.05 538.647,1158.66 C539.039,1158.27 539.039,1157.63 538.647,1157.24 L536.408,1155.01 L538.708,1152.71 C539.103,1152.31 539.103,1151.68 538.708,1151.28 L538.708,1151.28 Z M545.998,1162 C545.998,1163.1 545.102,1164 543.996,1164 L526.467,1164 L518.316,1154.98 L526.438,1146 L543.996,1146 C545.102,1146 545.998,1146.9 545.998,1148 L545.998,1162 L545.998,1162 Z M543.996,1144 L526.051,1144 C525.771,1143.98 525.485,1144.07 525.271,1144.28 L516.285,1154.22 C516.074,1154.43 515.983,1154.71 515.998,1154.98 C515.983,1155.26 516.074,1155.54 516.285,1155.75 L525.271,1165.69 C525.467,1165.88 525.723,1165.98 525.979,1165.98 L525.979,1166 L543.996,1166 C546.207,1166 548,1164.21 548,1162 L548,1148 C548,1145.79 546.207,1144 543.996,1144 L543.996,1144 Z" id="delete"> </path> </g> </g> </g></svg>
                    </div>}
                </div>

                {/* Product details */}

                <h1>{product.Title}</h1>
                <Gallery imgPaths={product.ImgPaths} />
                <h2>Description</h2>
                <div ref={description}></div>

                <h2>Reviews</h2>
                <div id="reviews">
                    {/* Order By btn of reviews */}
                    {reviews.length > 0 && <RadioInput list={["Highest", "Lowest"]} value={0} setChoice={setOrderBy} />}

                    {/* Review Form */}
                    { (isCreateReview && user != null) ? <div className="create">
                            <label>Create review</label>
                            {SetStars(starAmount, setStarAmount, cpSetStarAmount, cpStarAmount)}
                            <div className="textarea">
                                <textarea onChange={(e) => setContent(e.target.value)}>{content}</textarea>
                                <label>Review</label>
                            </div>
                            <div className="action">
                            <input type="button" className="accept"
                                disabled={cond} onClick={PublishReview} value="Post" />
                                <input type="button" className="empty" onClick={() => setIsCreateReview(false)} value="Cancel" />
                            </div>
                        </div>
                    : (!wasPublishedReview && !reviews.some(el => el.UserId == user?.Id) && user != null) ?
                        <div className="create">
                            <input type="button" style={{ width: "min-content" }} value="Create review" onClick={() => setIsCreateReview(true)} />
                        </div>
                   : <span></span>}

                    {/* Reviews */}
                    {reviews.map((el, i) => (
                        <div key={i}>
                            <div style={{ opacity: el.IsUploaded && .3 }}>
                                {SetStars(el.Value)}
                                <p style={{ wordSpacing: ".25rem" }}> From {el.Username} {fDate(el.CreatedAt)}</p>
                            </div>
                            <p style={{ opacity: el.IsUploaded && .3 }}>{el.Comment}</p>
                            {(user != null && (user.IsAdmin || user.Id == el.UserId)) && <div id="delete2"
                                onClick={() => setApprovalData(() => () => DeleteReview(el.Id))}>X</div>}
                            { el.Error && <label style={{ cursor: "default" }} className="error">❌ Failed to upload the review.</label>}
                        </div>
                    ))}
                    {/* Show more reviews btn */}
                    {isShowMore && <input type="button" onClick={() => { setIsShowMore(false); SearchReviews() }} className="accept more" value="Show more" />}
                </div>
            </article>

            {/* Customer panel */}
            <div id="buy">
                <h2>Seller</h2>
                <div className="company border">
                    <svg fill="#ffffff" height="2rem" width="2rem" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-darkreader-inline-fill=""><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M499.2,409.6H12.8c-7.074,0-12.8,5.726-12.8,12.8s5.726,12.8,12.8,12.8h486.4c7.074,0,12.8-5.726,12.8-12.8 S506.274,409.6,499.2,409.6z"></path> </g> </g> <g> <g> <path d="M460.8,76.8H51.2c-14.14,0-25.6,11.46-25.6,25.6v256c0,14.14,11.46,25.6,25.6,25.6h409.6c14.14,0,25.6-11.46,25.6-25.6 v-256C486.4,88.26,474.94,76.8,460.8,76.8z M460.8,358.4H51.2v-256h409.6V358.4z"></path> </g> </g> <g> <g> <path d="M353.57,164.233c-4.813-6.673-12.544-10.633-20.77-10.633H194.441l-61.688-24.678c-6.528-2.654-14.012,0.546-16.64,7.125 c-2.628,6.554,0.572,14.003,7.134,16.623l55.953,22.383V256c0,14.14,11.46,25.6,25.6,25.6h102.4 c11.017,0,20.804-7.049,24.286-17.502l25.6-76.8C359.689,179.49,358.383,170.906,353.57,164.233z M307.2,256H204.8v-76.8h128 L307.2,256z"></path> </g> </g> <g> <g> <circle cx="204.8" cy="307.2" r="25.6"></circle> </g> </g> <g> <g> <circle cx="307.2" cy="307.2" r="25.6"></circle> </g> </g> </g></svg>
                    <Link to={`/profile/${product.UserId}`}>{product.Username}</Link>
                </div>
                <div className="purchase">
                    <p className="price">{Math.floor(product.Price)},<span>{((product.Price % 1) * 100).toFixed().toString().padStart(2, "0")}</span> zł</p>
                    <p>{product.Bought} people bought this offer</p>
                    <p><NumberInput sendValue={sendAmount} max={product.Amount} /> of {product.Amount}</p>
                    <input type="button" disabled={isAdded} onClick={() => AddToCartFunc()} value="Add to cart" />
                    <input type="button" disabled={isAdded} onClick={() => AddToCartFunc(true)} value="Buy now" />
                </div>
            </div>
            <aside id="aside2"></aside>
            <footer></footer>
        </main>
    );
}

//Gallery of product's photos
function Gallery({ imgPaths }) {
    const container = useRef(null);
    const photos = useRef(imgPaths);
    //Container of photos' preview
    const photosPreview = useRef([]);

    //Index of current photo
    const [crr, setCrr] = useState(0);
    //Whether is beginning of photos' container
    const [isBegin, setIsBegin] = useState(true);
    //Whether is end of photos' container
    const [isEnd, setIsEnd] = useState(false);

    const imgs = imgPaths;

    //Choose photo from photos' previews
    function ChoosePhoto(id) {
        if (id != crr) {
            const photo = photos.current[id];

            container.current.scrollTo(photo.offsetLeft - 7.5 * rem, 0);
            setCrr(id);
            setIsBegin(id == 0);
            setIsEnd(id == imgs.length - 1);

            photosPreview.current.forEach((el, ind) => {
                if (ind == crr || ind == id)
                    el.classList.toggle("checked");
            });
        }
    }

    //Choose next / previous photo
    function ChangePhoto(val) {
        const id = crr + val;
        const photo = photos.current[id];

        container.current.scrollTo(photo.offsetLeft - 7.5 * rem, 0);
        setCrr(crr + val);
        setIsBegin(id == 0);
        setIsEnd(id == imgs.length - 1);

        photosPreview.current.forEach((el, ind) => {
            if (ind == crr || ind == id)
                el.classList.toggle("checked");
        });
    }

    return (
        <div className="gallery">
            <div className="photosContainer border">
                <div ref={container} className="photos">
                    {imgs.map((el, id) => <img ref={el => { photos.current[id] = el }} key={id} src={el} />)}
                </div>
                {!isBegin && <div onClick={() => ChangePhoto(-1)} className="goBack">&lt;</div>}
                {!isEnd && <div onClick={() => ChangePhoto(1)} className="goForward">&gt;</div>}
            </div>
            {/* Photos' previews */}
            <div className="preview border">
                {imgs.map((el, id) => <img className={id == 0 ? "checked" : null} ref={el => { photosPreview.current[id] = el }}
                    key={id} src={el} onClick={() => ChoosePhoto(id)} />)}
            </div>
        </div>
    );
}