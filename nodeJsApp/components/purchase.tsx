import { React } from "../app"
import { useState, useEffect } from "react"
import { Nav, RadioInput, SetStars, NumberInput, RemoveFromCart,ScrollInto, UseVerifyEmail, UseVerifyPhone, UseVerifyPostalCode } from "./others"
import { useAppContext } from "../contexts/context"
import { useNavigate, Link } from "react-router-dom"

export function PurchasePage() {
    const [deliveryDate, setDeliveryDate] = useState(null);
    //Customer's details, if user's info isn't used
    const [formData, setFormData] = useState({
        FirstName: "", LastName: "",
        Town: "", Street: "", PostalCode: "",
        Email: "", Phone: ""
    });
    const [deliveryType, setDeliveryType] = useState(null);
    //Total price of purchase
    const [total, setTotal] = useState(0);

    //Choice (User's details / new data)
    const [formType, setFormType] = useState("Enter new details");

    const [isFirstStep, setIsFirstStep] = useState(false);
    const [isSecondStep, setisSecondStep] = useState(false);

    //App context
    const { setCart, cart, setMessages, user } = useAppContext();

    const updateTotalPrice = () => {
        let t = 0;
        cart.forEach(el => t += el.Price * el.Amount);

        setTotal(t);
    };

    const navigate = useNavigate();

    const VerifyPhone = UseVerifyPhone(setFormData);
    const VerifyEmail = UseVerifyEmail(setFormData);
    const VerifyPostalCode = UseVerifyPostalCode(setFormData);

    //Updates total price of purchase after changes
    useEffect(() => updateTotalPrice(), []);
    useEffect(() => updateTotalPrice(), [cart]);

    //Validates first step
    useEffect(() => {
        const isInvalid = Object.keys(formData).some(key => formData[key].length == 0)
                            && formType == "Enter new details";

        if (!isInvalid && deliveryType != null) {
            setisSecondStep(true);
            ScrollInto("#deliveryDate");
        }
    }, [formData, deliveryType]);

    //Comes to second step
    function FirstStep() {
        setIsFirstStep(true);
        ScrollInto(".inputGroup");
    }

    //Sends purchase to database
    function Send() {
        let products = cart.map(el => ({ Id: el.Id, Amount: parseInt(el.Amount) }));
        const customerInfo = formType == "Enter new details" ? formData : {};

        fetch("/api/purchase/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...customerInfo,
                DeliveryDate: deliveryDate.toISOString()
                    .slice(0, 19).replace('T', ' '),
                DeliveryType: deliveryType,
                Products: products
            })
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                setTimeout(() => setMessages(state => [...state, {
                    message: data.message,
                    isError: false
                }]), 400);

                //Clears cart
                setCart([]);
                localStorage.removeItem("cart");

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
        <main id="mainPurchase">
            <Nav />
            <aside id="aside1"></aside>
            <article>
                <h2>Purchase</h2>

                {/* Cart content */}

                <div id="purchase">
                    {cart.map((el, i) => (
                    <Link to={`/product/${el.Id}`} key={i} className="product">
                        <div className="details">
                            <img src={JSON.parse(el.ImgPaths)[0]}/>
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
                        <div onClick={e => e.preventDefault()} className="buy">
                            <p className="price">{Math.floor(el.Price)},<span>{((el.Price % 1) * 100).toFixed().toString().padStart(2, "0")}</span> zł</p>
                            <p className="cond"><span>Condition:</span> {el.Cond}</p>
                            <label>Amount: <NumberInput initVal={el.Amount} sendValue={(val) =>
                                setCart(s => s.map(p => p == el ? ({ ...el, Amount: val }) : p))} /></label>
                            <div id="delete2" onClick={() => RemoveFromCart(el.Id, setCart)}>X</div>
                        </div>
                    </Link>))}
                    {cart.length == 0 && <h2>There are no products in cart</h2>}
                    <p id="total" className="price"><b>Total:</b> {Math.floor(total)},<span>{((total % 1) * 100).toFixed().toString().padStart(2, "0")}</span> zł</p>
                    {!isFirstStep && <input type="button" disabled={cart.length == 0} onClick={FirstStep} value="Next" />}
                </div>

                {/* First step (customer info and way of delivery) */}

                {(isFirstStep && user != null) && <RadioInput list={["Enter new details", "Use account details"]} setChoice={setFormType} value={0} />}
                {(isFirstStep && formType == "Enter new details") && <div className="inputGroup">
                    <div className="inputBox">
                        <input type="text" id="FirstName" onChange={e => setFormData(s => ({ ...s, FirstName: e.target.value }))} required />
                        <label htmlFor="FirstName">First name</label>
                    </div>
                    <div className="inputBox">
                        <input type="text" id="LastName" onChange={e => setFormData(s => ({ ...s, LastName: e.target.value }))} required />
                        <label htmlFor="LastName">Last name</label>
                    </div>
                </div>}
                {(isFirstStep && formType == "Enter new details") && <div className="inputGroup">
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
                </div>}
                {(isFirstStep && formType == "Enter new details") && <div className="inputGroup">
                    <div className="inputBox">
                        <input type="text" id="Email" onBlur={e => VerifyEmail(e)} required />
                        <label htmlFor="Email">Email</label>
                    </div>
                    <div className="inputBox">
                        <input type="text" id="PhoneNumber" onBlur={e => VerifyPhone(e)} required />
                        <label htmlFor="PhoneNumber">Phone number</label>
                    </div>
                </div>}
                {isFirstStep && <RadioInput list={["Courier (cash)", "Courier (electronic prepayment)", "Courier (electronic payment on delivery)", "In-store pickup"]}
                    isBorder={true} name={"Delivery And Payment"} setChoice={setDeliveryType} />}

                {/* Second step (deliver date) */}

                {isSecondStep && <h2>Delivery Date</h2>}
                {isSecondStep && <DeliveryDate after={3} sendDate={setDeliveryDate} />}
                {isSecondStep && <div id="send"><input disabled={deliveryDate == null} className="accept"
                    type="button" onClick={Send} value="Send" /></div>}
            </article>
            <aside id="aside2"></aside>
        </main>
    );
}

