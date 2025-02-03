import HomePage from "./Pages/MainPage"
import WelcomePage from "./Pages/WelcomePage"

const routers = [
    {
        element: <WelcomePage/>,
        path: '/',
        exact: true
    },
    {
        element: <HomePage/>,
        path: '/home',
    },
    {
        element: <WelcomePage/>,
        path: '/welcome'
    }
]

export default routers