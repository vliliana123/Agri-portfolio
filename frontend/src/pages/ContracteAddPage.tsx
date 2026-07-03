import React, { useState } from "react";
import { AxiosError } from "axios";
import {
  Box,
  Button,
  Typography,
  InputLabel,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Radio,
  RadioGroup,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import {
  createContractWithTeren,
  getArendatori,
} from "../services/api";
import { TerenCreate, ContractCreate } from "../types";
import { useZone } from "../hooks/useZone";
import { useNavigate } from "react-router-dom";

export const ContracteAddPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [arendator, setArendator] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [idArendator, setIdArendator] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { zone } = useZone();
  // State separat pentru contract
  const [contractFormData, setContractFormData] = useState<
    Omit<ContractCreate, "id_arendator">
  >({
    nr_contract: "",
    data_contract: "",
    perioada_contract: "",
    nivel_arenda: "",
    observatii: "",
  });

  // State separat pentru teren (contract și arendator se setează la submit)
  const [terenFormData, setTerenFormData] = useState<
    Omit<TerenCreate, "contract" | "arendator"> & { zona: number | null }
  >({
    act_proprietate: "",
    nr_act_proprietate: "",
    data_act_proprietate: "",
    suprafata: "",
    tarla: "",
    parcela: "",
    categorie_teren: "arabil",
    vecin_nord: "",
    vecin_est: "",
    vecin_sud: "",
    vecin_vest: "",
    zona: null,
  });

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setSearchError(null);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await getArendatori(50, 0, term);
      setSearchResults(res.results);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Eroare la căutarea arendatorului";
      setSearchError(errorMsg);
      console.error("Eroare:", err);
      setSearchResults([]);
    }
  };

  const handleSelectArendator = (selectedArendator: any) => {
    setArendator(selectedArendator.nume);
    setIdArendator(selectedArendator.id_arendator);
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!idArendator) {
      setError("Arendator lipsă!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createContractWithTeren(
        idArendator,
        contractFormData,
        terenFormData,
      );
      setSuccess(true);

      // Reset formularelor
      setContractFormData({
        nr_contract: "",
        data_contract: "",
        perioada_contract: "",
        nivel_arenda: "",
        observatii: "",
      });
      setTerenFormData({
        act_proprietate: "",
        nr_act_proprietate: "",
        data_act_proprietate: "",
        suprafata: "",
        tarla: "",
        parcela: "",
        categorie_teren: "arabil",
        vecin_nord: "",
        vecin_est: "",
        vecin_sud: "",
        vecin_vest: "",
        zona: null,
      });
      setArendator(null);
      setIdArendator(null);
      setSearchTerm("");

      setTimeout(() => {
        navigate("/contracte/");
      }, 2000);
    } catch (error: any) {
      const axiosError = error as AxiosError<any>;
      let errorMessage = "Eroare la crearea contractului";
      if (axiosError?.response?.data) {
        const data = axiosError.response.data;
        // Afișează și numele câmpului la fiecare eroare
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
  // useEffect(() => {
  //   const loadZone = async () => {
  //     try {
  //       const zoneData = await getZone();
  //       setZone(zoneData);
  //     } catch (error) {
  //       console.error("Eroare la încărcare zone:", error);
  //     }
  //   };
  //   loadZone();
  // }, []);

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
          Adaugă Contract și Teren
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
          Contract și teren adăugate cu succes! Redirecționare...
        </Alert>
      )}
      {searchError && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          onClose={() => setSearchError(null)}
        >
          {searchError}
        </Alert>
      )}
      <Box sx={{ maxWidth: { xs: "100%", sm: "90%", md: "80%" } }}>
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          {/* Search arendator */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            1. Selectare Arendator
          </Typography>

          {!arendator ? (
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Caută arendator (nume/CNP)"
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
                  <RadioGroup value="" onChange={(e) => {}}>
                    {searchResults.map((item) => (
                      <Box
                        key={item.id_arendator}
                        sx={{
                          p: 1.5,
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                        onClick={() => handleSelectArendator(item)}
                      >
                        <Radio
                          checked={arendator === item.nume}
                          onChange={() => handleSelectArendator(item)}
                          size="small"
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.nume}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            CNP: {item.cnp}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </RadioGroup>
                </Paper>
              )}

              {searchError && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {searchError}
                </Alert>
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
                  ✓ Arendator selectat: <strong>{arendator}</strong>
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setArendator(null);
                    setIdArendator(null);
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                >
                  Schimbă
                </Button>
              </Box>
            </Box>
          )}

          {/* Formular Contract + Teren */}
          {arendator !== null && (
            <form onSubmit={handleSubmit}>
              {/* Contract datos */}
              <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
                2. Date Contract
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr", // Single column vertical
                  gap: { xs: 2, md: 3 },
                }}
              >
                <TextField
                  label="Număr Contract"
                  fullWidth
                  size="small"
                  value={contractFormData.nr_contract}
                  onChange={(e) =>
                    setContractFormData({
                      ...contractFormData,
                      nr_contract: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Data Contract"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={contractFormData.data_contract}
                  onChange={(e) =>
                    setContractFormData({
                      ...contractFormData,
                      data_contract: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Perioada Contract"
                  fullWidth
                  size="small"
                  value={contractFormData.perioada_contract}
                  onChange={(e) =>
                    setContractFormData({
                      ...contractFormData,
                      perioada_contract: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Nivel Arendă"
                  fullWidth
                  size="small"
                  value={contractFormData.nivel_arenda}
                  onChange={(e) =>
                    setContractFormData({
                      ...contractFormData,
                      nivel_arenda: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Observații"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={contractFormData.observatii}
                  onChange={(e) =>
                    setContractFormData({
                      ...contractFormData,
                      observatii: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </Box>

              {/* Teren  */}
              <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
                3. Date Teren
              </Typography>

              {/* Act group */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr", // Single column vertical
                  gap: { xs: 2, md: 3 },
                }}
              >
                <TextField
                  label="Act Proprietate"
                  fullWidth
                  size="small"
                  value={terenFormData.act_proprietate}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      act_proprietate: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Număr Act"
                  fullWidth
                  size="small"
                  value={terenFormData.nr_act_proprietate}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      nr_act_proprietate: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Data Act"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={terenFormData.data_act_proprietate ?? ""}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      data_act_proprietate: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                {/* Suprafata group */}

                <TextField
                  label="Suprafață"
                  fullWidth
                  size="small"
                  value={terenFormData.suprafata}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      suprafata: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Parcela"
                  fullWidth
                  size="small"
                  value={terenFormData.parcela}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      parcela: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Tarla"
                  fullWidth
                  size="small"
                  value={terenFormData.tarla}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      tarla: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <FormControl fullWidth size="small" disabled={loading}>
                  <InputLabel>Zonă</InputLabel>
                  <Select
                    value={terenFormData.zona ?? ""}
                    label="Zonă"
                    onChange={(e) =>
                      setTerenFormData({
                        ...terenFormData,
                        zona: Number(e.target.value),
                      })
                    }
                  >
                    {zone.map((z) => (
                      <MenuItem key={String(z.id_zona)} value={z.id_zona}>
                        {z.nume}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Categorie"
                  fullWidth
                  size="small"
                  value={terenFormData.categorie_teren}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      categorie_teren: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                {/* Vecini group */}

                <TextField
                  label="Vecin Nord"
                  fullWidth
                  size="small"
                  value={terenFormData.vecin_nord}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      vecin_nord: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Vecin Est"
                  fullWidth
                  size="small"
                  value={terenFormData.vecin_est}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      vecin_est: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Vecin Sud"
                  fullWidth
                  size="small"
                  value={terenFormData.vecin_sud}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      vecin_sud: e.target.value,
                    })
                  }
                  disabled={loading}
                />

                <TextField
                  label="Vecin Vest"
                  fullWidth
                  size="small"
                  value={terenFormData.vecin_vest}
                  onChange={(e) =>
                    setTerenFormData({
                      ...terenFormData,
                      vecin_vest: e.target.value,
                    })
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
                    onClick={() => navigate("/contracte")}
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
                    {loading ? "Se salvează..." : "Adaugă Contract și Teren"}
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
