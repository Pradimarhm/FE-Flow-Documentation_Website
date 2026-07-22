import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from './components/layouts/authLayout';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          {/* Route lainnya */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;