import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Pagination,
} from "@mui/material";

import { Contract } from "../types";
import { deleteTeren, deleteContract, getContractDetails, getContracte } from "../services/api";
import { useNavigate } from "react-router-dom";
import { ContracteTable } from "../components/Contracte/ContracteTable";

export const ContractePage: React.FC = () => {
  const [contracte, setContracte] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / 50));
  const navigate = useNavigate();

  const loadContracte = useCallback(async () => {
    try {
      const offset = (page - 1) * 50;
      const response = await getContracte(50, offset, search);
      setContracte(response.results);
      setTotalCount(response.count);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error || err?.message || "Eroare la încărcare";
      setError(errorMsg);
      console.error("Eroare:", err);
    }
  }, [page, search]);

  // Încarcă datele când se deschide pagina
  useEffect(() => {
    setLoading(true);
    loadContracte().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirstRender = useRef(true);

  // Search/Page changes - reîncarcă silent (fără spinner)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    loadContracte();
  }, [page, search, loadContracte]);
  

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  // Handler-uri callback
  const handleViewDetails = useCallback(
    (contract: Contract) => {
      navigate(`/contracte/${contract.id_contract}/detalii`, {
        state: search ? { search } : undefined,
      });
    },
    [navigate, search],
  );

  const handleEdit = useCallback(
    (contract: Contract) => {
      navigate(`/contracte/${contract.id_contract}/edit`);
    },
    [navigate],
  );

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Șterge contract și toate terenurile/contracte aditionale legate?");
    if (!ok) return;
    try {
      // 1. ia detalii contract ca să ai id-urile terenurilor
      const details = await getContractDetails(id);
      // 2. șterge terenurile mai întâi (din cauza foreign keys)
      for (const t of details.terenuri || []) {
        if (t.id_teren) await deleteTeren(t.id_teren);
      }
      // 3. șterge contractul
      await deleteContract(details.id_contract);
      // 4. reîncarcă lista
      loadContracte();
    } catch (err: any) {
      console.error("Eroare la ștergere:", err);
      alert("Eroare la ștergere contract");
    }
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

  // RETURN-URILE CONDIȚIONALE DUPĂ TOATE HOOK-URILE
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Se încarcă contractele...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
        <Button onClick={loadContracte}>Încearcă din nou</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "white", minHeight: "100vh" }}>
      {/* Container pentru aliniere */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
          width: "100%",
          px: { xs: 1, md: 2 },
          pt: { xs: 3, sm: 4, md: 5 },
        }}
      >
        {/* Tabel Material-UI */}
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
              Contracte ({contracte.length})
            </Typography>
            <TextField
              label="Caută"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="CNP sau Nume arendator..."
              sx={{
                width: { xs: "100%", sm: 200 },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <PaginationComponent />
          </Box>

          <ContracteTable
            contracte={contracte}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
      </Box>

      {/* Paginare jos */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <PaginationComponent />
      </Box>
    </Box>
  );
};
