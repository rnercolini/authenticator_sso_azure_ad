import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest, apiConfig } from "./authConfig";

export const ProfileContent = () => {
    const { instance, accounts } = useMsal();
    
    const [adminApiData, setAdminApiData] = useState(null);
    const [error, setError] = useState(null);

    const userName = accounts[0]?.name;

    useEffect(() => {
        if (accounts.length > 0) {
            const request = {
                ...loginRequest,
                account: accounts[0],
            };

            instance.acquireTokenSilent(request).then((response) => {
                callApi(response.accessToken, apiConfig.endpoint, () => {}, setError); 
                callApi(response.accessToken, apiConfig.adminEndpoint, setAdminApiData, setError);
            }).catch((e) => {
                instance.acquireTokenRedirect(request).catch(error => {
                    console.error("Error acquiring token with redirect:", error);
                    setError("Unable to obtain an access token.");
                });
            });
        }
    }, [instance, accounts]);

    const callApi = (accessToken, endpoint, setDataCallback, setErrorCallback) => {
        setErrorCallback(null);

        fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                if (response.status === 403) {
                    return null; 
                }
                return response.json().then(errorData => {
                    const errorMessage = errorData.detail?.message || errorData.detail || `Request failed with status ${response.status}`;
                    throw new Error(errorMessage);
                });
            }
        })
        .then(data => {
            if (data) {
                setDataCallback(data);
            }
        })
        .catch(error => {
            setErrorCallback(error.message);
        });
    };

    return (
        <>
            <h5 className="card-title">Usuário {userName} logged in successfully!</h5>
            {adminApiData &&
                <div className="mt-3 alert alert-success">
                    <p className="mb-0">You have Administrator permissions.</p>
                </div>
            }
            {error &&
                 <div className="mt-4 alert alert-danger">
                    <h6>An error occurred:</h6>
                    <p>{error}</p>
                 </div>
            }
        </>
    );
};