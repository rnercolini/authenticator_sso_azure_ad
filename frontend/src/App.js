import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { Container, Navbar, Button } from "react-bootstrap";
import { ProfileContent } from "./ProfileContent";
import { loginRequest } from "./authConfig";

const PageLayout = (props) => {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginRedirect(loginRequest).catch(e => {
            console.error(e);
        });
    }

    const handleLogout = () => {
        instance.logoutRedirect({
            postLogoutRedirectUri: "/",
        });
    }

    return (
        <>
            <Navbar bg="primary" variant="dark" className="mb-3">
                <Container>
                    <Navbar.Brand href="/">MSAL Authentication with FastAPI and React</Navbar.Brand>
                    <AuthenticatedTemplate>
                        <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                    </AuthenticatedTemplate>
                    <UnauthenticatedTemplate>
                        <Button variant="outline-light" onClick={handleLogin}>Login</Button>
                    </UnauthenticatedTemplate>
                </Container>
            </Navbar>
            <Container className="pt-4">
                {props.children}
            </Container>
        </>
    );
};


function App() {
    return (
        <PageLayout>
            <AuthenticatedTemplate>
                <ProfileContent />
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <h4>Welcome to the demo application.</h4>
                <p>You are not logged in. Please click the "Login" button to continue..</p>
            </UnauthenticatedTemplate>
        </PageLayout>
    );
}

export default App;