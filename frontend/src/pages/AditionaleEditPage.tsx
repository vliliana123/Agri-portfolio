import React, { useState, useEffect, useContext } from "react";
import {
  getAditionaleDetails,
  updateAditional,
  formatDate
} from "../services/api";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { BreadcrumbContext } from "../context/BreadcrumbContext";

export const AditionaleEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { setBreadcrumbLabel } = useContext(BreadcrumbContext);
  const { id } = useParams<{ id: string }>();

  // Info contract (read-only, doar pentru afișare)
  const [contractInfo, setContractInfo] = useState<{
    nr_contract: string;
    data_contract: string;
    nume_arendator: string;
  } | null>(null);

  // Câmpuri editabile
  const [formData, setFormData] = useState({
    nr_aditional: "",
    data_aditional: "",
    perioada_aditional: "",
    nivel_arenda: 0,
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Încarcă datele aditionalului la mount
  useEffect(() => {
    const loadAditional = async () => {
      try {
        setLoadingData(true);
        setBreadcrumbLabel("");
        if (!id) {
          setError("ID aditional invalid");
          return;
        }
        const data = await getAditionaleDetails(Number(id));
        setFormData({
          nr_aditional: data.nr_aditional ?? "",
          data_aditional: data.data_aditional ?? "",
          perioada_aditional: data.perioada_aditional ?? "",
          nivel_arenda: data.nivel_arenda ?? 0,
        });
        setContractInfo({
          nr_contract: data.contract?.nr_contract ?? "-",
          data_contract: formatDate(data.contract?.data_contract) ?? "-",
          nume_arendator: data.contract?.arendator?.nume ?? "-",
        });
        setBreadcrumbLabel(`Aditional ${data.nr_aditional}`);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.error ||
          err?.message ||
          "Eroare la încărcarea aditionalului";
        setError(errorMsg);
        console.error("Eroare:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadAditional();
  }, [id, setBreadcrumbLabel]);

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.nr_aditional.trim())
      errors.push("Număr aditional obligatoriu");
    if (!formData.data_aditional.trim())
      errors.push("Data aditional obligatorie");
    if (!formData.perioada_aditional.trim())
      errors.push("Perioada obligatorie");
    if (formData.nivel_arenda <= 0)
      errors.push("Nivel arenda obligatoriu");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (!id) {
        setError("ID aditional invalid");
        return;
      }
      await updateAditional(Number(id), {
        nr_aditional: formData.nr_aditional,
        data_aditional: formData.data_aditional,
        perioada_aditional: formData.perioada_aditional,
        nivel_arenda: formData.nivel_arenda,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/aditionale");
      }, 2000);
    } catch (err: any) {
  let errorMsg = "Eroare la actualizarea aditionalului";
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === "object" && data !== null) {
      errorMsg = Object.entries(data)
        .map(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages.join(", ") : String(messages);
          return `${field}: ${msg}`;
        })
        .join("\n");
    } else if (typeof data === "string") {
      errorMsg = data;
    }
  } else if (err?.message) {
    errorMsg = err.message;
  }
  setError(errorMsg);
  console.error("Eroare:", err);
} finally {
  setLoading(false);
}
  
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });
    };

  if (loadingData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
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
      {/* Header */}
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
          onClick={() => navigate("/aditionale")}
          variant="outlined"
          disabled={loading}
        >
          Înapoi la Aditionale
        </Button>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            lineHeight: { xs: 1.3, sm: 1.2 },
          }}
        >
          Editare Aditional
        </Typography>
      </Box>

      {/* Success */}
      {success && (
        <Alert severity="success" sx={{ mb: 3, maxWidth: { xs: "100%", sm: "90%", md: "80%" } }}>
          Aditional actualizat cu succes! Redirectare în curs...
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: { xs: "100%", sm: "90%", md: "80%" } }}>
          {error}
        </Alert>
      )}

      <Box sx={{ maxWidth: { xs: "100%", sm: "90%", md: "80%" } }}>
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          <form onSubmit={handleSubmit}>
            {/* Info Contract (read-only) */}
            <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
              Contract asociat
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                gap: { xs: 2, md: 3 },
                mb: 3,
              }}
            >
              <TextField
                label="Arendator"
                value={contractInfo?.nume_arendator ?? "-"}
                fullWidth
                size="small"
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Nr Contract"
                value={contractInfo?.nr_contract ?? "-"}
                fullWidth
                size="small"
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Data Contract"
                value={ contractInfo?.data_contract ?? "-"}
                fullWidth
                size="small"
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Box>

            {/* Câmpuri editabile */}
            <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
              Detalii Aditional
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                gap: { xs: 2, md: 3 },
              }}
            >
              <TextField
                label="Nr Aditional"
                value={formData.nr_aditional}
                onChange={handleInputChange("nr_aditional")}
                fullWidth
                required
                size="small"
                variant="outlined"
                disabled={loading || loadingData}
              />
              <TextField
                label="Data Aditional"
                type="date"
                value={formData.data_aditional}
                onChange={handleInputChange("data_aditional")}
                fullWidth
                required
                size="small"
                variant="outlined"
                disabled={loading || loadingData}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Perioada Aditional"
                value={formData.perioada_aditional}
                onChange={handleInputChange("perioada_aditional")}
                fullWidth
                required
                size="small"
                variant="outlined"
                disabled={loading || loadingData}
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                label="Nivel Arenda"
                value={formData.nivel_arenda}
                onChange={handleInputChange("nivel_arenda")}
                fullWidth
                required
                size="small"
                variant="outlined"
                disabled={loading || loadingData}
              />
            </Box>

            {/* Butoane */}
            <Box sx={{ display: "flex", gap: 2, mt: 4, flexWrap: "wrap" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={loading || loadingData}
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                {loading ? "Se salvează..." : "Salvare Modificări"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/aditionale")}
                disabled={loading}
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                Anulare
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};
