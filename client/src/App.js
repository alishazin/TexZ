import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp"
import LogIn from "./pages/LogIn"

function App() {
	return (
		<>
            <BrowserRouter>
                <Routes>
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<LogIn />} />
                </Routes>
            </BrowserRouter>
        </>
	);
}

export default App;
