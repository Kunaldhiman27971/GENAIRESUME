import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { loginUser, registerUser, logoutUser, getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setuser, loading, setloading } = context;

    const handlelogin = async ({ email, password }) => {
        setloading(true);
        try {
            const data = await loginUser({ email, password });
            setuser(data?.user ?? null);
            return data;
        } finally {
            setloading(false);
        }
    };

    const handleregister = async ({ name, email, password }) => {
        setloading(true);
        try {
            const data = await registerUser({ username: name, email, password });
            setuser(data?.user ?? null);
            return data;
        } finally {
            setloading(false);
        }
    };

    const handlelogout = async () => {
        setloading(true);
        try {
            await logoutUser();
            setuser(null);
        } finally {
            setloading(false);
        }
    };

    const handlegetme = async () => {
        setloading(true);
        try {
            const data = await getMe();
            setuser(data?.user ?? null);
            return data;
        } finally {
            setloading(false);
        }
    };

    return { user, loading, handlelogin, handleregister, handlelogout, handlegetme };
};