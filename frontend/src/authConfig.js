import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: "YOUR_APPLICATION_(CLIENT)_ID", 
        authority: "https://login.microsoftonline.com/YOUR_DIRECTORY_(TENANT)_ID",
        redirectUri: "http://localhost:3000",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const loginRequest = {
    scopes: [`YOUR_APPLICATION_ID_URI/access_as_user`],
};

export const apiConfig = {
    endpoint: "http://localhost:8000/api/me",
    adminEndpoint: "http://localhost:8000/api/admin",
};