import Index from "../views/Index.vue"
import Home from "../views/Home.vue"
import ShowPath from "../components/ShowPath.vue"
import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import FileList from "../components/FileList.vue"

export default [
    {
        path: "/",
        name: "ShowPath",
        component: ShowPath,
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: "/showPath",
                name: "ShowPath",
                component: ShowPath,
            },
            
            {
                path: "/fl",
                name: "FileList",
                component: FileList,
            },

        ]
    },
    {
        path: "/home",
        name: "home",
        component: Home
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
    },
    {
        path: "/register",
        name: "Register",
        component: Register,
    }


]