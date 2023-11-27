import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp"
import LogIn from "./pages/LogIn"
import CreateRoom from "./pages/CreateRoom";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
	return (
		<>
            <BrowserRouter>
                <Routes>
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<LogIn />} />
                    <Route path="/create-room" element={<CreateRoom />} />
                    <Route path="/verify-email/:verification_token" element={<VerifyEmail />} />
                </Routes>
            </BrowserRouter>
        </>
	);
}

export default App;
