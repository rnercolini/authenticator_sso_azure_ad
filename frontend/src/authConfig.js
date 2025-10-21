import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: "33914586-4ca0-4778-8ec5-bf6754693dfb", 
        authority: "https://login.microsoftonline.com/f1229471-3877-429b-93f8-0b197be78fa5",
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
    scopes: [`api://33914586-4ca0-4778-8ec5-bf6754693dfb/access_as_user`],
};

export const apiConfig = {
    endpoint: "http://localhost:8000/api/me",
    adminEndpoint: "http://localhost:8000/api/admin",
};