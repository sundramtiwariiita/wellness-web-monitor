import { useState, useEffect } from "react";
import "./Users.css"
import { getAllUsers } from "../../services/Api";

const Users = () => {

  const [res, setRes] = useState([]);

  useEffect(() => {
    const getResult = async () => {
      try {
        const results = await getAllUsers();
        console.log(results);

        if (results?.data?.message === "no user data found") {
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

  return (
    <>
      <div className="users-container">
        <h2>Users</h2>
        {res?.length === 0 ? (
            <p>Nothing to show</p>
        ) : (
            <table>
                <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Age</th>
                </tr>
                {res?.length === 0 ? (
                    <p>Nothing to show</p>
                ) : (
                    res.map((element) => (
                        <>
                            <tr>
                                <td>{element[0]}</td>
                                <td>{element[1]}</td>
                                <td>{element[2]}</td>
                                <td>{element[4]}</td>
                                <td>{element[6]}</td>
                            </tr>
                        </>
                    ))
                )}
            </table>
        )}

      </div>
    </>
  )
}

export default Users