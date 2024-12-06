import './App.css';
import {useEffect, useState} from "react";
import {Chart} from "react-google-charts";


function App() {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const [symbol, setSymbol] = useState(urlParams.get("symbol"));

    const [stock, setStock] = useState(null);

    const [dayAmount, setDayAmount] = useState(7);

    let stockCard;

    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);


    //Fetch Data from API
    useEffect(() => {
        const API_KEY = process.env.REACT_APP_API_KEY;
        const current = new Date();

        const dateString = current.getFullYear() + "-" + current.getMonth() + "-" + current.getDate();

        setLoading(true)
        fetch(`https://financialmodelingprep.com/api/v3/historical-chart/4hour/${symbol}?from=${dateString}&to=${dateString}&apikey=` + API_KEY)
            .then((response) => response.json())
            .then(setStock).then(() => setLoading(false))
            .catch(setError);


    }, /*Make sure it is fetched freshly when the symbol changes!*/[symbol]);

    if (!symbol) {
        return (
            <div className="App">
                <Header></Header>
                <h2>No Stock defined</h2>
            </div>
        );
    }

    if (loading) {
        //Handle Loading State
        stockCard = <><h2>Loading...</h2></>;
    }
    if (error) {

        //If an error occurs while fetching, just show it on the site
        return (<pre>{JSON.stringify(error)}</pre>);
    }


    if (stock) {
        //Stock was fetched but its empty & doesnt exist
        if (Object.keys(stock).length === 0) {

            //Reset stock & Symbol for React to Re-Render
            setStock(null);
            setSymbol(null);
            return (
                <div className="App">
                    <Header></Header>
                    <h2>Stock couldn't be found!</h2>
                </div>
            );
        }

        //Options for the LineChart, see https://developers.google.com/chart/interactive/docs/gallery/linechart
        const options = {
            title: `${symbol} Stock Report (${dayAmount} Days)`,
            colors: ["#f50057"],
            backgroundColor: "#282c34",
            titleTextStyle: {
                color: "white",
            },
            hAxis: {
                title: "Date",
                format: "dd MMM",
                gridlines: {count: 7},
                minorGridlines: {count: 6},
                textStyle: {
                    color: "white",
                },
                titleTextStyle: {
                    color: "white",
                },
            },
            vAxis: {
                textStyle: {
                    color: "white",
                },
                titleTextStyle: {
                    color: "white",
                },
            },
            chartArea: {
                backgroundColor: {
                    stroke: "#2196f3",
                    strokeWidth: 2,
                },
            },
            pointSize: 7,
            pointsVisible: true,
            legend: {
                position: "right",
                textStyle: {
                    color: "white",
                },
            },
            aggregationTarget: 'series',
        }
        const data = [
            ["Date", "USD Value"]
        ];
        //Populate Data
        for (let i = 0; i < dayAmount; i++) {
            if (stock[i]) { // Ensure the stock data exists for the given index
                data.push([new Date(stock[i].date), stock[i].close]);
            }
        }

        stockCard = (

            <><h2>{"Stock: " + symbol} </h2>

                <div className="stockCard">
                    <Chart
                        chartType="LineChart"
                        width="600px"
                        height="400px"
                        data={data}
                        options={options}
                        //Took this from Google Charts Dev Page to input Dates easily!
                        formatters={[
                            {
                                column: 0,
                                type: "DateFormat",
                                options: {
                                    timeZone: 0,
                                },
                            },
                        ]}
                    />
                </div>
                <TimeFrameSelector></TimeFrameSelector>
            </>);
    }

    return (
        <>
            <div className="App">
                <Header></Header>
            </div>
            {stockCard}
        </>
    );


    //Time Frame Selector
    function TimeFrameSelector() {
        return <div className="daySelection">
            <label>Timeframe</label>
            <select name="days" defaultValue={dayAmount} onChange={(event) => {
                //Set amount of days to show history of to selected amount & trigger a re-render
                setDayAmount(event.target.value);

            }}>
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={21}>21 Days</option>
                <option value={28}>28 Days</option>
            </select>
        </div>;
    }

    //Header Function, self-explanatory
    function Header() {
        return (<header className="App-header">
            <h1>Stockalyse</h1>

            <form onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.target);
                setSymbol(data.get("stockSymbol"));
                setStock(null);
            }}>
                <label>Symbol</label>
                <input id="stockSymbol" name="stockSymbol" type="text"></input>
                <button type="submit">Submit</button>
            </form>
        </header>);
    }
}


export default App;
