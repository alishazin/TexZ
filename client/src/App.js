import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp"
import LogIn from "./pages/LogIn"
import CreateRoom from "./pages/CreateRoom"
import Rooms from "./pages/Rooms";
import JoinRoom from "./pages/JoinRoom";
import VerifyEmail from "./pages/VerifyEmail"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";

function App() {
	return (
		<>
            <BrowserRouter>
                <Routes>
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<LogIn />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/create-room" element={<CreateRoom />} />
                    <Route path="/join-room" element={<JoinRoom />} />
                    <Route path="/verify-email/:verification_token" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:resetpass_token" element={<ResetPassword />} />
                    <Route path="/change-password/" element={<ChangePassword />} />
                </Routes>
            </BrowserRouter>
        </>
	);
}

export default App;
