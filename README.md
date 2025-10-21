## 🎯 About The Project

This project provides a robust and secure solution for a common enterprise requirement: allowing users to log in to a custom web application using their existing Microsoft work or school accounts.

The architecture is completely decoupled, with a modern Single-Page Application (SPA) in React and a secure API in FastAPI, making it scalable and easy to maintain. Unlike many examples that rely on high-level abstractions, this project demonstrates **explicit JWT validation**, giving you full control and understanding of the security flow.

### ✨ Key Features

-   **Single Sign-On (SSO):** Authenticates users against a single Microsoft Entra ID tenant.
-   **Modern Frontend:** Built with **React** and hooks, using `@azure/msal-react` to handle the OAuth 2.0 Authorization Code Flow with PKCE.
-   **Robust Backend:** A secure API built with **FastAPI** (Python) that performs explicit JWT validation.
-   **Explicit JWT Validation:** Uses the industry-standard `python-jose` library to validate the token's signature, issuer, and audience, without relying on wrapper libraries.
-   **Role-Based Access Control (RBAC):** Implements permission control using App Roles defined in Azure AD (e.g., an "Admin" role protecting a specific endpoint).
-   **Automatic Token Renewal:** Provides a seamless user experience by silently refreshing access tokens in the background.
-   **Production-Ready:** Includes best practices like environment variable management, a complete `.gitignore`, and a CORS policy.

## 🛠️ Tech Stack

-   **Frontend:**
    -   [React](https://reactjs.org/)
    -   [Microsoft Authentication Library (MSAL) for React](https://github.com/AzureAD/microsoft-authentication-library-for-js)
    -   [Bootstrap](https://getbootstrap.com/)
-   **Backend:**
    -   [FastAPI](https://fastapi.tiangolo.com/)
    -   [Python 3.8+](https://www.python.org/)
    -   [Uvicorn](https://www.uvicorn.org/)
    -   [python-jose](https://github.com/mpdavis/python-jose) for JWT validation
-   **Authentication:**
    -   [Microsoft Entra ID (Azure AD)](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id)
    -   OAuth 2.0 & OpenID Connect (OIDC)

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

-   An **Azure Account** with permissions to manage Microsoft Entra ID.
-   **Node.js** (v16 or later)
-   **Python** (v3.8 or later)

### 1. Azure AD Configuration (From Scratch)

This is the most critical step. Follow these instructions to create a new App Registration.

1.  **Navigate to App Registrations:**
    -   In the Azure Portal, go to **Microsoft Entra ID** -> **App registrations**.
2.  **Create a New Registration:**
    -   Click **+ New registration**.
    -   **Name:** `AppAutenticacaoFinal` (or your preferred name).
    -   **Supported account types:** Select **Accounts in this organizational directory only (Single tenant)**.
    -   **Redirect URI:** Select **Single-page application (SPA)** and enter `http://localhost:3000`.
    -   Click **Register**.
3.  **Expose an API:**
    -   In your app's menu, go to **Expose an API**.
    -   Click **Set** next to **Application ID URI**. Accept the default (`api://<client-id>`) and click **Save**.
    -   Click **+ Add a scope**, name it `access_as_user`, and save.
4.  **Create App Roles for RBAC:**
    -   Go to **App roles** -> **+ Create app role**.
    -   Create a role with the following **Value**: `Admin`. This value is case-sensitive.
5.  **Enable v2.0 Tokens (CRITICAL):**
    -   Go to **Manifest**.
    -   Find the property `"accessTokenAcceptedVersion"` and change its value from `null` to `2`.
    -   Click **Save**. This ensures the token's `audience` claim is correctly formatted for our backend.
6.  **Assign a User to the Admin Role:**
    -   Go to **Microsoft Entra ID** -> **Enterprise applications**.
    -   Select your application.
    -   Go to **Users and groups** -> **+ Add user/group**.
    -   Select your user account and assign it the **Admin** role you created.

### 2. Backend Setup (FastAPI)

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# Copy the example file
cp .env.example .env

# Now, open the .env file and fill in the values you collected from Azure
```

### 3. Frontend Setup (React)

```bash
# 1. Navigate to the frontend directory in a new terminal
cd frontend

# 2. Install dependencies
npm install

# 3. Configure the MSAL client
# Open the file `src/authConfig.js` and fill in the required
# values (clientId, tenantId, and appId URI) from your Azure App Registration.
```

## ⚙️ Configuration

For the application to work, you must provide the necessary credentials from your Azure App Registration.

#### Backend (`backend/.env`)

| Variable      | Description                                          | 
| ------------- | ---------------------------------------------------- | 
| `TENANT_ID`   | The Directory (tenant) ID of your Azure AD instance. | 
| `APP_CLIENT_ID` | The Application (client) ID of your App Registration.  | 
| `APP_ID_URI`  | The Application ID URI from the "Expose an API" section. | 

#### Frontend (`frontend/src/authConfig.js`)

You need to edit the `msalConfig` and `loginRequest` objects directly in this file with the same values from Azure.

## ▶️ Usage

After completing the configuration, you can run the application.

1.  **Start the Backend Server:**
    *(In your first terminal, inside the `backend` folder with the venv activated)*
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

2.  **Start the Frontend Application:**
    *(In your second terminal, inside the `frontend` folder)*
    ```bash

    npm start
    ```
    The React application will open automatically at `http://localhost:3000`.

Now, you can click the "Login" button and authenticate using your Azure AD account.

## 🔑 Authentication Flow

1.  The user clicks "Login" in the React app.
2.  MSAL redirects the user to the Microsoft login page.
3.  After successful login, Azure redirects back to the app with an authorization code.
4.  MSAL exchanges this code for a **v2.0 ID Token** and **Access Token**.
5.  When the React app calls a protected API endpoint, it includes the Access Token in the `Authorization: Bearer <token>` header.
6.  The FastAPI backend receives the token and performs the following checks using `python-jose`:
    -   Verifies the token's signature using the public keys from Azure's JWKS endpoint.
    -   Validates that the `iss` (issuer) claim matches the project's tenant.
    -   Validates that the `aud` (audience) claim matches the backend's own Client ID.
7.  If all checks pass, the request is processed.
