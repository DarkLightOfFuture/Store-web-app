import { React, rem } from "../app"
import { Nav, HexToUUID } from "./others"
import { useRef, useState, useEffect } from "react"
import { useAppContext } from "../contexts/context"
import { Link } from "react-router-dom"

export function MainPage() {
    return (
        <main id="main">
            <Nav />
            <aside id="aside1"></aside>
            <article>
                <RecommendedProducts />
                <PopularCategories />
            </article>
            <aside id="aside2"></aside> 
            <footer></footer>
        </main>
    );
}

function RecommendedProducts() {
    const { setMessages } = useAppContext();

    const productsCont = useRef(null);
    const points = useRef(null);

    const [products, setProducts] = useState([]);

    const [crr, setCrr] = useState(0);
    const [ammountOfPoints, setAmmountOfPoints] = useState(null);

    //Gets recommended products
    useEffect(() => {
        const query = new URLSearchParams({
            Page: "1",
            Rows: "30",
            OrderBy: "RAND()"
        });

        ["Id", "Title", "Price", "ImgPaths"].forEach(el => query.append("Columns", el));

        fetch(`/api/product/getmany?${query}`, {
            method: "GET"
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                data.response.Elements?.map(el => el.Id = HexToUUID(el.Id))
                
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
    }, []);

    //Configures slider of recommended products
    useEffect(() => {
        if (products.length > 0) {
            let result;

            if (productsCont.current.scrollWidth != productsCont.current.clientWidth)
                result = Math.ceil(productsCont.current.scrollWidth / (Math.floor(productsCont.current.clientWidth / (11 * rem)) * 11 * rem));
            else
                result = 1;

            setAmmountOfPoints(result);
            
            new Array(result).fill(null).forEach((el, ind) => {
                const div = document.createElement("div");

                if (ind == 0) {
                    div.classList.add("checked");
                }

                points.current.appendChild(div);
            });
        }
    }, [products]);

    //Position of slider

    const changePointUp = () => {
        setCrr(crr + 1);

        points.current.querySelectorAll("*").forEach((el, ind) => {
            if ((crr + 1 < ammountOfPoints && ind == crr + 1) || ind == 0 && crr + 1 >= ammountOfPoints) {
                el.classList.add("checked");

                if (ind == 0 && crr + 1 >= ammountOfPoints) {
                    setTimeout(() => {
                        productsCont.current.scrollTo(0, 0);
                        setCrr(0);
                    }, 1);
                }
            }
            else
                el.className = "";
        });

        productsCont.current.scrollBy(crr + 1 < ammountOfPoints ? Math.floor(productsCont.current.clientWidth / (11 * rem)) * 11 * rem : 0, 0);
    };

    const changePointDown = () => {
        setCrr(crr - 1);

        points.current.querySelectorAll("*").forEach((el, ind) => {
            if ((crr - 1 >= 0 && ind == crr - 1) || ind == ammountOfPoints - 1 && crr - 1 < 0) {
                el.classList.add("checked");

                if (ind == ammountOfPoints - 1 && crr - 1 < 0) {
                    setTimeout(() => {
                        productsCont.current.scrollTo(productsCont.current.scrollWidth, 0);
                        setCrr(ammountOfPoints - 1);
                    }, 1);
                }
            }
            else
                el.className = "";
        });

        productsCont.current.scrollBy(crr - 1 >= 0 ?
            -Math.floor(productsCont.current.clientWidth / (11 * rem)) * 11 * rem : 0, 0);
    }

    return (
        <div>
            {products.length != 0 && <h1>Recommended Products</h1>}
            {products.length != 0 && <div ref={productsCont} id="recommendedProducts">
                {products.map((el, id) => (
                    <Link key={id} className="recommendedProduct" to={`product/${el.Id}`}>
                        <img src={JSON.parse(el.ImgPaths)[0]} />
                        <p className="price">{Math.floor(el.Price)},<span>{((el.Price % 1) * 100).toFixed().toString().padStart(2, "0")}</span> zł</p>
                        <p>{el.Title}</p>
                    </Link>
                ))}
            </div>}
            {products.length != 0 && <div>
                <p onClick={changePointDown}>&lt;</p>
                <div ref={points} className="points">
                </div>
                <p onClick={changePointUp}>&gt;</p>
            </div>}
        </div>
    )
}

function PopularCategories() {
    const links = [
        "https://modernhouse-projekty.pl/wp-content/uploads/2024/10/01_Parterowy_projekt_domu_o_powierzchni_130_m2_NewHouse_761_Modern_House-scaled.webp",
        "https://as1.ftcdn.net/v2/jpg/01/28/03/88/1000_F_128038883_X7v2uUKzgeyGZdxC4mqNE4R02iJZVNds.jpg",
        "https://s22908.pcdn.co/wp-content/uploads/2023/07/most-hyped-up-games.jpg",
        "https://super-cars.pl/file/2119",
        "https://st3.depositphotos.com/1177973/13520/i/450/depositphotos_135200726-stock-photo-laptop-and-headphones-on-table.jpg",
        "https://aptekaszpitalna.pl/wp-content/uploads/2024/08/shutterstock_2432099501-scaled.jpg"
    ];

    const categories = ["House", "Clothes", "Games", "Automotive", "Electronics", "Health"];

    return (
        <div>
            <h1>Popular Categories</h1>
            <div id="popularCategories">
                {categories.map((el, ind) => (
                    <Link key={ind} to={`/search?category=${el}`}>
                        <img src={links[ind]} />
                        <h2>{el}</h2>
                    </Link>
                ))}
            </div>
        </div>
    )
}
