import { useState, useRef, useEffect } from "react"
import { MainPage } from "./components/main"
import { ProductPage } from "./components/product"
import { SearchPage } from "./components/search"
import { CreatorPage } from "./components/creator"
import { PurchasePage } from "./components/purchase"
import { SettingsPage } from "./components/settings"
import { RegisterPage } from "./components/register"
import { LogInPage } from "./components/login"
import { ProfilePage } from "./components/profile"
import { UpdatePage } from "./components/update"
import { MessagePanel } from "./components/messagePanel"
import { Approve } from "./components/approve"
import { AppContextProvider, useAppContext } from "./contexts/context"
import { useNavigate } from "react-router-dom"

declare var require: any;
//Css rem value
export const rem = parseFloat(window.getComputedStyle(document.body).fontSize);

export let React = require('react');
let ReactDOM = require('react-dom/client');
let routerDom = require('react-router-dom');

let Router = routerDom.BrowserRouter;
let Route = routerDom.Route;
let Routes = routerDom.Routes;
let Link = routerDom.Link;

function App() {
    //App context
    const { setUser, user } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        //Pages with authentication to handle
        const paths = ['/settings', '/create'];

        //If session exists before, gets user's data
        fetch("/api/checkauth", { method: "GET" })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                if (data.User != null)
                    setUser(data.User);
                //User is NULL, so this pages cannot be handle
                else if (paths.includes(window.location.pathname))
                    navigate("/");
            }
        })
    }, []);

    return (<p style={{ display: "none" }}></p>);
}

const rootElement = document.getElementById('root');

//Router
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <Router>
            <AppContextProvider>
                <App />
                <Approve />
                <MessagePanel />
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/create" element={<CreatorPage />} />
                    <Route path="/product/update/:id" element={<UpdatePage />} />
                    <Route path="/purchase" element={<PurchasePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LogInPage />} />
                </Routes>
            </AppContextProvider>
        </Router >
    );
}
