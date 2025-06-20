import { Outlet } from 'react-router-dom'
import Leftbar from '../components/shared/Leftbar'

const RootLayout = () => {
  return (
    <div className="flex h-screen w-full">
      <Leftbar />
      <section className="flex flex-1 h-full overflow-y-auto">
        <Outlet />
      </section>
    </div>
  )
}

export default RootLayout