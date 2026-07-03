import React, { useState } from "react";
import { AxiosError } from "axios";
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Radio,
  RadioGroup,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { getContracte, createAditional } from "../services/api";
import { useNavigate } from "react-router-dom";

export const AditionaleAddPage: React.FC = () => {
  const navigate = useNavigate();

  // Search contract
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Contractul selectat
  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  // Formular aditional
  const [formData, setFormData] = useState({
    nr_aditional: "",
    data_aditional: "",
    perioada_aditional: "",
    nivel_arenda: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setSearchError(null);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await getContracte(50, 0, term);
      setSearchResults(res.results || []);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Eroare la căutarea contractului";
      setSearchError(errorMsg);
      console.error("Eroare:", err);
      setSearchResults([]);
    }
  };

  const handleSelectContract = (contract: any) => {
    setSelectedContract(contract);
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedContract) {
      setError("Contract lipsă!");
      return;
    }
    if (!formData.nr_aditional.trim()) {
      setError("Număr aditional obligatoriu");
      return;
    }
    if (!formData.data_aditional.trim()) {
      setError("Data aditional obligatorie");
      return;
    }
    if (!formData.perioada_aditional.trim()) {
      setError("Perioada obligatorie");
      return;
    }
    if (!formData.nivel_arenda.trim()) {
      setError("Nivel arenda obligatoriu");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createAditional({
        id_contract: selectedContract.id_contract,
        nr_aditional: formData.nr_aditional,
        data_aditional: formData.data_aditional,
        perioada_aditional: formData.perioada_aditional,
        nivel_arenda: formData.nivel_arenda,
      });
      setSuccess(true);

      // Reset
      setFormData({
        nr_aditional: "",
        data_aditional: "",
        perioada_aditional: "",
        nivel_arenda: "",
      });
      setSelectedContract(null);
      setSearchTerm("");

      setTimeout(() => {
        navigate("/aditionale");
      }, 2000);
    } catch (err: any) {
      const axiosError = err as AxiosError<any>;
      let errorMessage = "Eroare la crearea aditionalului";
      if (axiosError?.response?.data) {
        const data = axiosError.response.data;
        errorMessage = Object.entries(data)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return messages.map((msg) => `${field}: ${msg}`).join("\n");
            } else {
              return `${field}: ${messages}`;
            }
          })
          .join("\n");
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: "#2c3e50", flex: 1 }}
        >
          Adaugă Adițional
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Adițional adăugat cu succes! Redirecționare...
        </Alert>
      )}
      {searchError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setSearchError(null)}>
          {searchError}
        </Alert>
      )}

      <Box sx={{ maxWidth: { xs: "100%", sm: "90%", md: "80%" } }}>
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          {/* Search contract */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            1. Selectare Contract
          </Typography>

          {!selectedContract ? (
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Caută contract (nr contract / nume / CNP)"
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ mb: 2 }}
              />

              {searchResults.length > 0 && (
                <Paper
                  sx={{
                    maxHeight: 250,
                    overflowY: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <RadioGroup value="" onChange={() => {}}>
                    {searchResults.map((item) => (
                      <Box
                        key={item.id_contract}
                        sx={{
                          p: 1.5,
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                        onClick={() => handleSelectContract(item)}
                      >
                        <Radio
                          checked={false}
                          onChange={() => handleSelectContract(item)}
                          size="small"
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Contract {item.nr_contract} / {item.data_contract}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Arendator: {item.arendator?.nume ?? "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </RadioGroup>
                </Paper>
              )}
            </Box>
          ) : (
            <Box
              sx={{ mb: 3, p: 2, backgroundColor: "#e8f5e9", borderRadius: 1 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1">
                  ✓ Contract selectat:{" "}
                  <strong>
                    {selectedContract.nr_contract} /{" "}
                    {selectedContract.data_contract}
                  </strong>{" "}
                  — {selectedContract.arendator?.nume ?? "N/A"}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setSelectedContract(null);
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                >
                  Schimbă
                </Button>
              </Box>
            </Box>
          )}

          {/* Formular Aditional */}
          {selectedContract !== null && (
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
                2. Date Adițional
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: { xs: 2, md: 3 },
                }}
              >
                <TextField
                  label="Număr Adițional"
                  fullWidth
                  size="small"
                  value={formData.nr_aditional}
                  onChange={(e) =>
                    setFormData({ ...formData, nr_aditional: e.target.value })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Data Adițional"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formData.data_aditional}
                  onChange={(e) =>
                    setFormData({ ...formData, data_aditional: e.target.value })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Perioada Adițional"
                  fullWidth
                  size="small"
                  value={formData.perioada_aditional}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      perioada_aditional: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Nivel Arendă"
                  fullWidth
                  size="small"
                  value={formData.nivel_arenda}
                  onChange={(e) =>
                    setFormData({ ...formData, nivel_arenda: e.target.value })
                  }
                  disabled={loading}
                />
              </Box>

              {/* Submit */}
              <Box sx={{ mt: 4, display: "flex", justifyContent: "left" }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/aditionale")}
                    disabled={loading}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    Anulează
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <Save />
                    }
                  >
                    {loading ? "Se salvează..." : "Adaugă Adițional"}
                  </Button>
                </Box>
              </Box>
            </form>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
