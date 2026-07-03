import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,

  CircularProgress,
  Pagination,
} from "@mui/material";
import {
  deleteArendator,
  getArendatori,
  getArendatorDetails,
  deleteContract,
  deleteTeren,
} from "../services/api";
import { Arendator } from "../types";
import { ArendatoriTable } from "../components/Arendatori/ArendatoriTable";

export const ArendatoriPage: React.FC = () => {
  const [arendatori, setArendatori] = useState<Arendator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / 50));
  const navigate = useNavigate();

  const loadArendatori = useCallback(async () => {
    try {
      //setLoading(true);
      const offset = (page - 1) * 50;
      const response = await getArendatori(50, offset, search);
      setArendatori(response.results);
      console.log("Total arendatori:", response.count);
      //calculeaza numarul total de  pagini

      setTotalCount(response.count);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error || err?.message || "Eroare la încărcare";
      setError(errorMsg);
      console.error("Eroare:", err);
    } // finally {
    //setLoading(false);
    // }
  }, [page, search]);

  // Încarcă datele când se deschide pagina
  useEffect(() => {
    setLoading(true);
    loadArendatori().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirstRender = useRef(true);

  // Search/Page changes - reîncarcă silent (fără spinner)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    loadArendatori();
  }, [page, search, loadArendatori]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  // TOATE HOOK-URILE TREBUIE SĂ FIE ÎNAINTE DE RETURN-URI
  const handleViewDetails = useCallback(
    (arendator: Arendator) => {
      navigate(`/arendatori/${arendator.id_arendator}`);
    },
    [navigate],
  );

  const handleEdit = useCallback(
    (arendator: Arendator) => {
      navigate(`/arendatori/${arendator.id_arendator}/edit`);
    },
    [navigate],
  );
  const handleDelete = async (id: number) => {
    const ok = window.confirm("Șterge arendator + contracte + terenuri?");
    if (!ok) return;
    // 1. ia detalii ca să ai id_contract și id_teren
    const details = await getArendatorDetails(id); // trebuie să conțină id_teren pe terenuri
    // 2. șterge terenurile
    for (const c of details.contracte || []) {
      for (const t of c.terenuri || []) {
        if (t.id_teren) await deleteTeren(t.id_teren);
      }
    }
    // 3. șterge contractele
    for (const c of details.contracte || []) {
      if (c.id_contract) await deleteContract(c.id_contract);
    }
    // 4. șterge arendatorul
    await deleteArendator(id);
    // 5. reîncarcă lista
    loadArendatori();
  };

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
        <Typography sx={{ ml: 2 }}>Se încarcă arendatorii...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
        <Button onClick={loadArendatori}>Încearcă din nou</Button>
      </Box>
    );
  }

  const PaginationComponent = () => (
    <Pagination
      count={totalPages}
      page={page}
      variant="outlined"
      size="large"
      sx={{
        "& .MuiPaginationItem-root": {
          fontSize: "12px",
        },
      }}
      onChange={handlePageChange}
    />
  );

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
        {/* Tabel Material-UI compact */}
        <Box sx={{ width: "85%" }}>
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
              Arendatori ({arendatori.length})
            </Typography>
            <TextField
              label="Caută"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nume, CNP sau telefon..."
              sx={{
                width: { xs: "100%", sm: 180 }, // responsive: full width pe mobil, 180px pe desktop
              }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <PaginationComponent />
          </Box>

          <ArendatoriTable
            arendatori={arendatori}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
      </Box>

      {/* Paginare jos ca în agri.yoppoll.com */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <PaginationComponent />
      </Box>
    </Box>
  );
};
