import { React } from "../app"
import { useState, useEffect } from "react"
import { Nav, NumberInput, HexToUUID, SetStars, UseAddToCart } from "./others"
import { useAppContext } from "../contexts/context"
import { Link } from "react-router-dom"

export function SearchPage() {
    //Number of products for page
    const rows = 20;

    //Page of results
    const [page, setPage] = useState(1);
    //Amount of products' pages
    const [maxPage, setMaxPage] = useState(null);

    //Wanted condition of product
    const [conditions, setConditions] = useState([]);
    //Price range (from)
    const [priceFrom, setPriceFrom] = useState(null);
    //Price range (to)
    const [priceTo, setPriceTo] = useState(null);
    //Order by of products
    const [orderBy, setOrderBy] = useState("");

    //Search params
    const search = new URLSearchParams(location.search);
    //Search query
    const searchQ = search.get("q");
    //Search category
    const searchC = search.get("category");

    const [products, setProducts] = useState([]);

    //App context
    const { setMessages, setCart } = useAppContext(); 
    const addToCart = UseAddToCart();

    function SearchProducts(nexPage = false) {
        if (!nexPage)
            setPage(1);

        const query = new URLSearchParams({
            Page: page.toString(),
            Rows: rows.toString()
        });

        if (searchQ != null) {
            query.append("Condition", "Title");
            query.append("CondVal", searchQ);
        }

        if (searchC != null) {
            query.append("Condition", "Category");
            query.append("CondVal", searchC);
        }

        ["Id", "Title", "Rating", "RatingCount",
            "Price", "ImgPaths", "Cond", "Bought"].forEach(el => query.append("Columns", el))

        if (!isNaN(parseInt(priceFrom)) || !isNaN(parseInt(priceTo))) {
            query.append("Condition", "Price");

            let args = [];

            if (!isNaN(parseInt(priceFrom)))
                args.push(parseFloat(priceFrom))
            else
                args.push(null);

            if (!isNaN(parseInt(priceTo)))
                args.push(parseFloat(priceTo))
            else
                args.push(null);

            query.append("CondVal", JSON.stringify(args));
        }

        if (conditions.length > 0) {
            query.append("Condition", "Cond");
            query.append("CondVal", JSON.stringify(conditions));
        }

        switch (orderBy) {
            case "ascending":
                query.append("OrderBy", "Price");
                query.append("Order", (true).toString());
                
                break;
            case "descending":
                query.append("OrderBy", "Price");

                break;
            case "highest":
                query.append("OrderBy", "Rating");

                break;
        }

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

    //Searches products at beginning
    useEffect(() => SearchProducts(), []);
    //Searches products after order by or condition change
    useEffect(() => SearchProducts(), [orderBy, conditions]);

    //Choose next page of products
    useEffect(() => {
        if (page <= maxPage)
            SearchProducts(true);
    }, [page]);

    //Changes price range
    useEffect(() => {
        const timeoutId = setTimeout(() => SearchProducts(), 500);

        return () => clearTimeout(timeoutId);
    }, [priceFrom, priceTo]);

    //Changes wanted conditions of product
    function ChangeConditions(val) {
        if (conditions.includes(val))
            setConditions(s => s.filter(el => el != val));
        else 
            setConditions(s => [...s, val]);
    }

    function AddToCartFun(el) {
        addToCart(el);
        setProducts(s => s.map(p => p.Id == el.Id ? ({ ...p, IsAdded: true }) : p));
    }

    return (
        <main id="mainSearch">
            <Nav />
            <aside id="aside1"></aside>

            {/* Filters */}

            <div id="filters">
                <h4 className="border">Price (in zł)</h4>
                <div className="priceRange">
                    <p>From </p>
                    <NumberInput sendValue={setPriceFrom} initVal={""} />
                    <p>To </p> 
                    <NumberInput sendValue={setPriceTo} initVal={""} />
                </div>
                <h4>Product condition</h4>
                <div className="condition">
                    <p><input type="checkbox" onChange={e => ChangeConditions(e.target.value)} value="brand new" /> Brand new</p>
                    <p><input type="checkbox" onChange={e => ChangeConditions(e.target.value)} value="damaged" /> Damaged</p>
                    <p><input type="checkbox" onChange={e => ChangeConditions(e.target.value)} value="used" /> Used</p>
                </div>
            </div>

            <article>
                <div className="topPanel" >
                    {/* Order by */}
                    <div className="selectBox">
                        <p>Sort by</p>
                        <select value={orderBy} onChange={e => setOrderBy(e.target.value)}>
                            <option value="">Choose an option</option>
                            <option value="descending">Price (descending)</option>
                            <option value="ascending">Price (ascending)</option>
                            <option value="highest">Rating (highest)</option>
                        </select>
                    </div>
                    {/* Page */}
                    { maxPage != null && <div className="page">
                        <NumberInput sendValue={setPage} initVal={page} max={maxPage} />
                        <p>Of {maxPage}</p>
                        <label onClick={() => setPage(s => s < maxPage ? ++s : s)}>&gt;</label>
                    </div>}
                </div>
                <div className="products">
                    {/* Products */}
                    {products.map((el, i) => (
                        <Link key={i} to={`/product/${el.Id}`} className="product">
                            <div className="details">
                                <img src={JSON.parse(el.ImgPaths)[0]} />
                                <div className="description">
                                    <p>{el.Title}</p>
                                    <div>
                                        <p>{Math.round(el.Rating * 100) / 100}</p>
                                        {SetStars(el.Rating)}
                                        <p>({el.RatingCount})</p>
                                    </div>
                                    <p className="amountOfCustomers"><span>{el.Bought} persons</span> bought this offer</p>
                                </div>
                            </div>
                            <div className="buy">
                                <p className="price">{Math.floor(el.Price)},<span>{((el.Price % 1) * 100).toFixed().toString().padStart(2, "0")}</span> zł</p>
                                <p className="cond"><span>Condition:</span> {el.Cond}</p>
                                {!el.IsAdded && <input type="button" onClick={(e) => { e.preventDefault(); AddToCartFun(el) }} value="Add to cart" />}
                            </div>
                        </Link>
                    ))}
                </div>
            </article>
            <aside id="aside2"></aside>
            <footer></footer>
        </main>
    );
}