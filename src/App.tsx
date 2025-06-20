import { Route, Routes } from "react-router-dom"
import Home from "./_root/1/Home"
import RootLayout from "./_root/RootLayout"
import AdminPage from "./_root/1/AdminPage"
import AuthLayout from "./_auth/AuthLayout"
import SignIn from "./_auth/1/SignIn"
import SignUp from "./_auth/1/SignUp"
import SendRequest from "./_root/1/SendRequest"
import CardDetails from "./_root/1/CardDetails"
import MyHotels from "./_root/1/MyHotels"
import MyTrips from "./_root/1/MyTrips"
import Documentation from "./_root/1/Documentation"
import Success from "./_root/1/Success"

function App() {
  return (
    <main>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Route>

        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path={import.meta.env.VITE_APPWRITE_ADMIN_PAGE} element={<AdminPage />} />
          <Route path="/send" element={<SendRequest />}/>
          <Route path="/trip/:id" element={<CardDetails />}/>
          <Route path="/my-hotels/:id" element={<MyHotels />}/>
          <Route path="/my-trips" element={<MyTrips />}/>
          <Route path="/docs" element={<Documentation />}/>
          <Route path="/success" element={<Success />}/>
        </Route>
      </Routes>
    </main>
  )
}

export default App