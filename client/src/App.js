import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp"

function App() {
	return (
		<>
            <BrowserRouter>
                <Routes>
                    <Route path="/signup" element={<SignUp />} />
                </Routes>
            </BrowserRouter>
        </>
	);
}

export default App;
