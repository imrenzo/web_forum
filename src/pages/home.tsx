import axios from "axios";
import CSS from "csstype";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const postStyle: CSS.Properties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}

function Profile() {
    let [data, setData] = useState<any[]>([]);

    useEffect(() => {
        axios
            .get("http://localhost:8080/")
            .then(function (response) {
                setData(response.data)
            })
            .catch(function (error) {
                console.error('Error fetching data:', error);  // Error handling
            });
    }, []);

    return (
        <>
            <div>
                <header>
                    <span style={{ textAlign: 'center' }}>Posts</span>
                    <span id='authenticate'>
                        <Link to="/login">
                            <button>Login</button>
                        </Link>
                    </span>
                </header>
                <div className='posts' style={postStyle}>
                    {/* use MUI */}
                    <ul style={{ padding: '0' }}>
                        {data.map((item) => <p>{item.post_info}</p>)}
                    </ul>
                </div>
            </div >
        </>
    );
}

export default Profile