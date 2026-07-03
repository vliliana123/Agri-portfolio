import React, { useEffect, useCallback, useState, useRef } from "react";
import { deleteAditional, getAditionale} from "../services/api";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { AditionaleTable } from "../components/Aditionale/AditionaleTable";

import { AditionaleDetailsModal } from "../components/Aditionale/AditionaleDetailsModal";
import { useNavigate } from "react-router-dom";


const AditionalePage: React.FC = () => {
  const [aditionale, setAditionale] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / 50));
  const navigate = useNavigate();

   // State pentru modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAditional, setSelectedAditional] = useState<any>(null);
 
  const loadAditionale = useCallback(async () => {
    try {
      const offset = (page - 1) * 50;
      const response = await getAditionale(50, offset, search);
      setAditionale(response.results || []);
      setTotalCount(response.count || 0);
      console.log("✅ Aditionale setat cu", response.results?.length, "elemente");
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error || err?.message || "Eroare la încărcare";
      setError(errorMsg);
      console.error("❌ Eroare:", err);
    }
  }, [page, search]);

  // Load on mount
  useEffect(() => {
    setLoading(true);
    loadAditionale().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirstRender = useRef(true);

  // Search/Page changes - reîncarcă
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  
    loadAditionale();
    
  }, [page, search,loadAditionale]);  
 

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };
// Handler pentru deschidere modal
const handleViewDetails = (aditional: any) => {
  setSelectedAditional(aditional);
  setModalOpen(true);
};

const handleCloseModal = () => {
  setModalOpen(false);
  setSelectedAditional(null);
};

const handleDeleteAditional = async (id:number) => {
  if (!window.confirm("Ești sigur că vrei să ștergi acest aditional?")) {
    return;
  }
  try {
    await deleteAditional(id);
    // După ștergere, reîncarcă lista
    await loadAditionale();
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.error || err?.message || "Eroare la ștergere";
    setError(errorMsg);
    console.error("❌ Eroare:", err);
  }
};
  const PaginationComponent = () => (
    <Pagination
      count={totalPages}
      page={page}
      variant="outlined"
      size="large"
      onChange={handlePageChange}
      color="primary"
    />
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Box><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box sx={{ backgroundColor: "white", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3, width: "100%", px: { xs: 1, md: 2 }, pt: { xs: 3, sm: 4, md: 5 } }}>
        <Box sx={{ width: "85%" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap={{ xs: "wrap", sm: "nowrap" }} gap={2}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#2c3e50", fontSize: { xs: "1.5rem", sm: "2rem" } }}>
              Aditionale ({aditionale.length})
            </Typography>
            <TextField
              label="Caută"
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearchChange}
              placeholder="Caută..."
              sx={{ width: { xs: "100%", sm: 200 } }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <PaginationComponent />
          </Box>
 

          <AditionaleTable 
  aditionale={aditionale} 
  onViewDetails={handleViewDetails}
  onEdit={(aditional) => navigate(`/aditionale/${aditional.id_aditional}/edit`)} 
  onDelete={handleDeleteAditional} 
/>

{/* Modalul - deschis/închis cu state */}
<AditionaleDetailsModal 
  open={modalOpen} 
  aditional={selectedAditional} 
  onClose={handleCloseModal} 
/>
          
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <PaginationComponent />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AditionalePage;