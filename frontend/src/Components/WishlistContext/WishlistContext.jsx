import { useEffect } from "react";
import { createContext,useContext,useState,React } from "react";
import { useAuth } from "../AuthContext/AuthContext";
import { wishlistApi } from "../../services/api";
import { AuthContext } from "../AuthContext/AuthContext";
import { useCallback } from "react";
const WishlistContext = createContext();

export const WishlistProvider = ({children})=>{
    const {user,isLoggedIn} = useContext(AuthContext);
    const [wishlist,setWishlist] = useState([]);
    const [loading,setLoading] =  useState(false);
    const [error,setError] = useState(null);

    useEffect(()=>{
        const fetchWishlist = async()=>{
            if(!isLoggedIn){
                setWishlist([]);
                return;
            }
            try{
                const response = await wishlistApi.getWishlist();
                setWishlist(response.data.wishlist || []);

            }catch(err){
                console.log("Failed to fetch wishlist:",err);
                setError(err.response?.data?.message || 'Failed to load wishlist')
            }finally{
                setLoading(false);
            }

        };
        fetchWishlist();
    },[isLoggedIn])

    const addToWishlist = useCallback(async(productId)=>
    {   
        console.log("inside add to wishlist islogged status user also= ",user,isLoggedIn)

        if(!isLoggedIn){
            throw new Error('Please login to add items to wishlist')
        };

        setWishlist(prev=>[...prev,productId]);

        try{

            const response = await wishlistApi.addToWishlist(productId);
            setWishlist(response.data.wishlist || []);
            return {success:true};

        }catch(err){
            setWishlist(prev=>prev.filter(id!==productId));
            const message = err.response?.data?.message || 'Failed to add to wishlist';
            setError(message);
            throw new Error(message);
        }

    },[isLoggedIn]);

    const removeFromWishlist = useCallback(async(productId)=>{

        if(!isLoggedIn){
            throw new Error('Login first')
        };
        const previousWishlist = [...wishlist];
        setWishlist(prev=>prev.filter((id) => id !== productId));
        try{
            const response = await wishlistApi.removeFromWishlist(productId);
            setWishlist(response.data.wishlist || []);
            return {success:true};
        }catch(err){
            const message = err.response?.data?.message || 'Failed to remove from wishlist';
            setWishlist(previousWishlist);
            setError(message);
        };

    },[isLoggedIn,wishlist]);

    const toggleWishlist = useCallback(async(productId)=>{
        const isInWishlist = wishlist.includes(productId);
        if(isInWishlist){
            await removeFromWishlist(productId);
        }else{
            await addToWishlist(productId);
        }
    },[wishlist,addToWishlist,removeFromWishlist]);

    const isInWishlist = useCallback((productId)=>{
        return wishlist.includes(productId)
    },[wishlist]);

    const clearError = useCallback(()=>{
        setError(null);
    },[]);

    const value = {
        wishlist,
        wishlistCount:wishlist.length,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearError
    };

    return(
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    )

}

//custom hook
export const useWishlist = ()=>{
    const context = useContext(WishlistContext);
    if(!context){
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
};