//Gets date of delivery
function DeliveryDate({ after = 0, sendDate }) {
    const [val, setVal] = useState(null);

    //Creates calendar's days
    const days = new Array(30).fill("").map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);

        return date;
    });

    //Sets days, during which customer cannot been delivered
    const crrDate = new Date();
    const crrDayOfWeek = crrDate.getDay();
    let daysBefore;

    //Creates calendar look-like appearance (offset before current day)
    switch (crrDayOfWeek) {
        case 0:
            daysBefore = new Array(6).fill(null);
            break;
        default:
            daysBefore = new Array(crrDayOfWeek - 1).fill(null);
    }

    function GetMonth(month) {
        switch (month) {
            case 0:
                return "January";
            case 1:
                return "February";
            case 2:
                return "March";
            case 3:
                return "April";
            case 4:
                return "May";
            case 5:
                return "June";
            case 6:
                return "July";
            case 7:
                return "August";
            case 8:
                return "September";
            case 9:
                return "October";
            case 10:
                return "November";
            case 11:
                return "December";
        }
    }

    function GetDayOfWeek(day) {
        switch (day) {
            case 0:
                return "Sunday";
            case 1:
                return "Monday";
            case 2:
                return "Tuesday";
            case 3:
                return "Wednesday";
            case 4:
                return "Thursday";
            case 5:
                return "Friday";
            case 6:
                return "Saturday";
        }
    }

    //Sets delivery date
    function ClickFun(id, el) {
        setVal(id);
        sendDate(el);
    }

    return (
        <div id="deliveryDate">
            {daysBefore.map((el, id) => <div key={id}></div>)}

            {days.map((el, id) => (
                <div key={id} className={"date" + (val == id ? " checked" : "") +
                    (id < after || [5, 6].includes((id + daysBefore.length) % 7) ? " disabled" : "")}
                    onClick={(e) => { id >= after && !e.currentTarget.classList.contains("disabled") ? ClickFun(id, el) : null }}>
                    <p>{el.getDate()}</p>
                    <p>{GetMonth(el.getMonth())}</p>
                    <p>{GetDayOfWeek(el.getDay())}</p>
                </div>
            ))}
        </div>
    );
}