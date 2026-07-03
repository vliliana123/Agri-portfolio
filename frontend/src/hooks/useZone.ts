import { useEffect,useState } from "react";
import { getZone } from "../services/api";
type Zone={id_zona:number,nume:string};

export const useZone = (shouldFetch: boolean = true) => {
  const [zone, setZone] = useState<Zone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);      

  const load=async()=>{
    setLoading(true);
    setError(null);
    try{
      const data=await getZone();
      setZone(data);
    }catch(err){
      setError("Eroare la încărcarea zonelor: "+String(err));
      console.error("Eroare:",err);
    }finally{
      setLoading(false);
    }
  };
  useEffect(()=>{
    if (shouldFetch) {
      load();
    } else {  
      setZone([]);  
    }

  },[shouldFetch]);

  return {zone,loading,error,refresh:load};
}