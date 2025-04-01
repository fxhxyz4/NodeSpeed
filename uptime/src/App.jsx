// jshint ignore:start
import React, { useState, useEffect } from "react";
import urlsToCheck from "./js/arraySource.js";
import axios from "axios";
import Banner from "./assets/Banner.jpg";

const App = () => {
    const [linksStatus, setLinksStatus] = useState([]);

    const checkLinksStatus = async () => {
        const results = [];

        for (const { name, url } of urlsToCheck) {
            try {
                const response = await axios.get(url);
                results.push({ name, url, status: "Working", statusCode: response.status });
            } catch (e) {
                results.push({ name, url, status: "Down", error: e.message });
            }
        }

        setLinksStatus(results);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            checkLinksStatus();
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container">
            <div className="header">
                <div className="header__block">
                    <img className="header__img" src={Banner} alt="banner" />
                    <div className="header__line"></div>

                    <h1 className="header__title">NodeSpeed Status</h1>
                    <div className="header__time">
                        <p className="header__time_text">Last checked: {new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            <main className="main">
                <div className="main__result">
                    <h2
                        className={`main__title ${linksStatus.every((link) => link.status === "Working") ? "text-green-500" : "text-red-500"}`}
                    >
                        {linksStatus.every((link) => link.status === "Working")
                            ? "All systems are Operational"
                            : "Some systems are Down"}
                    </h2>
                    <hr />
                </div>
                <div className="main__services services">
                    <h2 className="main__subtitle">Services</h2>
                    <ul className="services__list">
                        {linksStatus.length === 0 ? (
                            <li className="services__item item">Loading...</li>
                        ) : (
                            linksStatus.map((link, index) => (
                                <li key={index} className="services__item item">
                                    <div className="item__block">
                                        <p className="item__link">
                                            <b>{link.name}</b>
                                        </p>
                                        <a className="item__link" href={link.url} target="_blank">
                                            <i>{link.url}</i>
                                        </a>
                                        <p
                                            className={`item__status ${link.status === "Down" ? "text-red-500" : "text-green-500"}`}
                                        >
                                            {link.status}
                                        </p>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </main>

            <footer className="footer">
                <p className="footer__license">NodeSpeed status | fxhxyz @ All rights reserved</p>
            </footer>
        </div>
    );
};

export default App;
// jshint ignore:end
