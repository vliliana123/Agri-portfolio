// TypeScript interfaces pentru aplicația agricolă
// Bazate pe modelele Django din backend

export interface Contract {

  arendator: {                  
    id_arendator: number;
    nume: string;
  };
  id_contract: number;

  nr_contract: string;
  data_contract: string;
  perioada_contract: string;
  nivel_arenda: string;
  observatii: string;
  terenuri: Teren[]; // Array de terenuri asociate contractului
}

export interface Arendator {
  id_arendator: number;
  nume: string;
  adresa: string;
  cnp: string;
  ci_serie: string;
  ci_nr: string;
  ci_el: string;
  ci_data: string;
  telefon: string;
  created_at: string; // CharField din MySQL legacy
  updated_at: string; // CharField din MySQL legacy
  contracte?: Contract[]; // Optional - doar în ArendatoriDisplaySerializer
}
// Pentru formularele de creare (fără ID-uri auto-generate)
export interface ArendatorCreate {
  nume: string;
  adresa: string;
  cnp: string;
  ci_serie: string;
  ci_nr: string;
  ci_el: string;
  ci_data: string;
  telefon: string;
}

export interface ContractCreate {
  id_arendator: number;
  nr_contract: string;
  data_contract: string;
  perioada_contract: string;
  nivel_arenda: string;
  observatii?: string;
}

// Pentru răspunsurile API cu paginare
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Pentru selecția în dropdown-uri
export interface SelectOption {
  value: number | string;
  label: string;
}

export interface Teren {
  id_teren?: number; // Optional pe creare
  id_contract?:number;
  nr_contract?: string; // Optional pe creare
  data_contract?: string; // Optional pe creare
  nume_arendator?: string; // Optional pe creare
  id_zona?: number | null; // Optional pe creare, poate fi null
  act_proprietate: string;
  nr_act_proprietate: string;
  data_act_proprietate?: string | null;
  suprafata: string;
  tarla: string;
  parcela: string;
  vecin_nord: string;
  vecin_sud: string;
  vecin_est: string;
  vecin_vest: string;
  categorie_teren: string;
  zona_nume?: string; // Optional - read-only from backend join
}

export interface TerenCreate {
  // FK-uri — nume care match backend serializer (write_only)
  contract: number;
  arendator: number;
  zona: number | null;   // opțional în backend (allow_null=True)
  act_proprietate: string;
  nr_act_proprietate: string;
  data_act_proprietate?: string | null;
  suprafata: string;
  tarla: string;
  parcela: string;
  vecin_nord: string;
  vecin_sud: string;
  vecin_est: string;
  vecin_vest: string;
  categorie_teren: string;
}
export interface ContractDetails {
  id_contract: number;
  nr_contract: string;
  data_contract: string;
  perioada_contract: string;
  nivel_arenda: string;
  observatii?: string | null;
  arendator: {
    id_arendator: number;
    nume: string;
    cnp?: string | null;
    telefon?: string | null;
    adresa?: string | null;
  };
  terenuri: Array<{
    id_teren: number;
    id_zona?: number | null;
    act_proprietate?: string | null;
    nr_act_proprietate?: string | null;
    data_act_proprietate?: string | null;
    suprafata?: string | null;
    tarla?: string | null;
    parcela?: string | null;
    vecin_nord?: string | null;
    vecin_est?: string | null;
    vecin_sud?: string | null;
    vecin_vest?: string | null;
    categorie_teren?: string | null;
    zona_nume?: string;
  }>;
}
export interface Arenda {
  id_arenda: number;
  id_contract: number;
  an_arenda: string;
  nivel_lei: number;
  status: "neachitat" | "achitat_partial" | "achitat_integral";
  sold_initial?: number;
  sold_ramas?: number;
}

export interface ArendaCreate {
  id_contract: number;
  an_arenda: string;
  nivel_lei: number;
}

export interface PlataDetails {
  uuid: string;
  id_plata: number;
  tip_plata: string;
  cantitate: number;
  valoare_lei: number;
  pret_kg?: number;
  status: string;
  data_generarii: string;
  metoda_plata?: string;
  observatii?: string;
  data_plata?: string;
  updated_at?: string;

  oblio_status?: string;
  oblio_invoice_id?: string;
  oblio_link?: string;
  oblio_submitted_at?: string;

  arenda: {
    id_arenda: number;
    an_arenda: string;
    nivel_lei: number;
    contract: {
      nr_contract: string;
      data_contract: string;
      arendator: {
        nume: string;
        cnp: string;
        telefon: string;
      };
    };
  };
}

// Pentru lista plati din lista_plati endpoint (flat structure)
export interface PlatiArenda {
  id_plata: number;
  uuid: string;
  tip_plata: string;
  cantitate: number;
  valoare_lei: number;
  pret_kg?: number;
  status: string;
  data_generarii: string;
  data_plata?: string;
  metoda_plata?: string;
  observatii?: string;
  an_arenda: string;
  nr_contract: string;
  data_contract: string;
   contract: {
    nr_contract: string;
    arendator: {
      id_arendator: number;
      nume: string;
    };
  };
 // nume_arendator?: string;
}
export interface ArendatoriTableProps {
  arendatori: Arendator[];
  onViewDetails: (arendator: Arendator) => void;
  onEdit: (arendator: Arendator) => void;
  onDelete: (id_arendator: number) => void;
}
export interface AditionaleTableProps {
  aditionale: Aditionale[];
  onViewDetails: (aditional: Aditionale) => void;
  onEdit: (aditional: Aditionale) => void;
  onDelete: (id_aditional: number) => void;
}

export interface Aditionale {
  id_aditional: number;
  nr_aditional: string;
  contract: {
    id_contract: number;
    nr_contract: string;
    data_contract: string;
    arendator: {
      id_arendator: number;
      nume: string;
    };
  };
  data_aditional: string;
  perioada_aditional: string;
  nivel_arenda: number;
  created_at: string;
  updated_at: string;
}

export interface EmitOblioResponse {
  message: string;
  id_plata: number;
  uuid: string;
  oblio_invoice_id: string;
  oblio_status: string;
  oblio_link?: string;
  oblio_submitted_at?: string;
}

export interface ConfigAn {
  id: number;
  an: string;
  pret_kg_grau: number | null;
  pret_kg_porumb: number | null;
  created_at?: string;
  updated_at?: string;
}
export type ConfigAnCreate= Omit<ConfigAn, 'id' | 'created_at' | 'updated_at'>;
export type ConfigAnUpdate= Partial<ConfigAnCreate>;
