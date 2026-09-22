import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate,useSearchParams,useLocation } from "react-router-dom";
import { BreadcrumbContext } from "../context/BreadcrumbContext";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { getContractDetails } from "../services/api";
import { ContractDetails } from "../types";
const LoadingState = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="400px"
  >
    <CircularProgress />
    <Typography sx={{ ml: 2 }}>Se încarcă detaliile...</Typography>
  </Box>
);

const ErrorState = ({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) => (
  <Box>
    <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
      Înapoi la Contracte
    </Button>
    <Typography color="error">{message}</Typography>
  </Box>
);

export const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setBreadcrumbLabel } = useContext(BreadcrumbContext);
  const contractId = useMemo(() => (id ? Number(id) : null), [id]);
  const searchFromUrl = useMemo(() => searchParams.get("search")?.trim() || "", [searchParams]);
  const searchFromState = useMemo(() => (location.state as { search?: string } | null)?.search || "", [location.state]);
  const effectiveSearch = searchFromState || searchFromUrl;

  const handleBack = () => {
    const state = effectiveSearch ? { search: effectiveSearch } : undefined;
    navigate('/contracte/', { state });
  };

  const formatDate = (value?: string | Date | null) => {
    if (!value) return "-";
    const date = typeof value === "string" ? new Date(value) : value;
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("ro-RO");
  };

  useEffect(() => {
    const loadDetails = async () => {
      if (!contractId) return;

      try {
        setLoading(true);
        setBreadcrumbLabel(""); // Reset before loading
        const data = await getContractDetails(contractId);
        setContract(data);
        setBreadcrumbLabel(`Contract ${data.nr_contract}`); // Set the actual name
      } catch (err) {
        setError("Eroare la încărcarea detaliilor contractului");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [contractId, setBreadcrumbLabel]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !contract) {
    return (
      <ErrorState
        message={error || "Contractul nu a fost găsit"}
        onBack={handleBack}
      />
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "white",
        minHeight: { xs: "auto", sm: "100vh" },
        p: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      {/* Header cu buton înapoi */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          flexWrap: "wrap",
        }}
      >
         
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
          size="small"
        >
          Înapoi
        </Button>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            lineHeight: { xs: 1.3, sm: 1.2 },
          }}
        >
          Contract: {contract.nr_contract}/{formatDate(contract.data_contract)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1.5, sm: 2, md: 3 },
          maxWidth: { xs: "100%", sm: "90%", md: "80%" },
        }}
      >
        {/* SECȚIUNEA 1: Detalii Contract */}
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          <Typography variant="h6" sx={{ mb: 1.5, color: "primary.main" }}>
            Detalii Contract
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Typography variant="body2">
              <strong>Număr:</strong> {contract.nr_contract}
            </Typography>
            <Typography variant="body2">
              <strong>Data:</strong> {formatDate(contract.data_contract)}
            </Typography>
            <Typography variant="body2">
              <strong>Perioada:</strong> {contract.perioada_contract}
            </Typography>
            <Typography variant="body2">
              <strong>Nivel arendă:</strong> {contract.nivel_arenda}
            </Typography>
            <Typography variant="body2" sx={{ gridColumn: "1 / -1" }}>
              <strong>Observații:</strong> {contract.observatii || "-"}
            </Typography>
          </Box>
        </Paper>

        {/* SECȚIUNEA 2: Arendator */}
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          <Typography variant="h6" sx={{ mb: 1.5, color: "primary.main" }}>
            Arendator
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: { xs: 1, sm: 2 },
            }}
          >
            <Typography variant="body2">
              <strong>Nume:</strong> {contract.arendator.nume}
            </Typography>
            <Typography variant="body2">
              <strong>CNP:</strong> {contract.arendator.cnp || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Telefon:</strong> {contract.arendator.telefon || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Adresa:</strong> {contract.arendator.adresa || "-"}
            </Typography>
          </Box>
        </Paper>

        {/* SECȚIUNEA 3: Terenuri */}

        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          <Typography variant="h6" sx={{ mb: 1.5, color: "primary.main" }}>
            Terenuri ({contract.terenuri?.length || 0})
          </Typography>
          {contract.terenuri && contract.terenuri.length > 0 ? (
            <Box sx={{ display: "grid", gap: { xs: 1, sm: 1.5 } }}>
              {contract.terenuri.map((teren) => (
                <Paper
                  key={teren.id_teren}
                  variant="outlined"
                  sx={{ p: 1, bgcolor: "white" }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr", // Mobile: 1 coloană
                        sm: "1fr 1fr", // Tablet: 2 coloane
                        md: "1fr 1fr 1fr", // Desktop: 3 coloane
                      },
                      gap: { xs: 1.5, md: 3 },
                    }}
                  >
                    <Box>
                      <Typography variant="body2">
                        <strong>Act proprietate:</strong>{" "}
                        {teren.act_proprietate || "-"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nr. act:</strong>{" "}
                        {teren.nr_act_proprietate || "-"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Data act:</strong>{" "}
                        {teren.data_act_proprietate
                          ? formatDate(teren.data_act_proprietate)
                          : "-"}
                      </Typography>

                     
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        <strong>Suprafață:</strong>{" "}
                        {teren.suprafata ? `${teren.suprafata} ha` : "-"}
                      </Typography>

                      <Typography variant="body2">
                        <strong>Zona:</strong> {teren.zona_nume || "-"}
                      </Typography>
                       <Typography variant="body2">
                        <strong>Parcela:</strong> {teren.parcela || "-"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tarla:</strong> {teren.tarla || "-"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Categorie teren:</strong>{" "}
                        {teren.categorie_teren || "-"}
                      </Typography>
                     
                    </Box>
                    <Box>
                       <Typography variant="body2">
                        <strong>Vecin Nord:</strong> {teren.vecin_nord || "-"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Vecin Est:</strong> {teren.vecin_est || "-"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Vecin Sud:</strong> {teren.vecin_sud || "-"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Vecin Vest:</strong> {teren.vecin_vest || "-"}
                      </Typography>
                      
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
              Nu există terenuri asociate acestui contract.
            </Typography>
          )}
        </Paper>

        {/* SECȚIUNEA 4: Gestiune Arendă */}
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          <Typography variant="h6" sx={{ mb: 1.5, color: "primary.main" }}>
            Gestiune Arendă și Plăți
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/contracte/${contractId}/arenda`)}
            sx={{ mt: 1, width: { xs: "100%", sm: "auto" } }}
          >
            Adaugă Plată Arendă
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};
