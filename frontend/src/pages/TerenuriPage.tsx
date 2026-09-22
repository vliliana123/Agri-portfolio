import React, { useState, useEffect, useCallback, useRef, } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import { getTerenuri } from "../services/api";
import { TerenuriTable } from "../components/Terenuri/TerenuriTable";
import { useNavigate } from "react-router-dom";
 

export const TerenuriPage: React.FC = () => {
  const navigate = useNavigate();
  // State
  const [terenuri, setTerenuri] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / 50));
  // Mount: Fetch toți terenurile
    
    const loadTerenuri = useCallback(async () => {
      try {
        
        setError(null);
         const offset = (page - 1) * 50;
      const response = await getTerenuri(searchTerm, 50, offset);
   
      setTerenuri(response.results);
      setTotalCount(response.count);
      //  console.log("API terenuri:", response);
      // console.log("results:", response.results);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.error || err?.message || "Eroare la încărcare";
        setError(errorMsg);
        console.error("Eroare:", err);
      } finally {
 
      }
       
    }, [page, searchTerm]);

 

  // Încarcă datele când se deschide pagina
    useEffect(() => {
      setLoading(true);
      loadTerenuri().finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    const isFirstRender = useRef(true);
  
    // Search/Page changes - reîncarcă silent (fără spinner)
    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      loadTerenuri();
    }, [page, searchTerm, loadTerenuri]);
    
  
    const handlePageChange = (
      event: React.ChangeEvent<unknown>,
      newPage: number,
    ) => {
      setPage(newPage);
    };
  

  const handleViewDetails = (contract: any) => {
    navigate(`/contracte/${contract }/detalii`);
  };
const PaginationComponent = () => (
    <Pagination
      count={totalPages}
      page={page}
      variant="outlined"
      siblingCount={0}
      sx={{
        "& .MuiPaginationItem-root": {
          fontSize: "12px",
          minWidth: { xs: 28, sm: 36 },
          height: { xs: 28, sm: 36 },
          margin: { xs: "0 1px", sm: "0 3px" },
        },
      }}
      onChange={handlePageChange}
    />
  );
  return (
    <Box
      sx={{
        backgroundColor: "white",
        minHeight: { xs: "auto", sm: "100vh" },
        p: { xs: 1.5, sm: 2, md: 3 },
        pt: { xs: 3, sm: 4, md: 5 },
      }}
    >
      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            minHeight: 300,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ color: "#666" }}>
            Se încarcă terenurile...
          </Typography>
        </Box>
      )}

      {/* Content */}
      {!loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            px: { xs: 1, md: 2 },
          }}
        >
          {/* Inner container - 85% width */}
          <Box sx={{ width: { xs: "100%", md: "85%" } }}>

            {/* Header and Search on same line */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              flexWrap={{ xs: "wrap", sm: "nowrap" }}
              gap={2}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: "#2c3e50",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                Vizualizare Terenuri
              </Typography>
              <TextField
                label="Caută"
                variant="outlined"
                size="small"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nume, CNP sau contract..."
                sx={{
                  width: { xs: "100%", sm: 180 },
                }}
              />
            </Box>
                 <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                            <PaginationComponent />
                          </Box>
            {/* Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

          <TerenuriTable terenuri={terenuri} onViewDetails={handleViewDetails} />

           <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <PaginationComponent />
                    </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
