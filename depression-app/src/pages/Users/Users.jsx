import { useState, useEffect } from "react";
import WellnessPage from "../../components/wellness/WellnessPage";
import { getAllUsers } from "../../services/Api";
import "./Users.css";

const Users = () => {
  const [res, setRes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getResult = async () => {
      try {
        const results = await getAllUsers();
        console.log(results);

        if (results?.data?.message === "no user data found") {
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

  return (
    <WellnessPage
      className="users-page"
      contentClassName="users-page__content"
      subtitle="Registered user records in a readable, accessible admin view."
    >
      <section className="users-hero wm-panel wm-panel--hero reveal-up">
        <p className="wm-eyebrow">Admin Records</p>
        <h1 className="wm-heading">Users</h1>
        <p className="wm-subcopy">
          This page keeps the existing user data source and presents the records with clearer spacing and contrast.
        </p>
      </section>

      <section className="wm-table-shell users-table-shell reveal-up delay-1">
        {isLoading ? (
          <div className="wm-empty-state">
            <h2 className="wm-heading">Loading users...</h2>
            <p>Please wait while Wellness Monitor fetches the latest user list.</p>
          </div>
        ) : res?.length === 0 ? (
          <div className="wm-empty-state">
            <h2 className="wm-heading">Nothing to show</h2>
            <p>No registered user records were returned by the server.</p>
          </div>
        ) : (
          <table className="wm-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {res.map((element, index) => (
                <tr key={`${element[2] || "user"}-${index}`}>
                  <td>{element[0]}</td>
                  <td>{element[1]}</td>
                  <td>{element[2]}</td>
                  <td>{element[4]}</td>
                  <td>{element[6]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </WellnessPage>
  );
};

export default Users;
