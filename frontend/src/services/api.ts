
import axios from 'axios';
import {Arendator,EmitOblioResponse, 
  Contract,ArendatorCreate,PaginatedResponse,
  Teren,ContractDetails, ContractCreate, 
  TerenCreate,ArendaCreate,Arenda, PlataDetails, 
  Aditionale,
  ConfigAn,
  ConfigAnCreate,
  ConfigAnUpdate} from '../types';

// În dev (localhost / IP de rețea) backend-ul rulează separat pe :8000.
// În producție frontend-ul și API-ul sunt pe ACELAȘI domeniu → cale relativă `/api`.
const hostname = window.location.hostname;
const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalDev ? `http://${hostname}:8000/api` : '/api');

export const api= axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000, // 30 secunde timeout pentru toate request-urile
    headers: {
        'Content-Type': 'application/json',
    }
});


// Response interceptor pentru token refresh pe 401
// Refresh tokenul e citit de server din cookie httpOnly — body-ul e gol.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('Request a expirat după 30 secunde');
      // Opțional: afișează toast cu mesaj user-friendly
    }
    const originalRequest = error.config;

    // Nu încerca refresh pentru endpoint-urile de auth (evităm bucle)
    const isAuthEndpoint =
      originalRequest?.url?.includes('/login/') ||
      originalRequest?.url?.includes('/logout/') ||
      originalRequest?.url?.includes('/token/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Body gol — server-ul citește refresh_token din cookie
        await axios.post(
          `${API_BASE_URL}/token/refresh/`,
          {},
          { withCredentials: true }
        );

        // Cookie-ul access_token nou e setat de server. Reîncearcă request-ul.
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh eșuat → utilizator nu mai e logat → redirect la login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// Auth helpers (folosite de LoginContext)
// ============================================================

export const checkAuth = async (): Promise<{ id: number; name: string; email: string; created_at: string }> => {
  const response = await api.get('/me/');
  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ id: number; name: string; email: string; created_at: string }> => {
  const response = await api.post('/login/', { email, password });
  return response.data.user;
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/logout/');
};

// Prima funcție: GET toti arendatorii cu paginare

export const getArendatori = async (
  limit = 50, 
  offset = 0, 
  search = ''
): Promise<PaginatedResponse<Arendator>> => {
  const response = await api.get('/arendatori/', {
    params: { limit, offset, search }
  });
  return response.data;
};

export const getContracte = async (
  limit = 50,
  offset = 0,
  search = ''
): Promise<{count:number; results:any[]}> => {
  //const response = await api.get('/contracte/list_contracte/', {
    const response = await api.get('/contracte/', {
  params: { limit, offset, search }
  });
  return response.data;
};

// GET /api/aditionale/{id}/
export const getAditionale= async(
  limit=50,
  offset=0,
  search=''
) :Promise<{count:number; results:any[]}>=>{
  const response= await api.get('aditionale/', {
    params: { limit, offset, search }
  });
  return{
    count: response.data.count || 0,
    results: response.data.results || response.data ||[]
  };
};

// PUT /api/aditionale/{id}/
export const updateAditional= async(id:number,
  aditionaleData:{
  nr_aditional:string;
  data_aditional:string;
  perioada_aditional:string;
  nivel_arenda:number;
}) :Promise<Aditionale>=>{
  const response= await api.patch(`/aditionale/${id}/`,aditionaleData);
  return response.data;
};

export const deleteAditional= async (id:number):
Promise<void>=>{
  await api.delete(`/aditionale/${id}/`);
};

export const createAditional = async (data: {
  id_contract: number;
  nr_aditional: string;
  data_aditional: string;
  perioada_aditional: string;
  nivel_arenda: string | number;
}): Promise<Aditionale> => {
  const response = await api.post('/aditionale/', data);
  return response.data;
};

export const getAditionaleDetails= async (id:number) : Promise<Aditionale>=>{
const response= await api.get(`/aditionale/${id}/`);
return response.data;
}



export const getZone =    async ():Promise<any[]>=>{
  const response= await api.get('/zone/');
 
  return response.data.results || response.data; // ← care-i ordinea?
}


//Arendatori

// Explicația pas cu pas:

// async = funcția rulează în background
// limit = 50 = câți arendatori per pagină (default 50)
// offset = 0 = de la ce poziție începe (0 = prima pagină)
// search = '' = text de căutat (gol = toate)
// Promise<PaginatedResponse<Arendator>> = returnează o promisiune cu datele


// Funcție nouă pentru modal cu detalii complete 
export const getArendatorDetails = async (id: number): Promise<Arendator> => {
  const response = await api.get(`/arendatori/${id}/details/`);
  return response.data;
};


// GET    /arendatori/           → Lista tuturor arendatorilor
// POST   /arendatori/           → Creare arendator nou
// GET    /arendatori/{id}/      → Detalii arendator specific  
// PUT    /arendatori/{id}/      → Update complet arendator
// PATCH  /arendatori/{id}/      → Update parțial arendator
// DELETE /arendatori/{id}/      → Ștergere arendator

// GET    /arendatori/           → Lista tuturor arendatorilor
// POST   /arendatori/           → Creare arendator nou
// GET    /arendatori/{id}/      → Detalii arendator specific  
// PUT    /arendatori/{id}/      → Update complet arendator
// PATCH  /arendatori/{id}/      → Update parțial arendator
// DELETE /arendatori/{id}/      → Ștergere arendator
export const createArendator = async (arendatorData: Omit<ArendatorCreate, 'id_arendator'>): Promise<Arendator> => {
  const response = await api.post('/arendatori/', arendatorData);
  return response.data;
}

export const deleteArendator = async (id: number): Promise<void> => {
  await api.delete(`/arendatori/${id}/`);
}

export const updateArendator=async (id:number, arendatorData: ArendatorCreate):Promise<Arendator> =>{
  const response= await api.put(`/arendatori/${id}/`,arendatorData);
  return response.data;
}

//Contracte

export const getContractDetails = async (id: number): Promise<ContractDetails> => {
  const response = await api.get(`/contracte/${id}/details/`);
  return response.data;
};
export const deleteContract = async (id: number): Promise<void> => {
  await api.delete(`/contracte/${id}/`);
}


export const updateContract = async (id: number, contractData: ContractCreate): Promise<Contract> => {
  const response = await api.put(`/contracte/${id}/`, {
    ...contractData,
    data_contract: convertDateToDatabaseFormat(contractData.data_contract),
  });
  return response.data;
};

export const createContract = async (contractData: ContractCreate): Promise<Contract> => {
  const response = await api.post('/contracte/', {
    ...contractData,
    data_contract: convertDateToDatabaseFormat(contractData.data_contract),
  });
  return response.data;
};

//Terenuri
export const getTerenuri = async (
  search = '',
  limit = 500,
  offset = 0
): Promise<{count:number; results:any[]}> => {
  const response = await api.get('/terenuri/', {
    params: { limit, offset, search }
  });
  return response.data;
}
export const updateTeren=async (id:number, terenData: Omit<Teren, 'zona_nume'>):Promise<Teren> =>{
  const response= await api.put(`/terenuri/${id}/`,terenData);
  return response.data;
}


export const createTeren = async (terenData: TerenCreate): Promise<Teren> => {
  const response = await api.post('/terenuri/', {
    ...terenData,
    // Acceptă atât format "dd.mm.yyyy" cât și deja "YYYY-MM-DD"
    data_act_proprietate: terenData.data_act_proprietate
      ? convertDateToDatabaseFormat(terenData.data_act_proprietate)
      : terenData.data_act_proprietate,
  });
  return response.data;
};

export const deleteTeren = async (id: number): Promise<void> => {
  await api.delete(`/terenuri/${id}/`);
}

export const createArendatorWithContractAndTeren = async (
  arendatorData: ArendatorCreate,
  contractData: Omit<ContractCreate, "id_arendator">,
  terenData: Omit<TerenCreate, "contract" | "arendator">
): Promise<{ arendator: Arendator; contract: Contract; teren: Teren }> => {
  const arendator = await createArendator(arendatorData);

  const contract = await createContract({
    ...contractData,
    id_arendator: arendator.id_arendator,
  });

  const teren = await createTeren({
    ...terenData,
    contract: contract.id_contract,
    arendator: arendator.id_arendator,
  });

  return { arendator, contract, teren };
};
export const createContractWithTeren = async (
  id_arendator: number,
  contractData: Omit<ContractCreate, "id_arendator">,
  terenData: Omit<TerenCreate, "contract" | "arendator">
): Promise<{ contract: Contract; teren: Teren }> => {
   

  const contract = await createContract({
    ...contractData,
    id_arendator: id_arendator
  });

try {
  const teren = await createTeren({
    ...terenData,
    contract: contract.id_contract,
    arendator: id_arendator,
  });
  return { contract, teren };
} catch (err) {
  await deleteContract(contract.id_contract);
  throw err;
}
};

 //Arenda

export const getArenda= async(id_contract:number,an_arenda:string): Promise<Arenda | Arenda[] | null>=>{ 
  //Array dacă backend returnează response.data.results (paginated)
// Single object dacă returnează direct datele, in utilizare trebuie sa verifici tipul
  const response= await api.get('/arenda/',{
    params:{contract_id: id_contract, an_arenda}
  });
  return response.data.results || response.data;
}

export const createArenda  = async (arenda:ArendaCreate )=>{
  const response= await api.post('/arenda/',{
    ...arenda,
  });
  return response.data;

}

// Get all unique years from arenda table
export const getAllArendaYears = async (): Promise<string[]> => {
  const response = await api.get('/arenda/', {
    params: { limit: 1000 }
  });
  const results = response.data.results || response.data || [];
  const years = Array.from(new Set(results.map((arenda: any) => arenda.an_arenda))) as string[];
  return years.sort().reverse();
};

// // DEPRECATED - Set pret_kg_primarie for ALL arendas in a specific year (bulk)
// export const setArendaPretKgByYear = async (
//   an_arenda: string,
//   pret_kg_primarie: number
// ): Promise<{ message: string; updated_count: number }> => {
//   const response = await api.post('/arenda/set_pret_kg_by_year/', {
//     an_arenda,
//     pret_kg_primarie
//   });
//   return response.data;
// };
  
export const createPlataArenda = async (data: {
  id_arenda: number;
  tip_plata: string;
  cantitate: number;
  created_at?: string; // YYYY-MM-DD format from backend, este data pt oblio
  metoda_plata?: string | null;
  observatii?: string;
}) => {
  const response = await api.post('/plati-arenda/', {
    id_arenda: data.id_arenda,
    tip_plata: data.tip_plata,
    cantitate: data.cantitate,
    metoda_plata: data.metoda_plata || null,
    observatii: data.observatii || '',
    created_at: data.created_at || undefined,
  });

  return response.data;
};

export const getPlatiArenda = async (id_arenda: number,) => {
  const response = await api.get('/plati-arenda/', {
    params: { arenda_id: id_arenda },
  });

  return response.data.results || response.data;
};
export const getPlatiArendaSearch = async (
  limit = 50,
  offset = 0,
  search = ''
): Promise<{ count: number; results: any[] }> => {
  const response = await api.get('/plati-arenda/', {
    params: { limit, offset, search },
  });
  return response.data;
};


export const getMultiplePlatiArenda = async (uuids: string[]): Promise<PlataDetails[]> => {
  const results = await Promise.all(
    uuids.map(async (uuid) => {
      try {
        const response = await api.get(`/plati-arenda/${uuid}/details/`);
        return response.data;
      } catch {
        return null;
      }
    })
  );
  return results.filter((p): p is PlataDetails => p !== null);
};
// Helper pentru date format conversion
const convertDateToDatabaseFormat = (dateStr: string): string => {
  // Convert dd.mm.yyyy to YYYY-MM-DD
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};
 export const generareAn = (data_contract?: string): string[] => {
  const anCurent = new Date().getFullYear();
  let anContract = anCurent;
  
  if (data_contract) {
    // Acceptă "YYYY-MM-DD", "DD.MM.YYYY", "DD-MM-YYYY", "YYYY-MM-DDTHH:MM:SSZ", etc.
    const yearMatch = data_contract.match(/(\d{4})/);
    if (yearMatch) {
      anContract = parseInt(yearMatch[1], 10);
    }
  }
  
  const ani: string[] = [];
  for (let an = anContract; an <= anCurent; an++) {
    ani.push(an.toString());
  }
  return ani;
  };

  export const calculateExpiryYear = (dateStr: string, perioada: string) => {
    if (!dateStr || !perioada) return "-";
    try {
      const date = new Date(dateStr);
      const startYear = date.getFullYear();
      const years = parseInt(perioada, 10);
      if (isNaN(years)) return "-";
      return String(startYear + years);
    } catch {
      return "-";
    }
  };
// Funcție pentru formatare data dd-mm-yyyy
export const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
};

//Oblio



export const emitPlataInOblio = async (uuid: string): Promise<EmitOblioResponse> => {
const response = await api.post(`/plati-arenda/${uuid}/emit-oblio/`);
return response.data;
};


export const getConfigAnList = async (): Promise<{ count: number; results: ConfigAn[] }> => {
  const response = await api.get('/config-an/');
  return response.data;
};

export const createConfigAn = async (data:ConfigAnCreate): Promise<ConfigAn> => {
  const response = await api.post('/config-an/', data);
  return response.data;
};


export const updateConfigAn = async (
  id: number,
  data: ConfigAnUpdate
): Promise<ConfigAn> => {
  const response = await api.patch(`/config-an/${id}/`, data);
  return response.data;
};

export const deleteConfigAn = async (id: number): Promise<void> => {
  await api.delete(`/config-an/${id}/`);
};
 export const getRaport = async(data_inceput:string,data_sfarsit:string):Promise<{ total_valoare: number; count: number }>=>{
  const response= await api.get('plati-arenda/raport/',{
  params:{data_inceput,data_sfarsit}
  })
  return response.data;
 }

