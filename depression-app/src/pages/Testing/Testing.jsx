import { useState, useEffect } from "react";
import "./Testing.css";
import { getAllTesters } from "../../services/Api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Testing = () => {
  const [res, setRes] = useState([]);
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    const getResult = async () => {
      try {
        const results = await getAllTesters();
        if (results?.data?.message === "no testing data found") {
          setRes([]);
        } else {
          setRes(results?.data);
        }
      } catch (error) {
        console.log(error);
        setRes([]);
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
      const blob = new Blob([data], { type: fileType })
      const a = document.createElement('a')
      a.download = fileName
      a.href = window.URL.createObjectURL(blob)
      const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      })
      a.dispatchEvent(clickEvt)
      a.remove()
    }
  
    const exportToCsv = e => {
      e.preventDefault()
      let headers = ['Email,Time,Result']
      console.log(filteredData);

      let dataCsv = filteredData.map((entry) => entry.map(field => `"${field}"`).join(','));

      downloadFile({
        data: [headers, ...dataCsv].join('\n'),
        fileName: 'data.csv',
        fileType: 'text/csv',
      });

    }

  return (
    <>
      <div className="testing-container">
        <h2>Testing Data</h2>
        <div className="date-export-container">
          <div className="date-container">
            <h3> Select a date :</h3>
            <DatePicker className="date-filter"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
            />
            <button className="reset-btn" onClick={() => setStartDate(null)}>Reset</button>
          </div>

          <div className="export-container">
            <button type='button' onClick={exportToCsv}>
              Export to CSV
            </button>
          </div>

        </div>

        {filteredData.length === 0 ? (
          <p>Nothing to show</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Time</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((element, index) => (
                <tr key={index}>
                  <td>{element[0]}</td>
                  <td>{element[1]}</td>
                  <td>{element[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}    
      </div>
    </>
  );
};

export default Testing;
