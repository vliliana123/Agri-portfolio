import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import {
  Box,
  Typography,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import {
  createArendator,
  createArendatorWithContractAndTeren,
} from "../services/api";
import { useZone } from "../hooks/useZone";

export const ArendatoriAddPage: React.FC = () => {
  const [formData, setFormData] = useState({
    // Arendator fields
    nume: "",
    adresa: "",
    cnp: "",
    ci_serie: "",
    ci_nr: "",
    ci_el: "", // CI eliberare
    ci_data: "", // CI data
    telefon: "",

    //Contract fields (dacă e cazul de adăugat teren împreună
    adaugaContract: false,
    contractData: {
      nr_contract: "",
      data_contract: "", //format dd.mm.yyyy
      perioada_contract: "",
      nivel_arenda: "",
      observatii: "",
    },
    terenData: {
      act_proprietate: "",
      nr_act_proprietate: "",
      data_act_proprietate: "",
      suprafata: "",
      tarla: "",
      parcela: "",
      zona: "" as any, // ID zonă din dropdown (string în state, conversie la submit)
      vecin_nord: "",
      vecin_sud: "",
      vecin_est: "",
      vecin_vest: "",
      categorie_teren: "arabil", // Valoare implicită
    },
  });
  const shouldFetchZones = formData.adaugaContract;
  const { zone } = useZone(shouldFetchZones);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.nume.trim()) errors.push("Numele este obligatoriu");
    if (!formData.cnp.trim()) errors.push("CNP-ul este obligatoriu");
    if (isNaN(Number(formData.cnp))) 
      errors.push("CNP-ul trebuie să fie numeric");
    if (!formData.ci_serie.trim()) errors.push("Seria CI este obligatorie");
    if (!formData.ci_nr.trim()) errors.push("Numărul CI este obligatoriu");
    //if (!formData.telefon.trim()) errors.push("Telefonul este obligatoriu");
    if (!formData.adresa.trim()) errors.push("Adresa este obligatorie");

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

      if (formData.adaugaContract) {
        await createArendatorWithContractAndTeren(
          formData,
          formData.contractData,
          formData.terenData,
        );
      } else {
        await createArendator(formData);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate("/arendatori");
      }, 3000);
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      let errorMessage = "Eroare la crearea arendatorului";

      if (axiosError?.response?.data) {
          const data = axiosError.response.data;
          
          // DRF returnează: {"cnp": ["mesaj"], "nume": ["mesaj"], etc}
          // Extrage primul mesaj din primul câmp cu eroare
           errorMessage = Object.values(data).flat().join('\n');
  }
  setError(errorMessage);
  console.error("Eroare:", err);
} finally {
  setLoading(false);
}
        };

  // Handle input changes
  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });
    };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        minHeight: { xs: "auto", sm: "100vh" },
        p: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
  
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
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            lineHeight: { xs: 1.3, sm: 1.2 },
          }}
        >
          Adăugare Arendator Nou
        </Typography>
      </Box>

      <Box sx={{ maxWidth: { xs: "100%", sm: "90%", md: "80%" } }}>
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          <form onSubmit={handleSubmit}>
            {/* Layout  */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr", // ← Single column vertical
                gap: { xs: 2, md: 3 },
              }}
            >
              {/* Coloana 1: Informații Personale */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, color: "text.secondary", fontWeight: "bold" }}
                >
                  Informații Personale
                </Typography>
                <TextField
                  fullWidth
                  label="Nume"
                  name="nume"
                  value={formData.nume}
                  onChange={handleInputChange("nume")}
                  required
                  disabled={loading}
                  size="small"
                  sx={{ mb: 2 }}
                  error={!formData.nume.trim() && error !== null}
                />

                <TextField
                  fullWidth
                  label="Adresa"
                  name="adresa"
                  value={formData.adresa}
                  onChange={handleInputChange("adresa")}
                  required
                  disabled={loading}
                  size="small"
                  sx={{ mb: 2 }}
                  error={!formData.adresa.trim() && error !== null}
                />
                <TextField
                  fullWidth
                  label="Telefon"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleInputChange("telefon")}
                  sx={{ mb: 2 }}
                  size="small"
                  disabled={loading}
                  error={!formData.telefon.trim() && error !== null}
                />

                {/*   Informații CI */}

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, color: "text.secondary", fontWeight: "bold" }}
                >
                  Act Identitate
                </Typography>

                <TextField
                  label="CNP"
                  name="cnp"
                  value={formData.cnp}
                  onChange={handleInputChange("cnp")}
                  required
                  disabled={loading}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="CI Serie"
                  value={formData.ci_serie}
                  required
                  onChange={handleInputChange("ci_serie")}
                  disabled={loading}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="CI Nr"
                  name="ci_nr"
                  value={formData.ci_nr}
                  onChange={handleInputChange("ci_nr")}
                  required
                  disabled={loading}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  error={!formData.ci_nr.trim() && error !== null}
                />
                <TextField
                  label="CI Eliberare"
                  name="ci_el"
                  value={formData.ci_el}
                  onChange={handleInputChange("ci_el")}
                  required
                  disabled={loading}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  error={!formData.ci_el.trim() && error !== null}
                />
                <TextField
                  label="CI Data"
                  name="ci_data"
                  value={formData.ci_data}
                  type="date"
                  onChange={handleInputChange("ci_data")}
                  required
                  disabled={loading}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.adaugaContract}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adaugaContract: e.target.checked,
                        })
                      }
                      disabled={loading}
                    />
                  }
                  label="Adăugați contract"
                />
              </Box>
            </Box>
            <Box>
              {/* Contract Section */}

              {formData.adaugaContract && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main", mt: 4 }}
                  >
                    Informații Contract
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr", // ← Single column vertical
                      gap: { xs: 2, md: 3 },
                    }}
                  >
                    {/* Număr Contract */}
                    <TextField
                      label="Număr Contract"
                      name="nr_contract"
                      value={formData.contractData.nr_contract}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractData: {
                            ...formData.contractData,
                            nr_contract: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Data Contract */}
                    <TextField
                      label="Data Contract"
                      name="data_contract"
                      type="date"
                      value={formData.contractData.data_contract}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractData: {
                            ...formData.contractData,
                            data_contract: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                      placeholder="dd.mm.yyyy"
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Perioada Contract */}
                    <TextField
                      label="Perioada Contract (ani)"
                      name="perioada_contract"
                      type="number"
                      value={formData.contractData.perioada_contract}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractData: {
                            ...formData.contractData,
                            perioada_contract: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Nivel Arendă */}
                    <TextField
                      label="Nivel Arendă (kg/ha)"
                      name="nivel_arenda"
                      value={formData.contractData.nivel_arenda}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractData: {
                            ...formData.contractData,
                            nivel_arenda: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Zona - Dropdown */}
                    <FormControl
                      fullWidth
                      required
                      size="small"
                      disabled={loading}
                    >
                      <InputLabel>Zonă</InputLabel>
                      <Select
                        value={formData.terenData.zona}
                        label="Zonă"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            terenData: {
                              ...formData.terenData,
                              zona: e.target.value as any,
                            },
                          })
                        }
                      >
                        {zone.map((z) => (
                          <MenuItem key={z.id_zona} value={z.id_zona}>
                            {z.nume}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              )}

              {formData.adaugaContract && (
                <>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main", mt: 4 }}
                  >
                    Informații Teren
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: { xs: 2, md: 3 },
                    }}
                  >
                    {/* Act Proprietate */}
                    <TextField
                      label="Act Proprietate"
                      name="act_proprietate"
                      value={formData.terenData.act_proprietate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            act_proprietate: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />
                    {/* Nr. Act Proprietate -  */}
                    <TextField
                      label="Nr. Act Proprietate"
                      name="nr_act_proprietate"
                      value={formData.terenData.nr_act_proprietate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            nr_act_proprietate: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />
                    {/* Data Act Proprietate */}
                    <TextField
                      label="Data Act Proprietate"
                      name="data_act_proprietate"
                      type="date"
                      value={formData.terenData.data_act_proprietate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            data_act_proprietate: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      size="small"
                      variant="outlined"
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Suprafață */}
                    <TextField
                      label="Suprafață (ha)"
                      name="suprafata"
                      type="number"
                      value={formData.terenData.suprafata}
                     onChange={(e) => setFormData({ ...formData, terenData: { ...formData.terenData, suprafata: e.target.value } })}
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Tarla */}
                    <TextField
                      label="Tarla"
                      name="tarla"
                      value={formData.terenData.tarla}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            tarla: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Parcela */}
                    <TextField
                      label="Parcela"
                      name="parcela"
                      value={formData.terenData.parcela}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            parcela: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Vecin Nord */}
                    <TextField
                      label="Vecin Nord"
                      name="vecin_nord"
                      value={formData.terenData.vecin_nord}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            vecin_nord: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Vecin Sud */}
                    <TextField
                      label="Vecin Sud"
                      name="vecin_sud"
                      value={formData.terenData.vecin_sud}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            vecin_sud: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Vecin Est */}
                    <TextField
                      label="Vecin Est"
                      name="vecin_est"
                      value={formData.terenData.vecin_est}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            vecin_est: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Vecin Vest */}
                    <TextField
                      label="Vecin Vest"
                      name="vecin_vest"
                      value={formData.terenData.vecin_vest}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            vecin_vest: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Categorie Teren */}
                    <TextField
                      label="Categorie Teren"
                      name="categorie_teren"
                      value={formData.terenData.categorie_teren}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terenData: {
                            ...formData.terenData,
                            categorie_teren: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      disabled={loading}
                    />

                    {/* Observații - ocupă 2 coloane */}
                    <TextField
                      label="Observații"
                      name="observatii"
                      value={formData.contractData.observatii}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractData: {
                            ...formData.contractData,
                            observatii: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      variant="outlined"
                      disabled={loading}
                      sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}
                    />
                  </Box>
                </>
              )}
            </Box>

            {/* Footer cu butoane */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                mt: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/arendatori")}
                disabled={loading}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                {loading ? "Se salvează..." : "Salvează Arendator"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Snackbar for Success */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: "100%", fontSize: "1rem", fontWeight: "bold" }}
        >
          ✅ Arendator {formData.adaugaContract ? "cu contract și teren" : ""}{" "}
          creat cu succes!
        </Alert>
      </Snackbar>

      {/* Snackbar for Error */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};
