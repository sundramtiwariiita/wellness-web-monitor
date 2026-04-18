import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { FiCalendar, FiDownload, FiRefreshCcw } from "react-icons/fi";
import WellnessPage from "../../components/wellness/WellnessPage";
import { getAllTesters } from "../../services/Api";
import "react-datepicker/dist/react-datepicker.css";
import "./Testing.css";

const Testing = () => {
  const [res, setRes] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getResult = async () => {
      try {
        const results = await getAllTesters();

        if (results?.data?.message === "no testing data found") {
          setRes([]);
        } else {
          setRes(results?.data || []);
        }
      } catch (error) {
        console.log(error);
        setRes([]);
      } finally {
        setIsLoading(false);
      }
    };

    getResult();
  }, []);

  const filteredData = startDate
    ? res.filter((entry) => {
        const entryDate = new Date(entry[1]);
        const entryYear = entryDate.getFullYear();
        const entryMonth = entryDate.getMonth();
        const entryDay = entryDate.getDate();

        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const startDay = startDate.getDate();

        if (entryYear > startYear) return true;
        if (entryYear === startYear && entryMonth > startMonth) return true;
        if (entryYear === startYear && entryMonth === startMonth && entryDay > startDay) return true;

        return false;
      })
    : res;

  const downloadFile = ({ data, fileName, fileType }) => {
    const blob = new Blob([data], { type: fileType });
    const a = document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  };

  const exportToCsv = (e) => {
    e.preventDefault();
    const headers = ["Email,Time,Result"];
    console.log(filteredData);

    const dataCsv = filteredData.map((entry) => entry.map((field) => `"${field}"`).join(","));

    downloadFile({
      data: [headers, ...dataCsv].join("\n"),
      fileName: "data.csv",
      fileType: "text/csv",
    });
  };

  return (
    <WellnessPage
      className="testing-page"
      contentClassName="testing-page__content"
      subtitle="Testing records, date filters, and CSV export in a calmer admin workspace."
    >
      <section className="testing-hero wm-panel wm-panel--hero reveal-up">
        <p className="wm-eyebrow">Admin Records</p>
        <h1 className="wm-heading">Testing Data</h1>
        <p className="wm-subcopy">
          Filter completed Wellness Monitor checks by date and export the visible records without changing the existing data flow.
        </p>
      </section>

      <section className="testing-toolbar wm-panel wm-panel--soft reveal-up delay-1">
        <div className="testing-date-control">
          <label htmlFor="testing-date-filter">
            <FiCalendar aria-hidden="true" />
            <span>Select a date</span>
          </label>
          <DatePicker
            id="testing-date-filter"
            className="testing-date-input"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
          />
          <button className="wm-btn wm-btn--secondary testing-small-btn" onClick={() => setStartDate(null)} type="button">
            <FiRefreshCcw aria-hidden="true" />
            Reset
          </button>
        </div>

        <button className="wm-btn wm-btn--primary" type="button" onClick={exportToCsv}>
          <FiDownload aria-hidden="true" />
          Export to CSV
        </button>
      </section>

      <section className="wm-table-shell testing-table-shell reveal-up delay-2">
        {isLoading ? (
          <div className="wm-empty-state">
            <h2 className="wm-heading">Loading testing records...</h2>
            <p>Please wait while the server returns the latest results.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="wm-empty-state">
            <h2 className="wm-heading">Nothing to show</h2>
            <p>No testing data matches the current filter.</p>
          </div>
        ) : (
          <table className="wm-data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Time</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((element, index) => (
                <tr key={`${element[0] || "test"}-${element[1] || index}`}>
                  <td>{element[0]}</td>
                  <td>{element[1]}</td>
                  <td>{element[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </WellnessPage>
  );
};

export default Testing;
