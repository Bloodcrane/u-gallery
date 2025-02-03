import HomePage from "./Pages/MainPage"
import HistoryPage from "./Pages/HistoryPage"

const routers = [
    {
        element: <HomePage/>,
        path: '/',
        exact: true
    },
    {
        element: <HomePage/>,
        path: '/home',
    },
    {
        element: <HistoryPage/>,
        path: '/history'
    }
]

export default routers